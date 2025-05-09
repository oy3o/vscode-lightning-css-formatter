const vscode = require('vscode')
const { transform } = require('lightningcss')

// 辅助函数：使用 Lightning CSS 转换和格式化 CSS 文本
// 此函数是同步的，因为 lightningcss.transform 是同步的。
/**
 * 使用 Lightning CSS 转换和格式化 CSS 文本。
 * @param {string} originalText 原始 CSS 文本。
 * @param {string} fileName 文件名，用于错误报告和潜在的 source map（尽管在此处禁用）。
 * @param {object} [customTransformOptions={}] 自定义的 Lightning CSS 转换选项。
 * @returns {string} 格式化后的 CSS 字符串。
 * @throws {Error} 如果 Lightning CSS 处理失败，则抛出错误。
 */
function formatCssWithLightning(originalText, fileName, customTransformOptions = {}) {
    // 基础的 Lightning CSS 转换选项
    const baseOptions = {
        filename: fileName,                     // 文件名对错误报告很重要
        code: Buffer.from(originalText),        // CSS 内容需要是 Buffer 类型
        minify: false,                          // 我们需要的是格式化，而不是压缩
        sourceMap: false,                       // 格式化通常不需要 source map
        // Lightning CSS 默认会进行一些优化，包括合并属性、排序等
        // drafts 用于启用 CSS 草案特性，例如：
        drafts: {
            customMedia: true,                  // 启用自定义媒体查询 (CSS Media Queries Level 5)
            // nesting: true,                   // 如果需要，可以启用 CSS Nesting (默认可能已部分支持，具体看版本)
        },
        // errorRecovery: false,                // 默认为 false，遇到解析错误时抛出。可设为 true 尝试恢复。
        // targets: {},                         // 可以指定浏览器目标以进行更精确的优化，但格式化时通常不必要
        // analyzeDependencies: false,          // 格式化时不需要分析 @import 依赖
        // cssModules: false,                   // CSS Modules 处理，格式化时通常不需要
    }

    // 合并自定义选项，允许它们覆盖基础选项
    const finalOptions = { ...baseOptions, ...customTransformOptions }

    let { code } /*, map */ = transform(finalOptions)   // 执行转换
    return code.toString()                              // 将结果 (Buffer) 转换回字符串
}

// 插件激活时调用的函数
function activate(context) {
    console.log('Extension "lightning-css-formatter" Activated!')

    // 注册命令 "lightning-css-formatter.formatAndMerge"
    let commandDisposable = vscode.commands.registerCommand('lightning-css-formatter.formatAndMerge', async () => {
        const editor = vscode.window.activeTextEditor // 获取当前活动的编辑器

        if (!editor) {
            vscode.window.showWarningMessage('No activated editor found.')
            return
        }

        const document = editor.document // 获取当前编辑器中的文档

        if (document.languageId !== 'css') {
            vscode.window.showWarningMessage('lightning-css-formatter only support CSS.')
            return
        }

        const originalText = document.getText() // 获取文档的全部文本内容
        if (!originalText.trim()) {
            return
        }

        try {
            // CSS 格式化
            const formattedCss = formatCssWithLightning(originalText, document.fileName)

            // 如果格式化后的代码与原始内容相同，则无需编辑
            if (formattedCss === originalText) {
                return
            }

            // 计算文档的完整范围以进行替换
            const firstLine = document.lineAt(0)
            const lastLine = document.lineAt(document.lineCount - 1)
            const fullRange = new vscode.Range(firstLine.range.start, lastLine.range.end)

            // 应用编辑，替换整个文档内容
            await editor.edit(editBuilder => {
                editBuilder.replace(fullRange, formattedCss)
            })

            vscode.window.showInformationMessage('Lightning CSS Successfully!')

        } catch (error) {
            // 捕获并处理 Lightning CSS 可能抛出的错误
            console.error("Lightning CSS Error:", error)
        }
    })

    // 注册 CSS 文件的文档格式化提供器
    let formatterDisposable = vscode.languages.registerDocumentFormattingEditProvider('css', {
        async provideDocumentFormattingEdits(document, options, token) {
            // `options` 参数包含 tabSize, insertSpaces 等，但 Lightning CSS 有自己的格式化风格，
            // 且其 `transform` API 不直接消费这些选项来调整输出。
            // `token` 用于检查格式化操作是否已被取消。

            const originalText = document.getText()

            if (!originalText.trim()) {
                return [] // 对于空文件或只包含空白字符的文件，不进行任何操作
            }

            // 检查操作是否在开始处理前就被取消
            if (token.isCancellationRequested) {
                console.log(`Lightning CSS Canceled (File: ${document.fileName}).`)
                return undefined // 返回 undefined 表示操作被取消或失败
            }

            try {
                // 使用辅助函数进行 CSS 格式化
                // 此处可以传递从 VS Code 配置中获取的自定义选项, 例如：
                // const config = vscode.workspace.getConfiguration('lightning-css-formatter')
                // const customOpts = config.get('transformOptions') || {}
                const formattedCss = formatCssWithLightning(originalText, document.fileName, {}) // 暂时使用空对象

                // 检查操作是否在处理完成后被取消
                if (token.isCancellationRequested) {
                    console.log(`Lightning CSS Canceled (File: ${document.fileName}).`)
                    return undefined // 返回 undefined 表示操作被取消或失败
                }

                // 如果格式化后的内容与原始内容相同，则返回空数组表示无需更改
                if (formattedCss === originalText) {
                    return []
                }

                // 创建一个替换整个文档内容的 TextEdit
                const firstLine = document.lineAt(0)
                const lastLine = document.lineAt(document.lineCount - 1)
                const fullRange = new vscode.Range(firstLine.range.start, lastLine.range.end)

                return [vscode.TextEdit.replace(fullRange, formattedCss)]

            } catch (error) {
                // 对于格式化提供器，错误通常记录到控制台，而不是用弹窗打扰用户
                console.error(`Lightning CSS Error (File: ${document.fileName}):`, error) // 记录原始错误

                // 返回 undefined 表示格式化失败，VS Code 通常会有适当的提示 (例如，状态栏消息)
                return undefined
            }
        }
    })

    // 将命令和格式化提供器注册到插件的订阅中，以便在插件停用时被正确清理
    context.subscriptions.push(commandDisposable, formatterDisposable)
}

// 插件停用时调用的函数 (目前为空，但保留结构以便未来扩展)
function deactivate() { }

module.exports = {
    activate,
    deactivate
}