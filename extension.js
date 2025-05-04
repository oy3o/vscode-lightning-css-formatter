// extension.js
const vscode = require('vscode');
const { transform } = require('lightningcss');

// 插件激活时调用的函数
function activate(context) {
    console.log('Extension "lightning-css-formatter" is now active!');

    // 注册新的命令 ID
    let disposable = vscode.commands.registerCommand('lightning-css-formatter.formatAndMerge', async () => {
        const editor = vscode.window.activeTextEditor;

        if (!editor) {
            vscode.window.showWarningMessage('No active editor found.');
            return;
        }

        const document = editor.document;

        if (document.languageId !== 'css') {
            vscode.window.showWarningMessage('This command only works on CSS files.');
            return;
        }

        const originalText = document.getText();
        if (!originalText.trim()) {
            vscode.window.showInformationMessage('CSS file is empty.');
            return;
        }

        try {
            // 使用 Lightning CSS 进行转换，但不压缩
            let { code } = transform({
                filename: document.fileName, // 提供文件名有助于 source maps (如果启用) 和错误报告
                code: Buffer.from(originalText),
                minify: false,
                // Lightning CSS 默认会进行一些优化，包括合并属性
                // 如果需要更精细控制，可以查看 `cssModules`, `unusedSymbols`, `drafts` 等选项
                // 例如，启用最新的草案特性可能会影响合并逻辑
                drafts: {
                    customMedia: true
                },
                // sourceMap: false, // 通常格式化不需要 source map
            });

            // 将结果 (Buffer) 转换回字符串
            const formattedCss = code.toString();

            // 如果格式化后的代码与原始内容相同，则无需编辑
            if (formattedCss === originalText) {
                vscode.window.showInformationMessage('CSS is already formatted and optimized.');
                return;
            }

            // 替换整个文档的内容
            const firstLine = document.lineAt(0);
            const lastLine = document.lineAt(document.lineCount - 1);
            const fullRange = new vscode.Range(firstLine.range.start, lastLine.range.end);

            await editor.edit(editBuilder => {
                editBuilder.replace(fullRange, formattedCss);
            });

            // 更新成功提示信息
            vscode.window.showInformationMessage('CSS formatted and shorthands merged successfully using Lightning CSS!');

        } catch (error) {
            console.error("Lightning CSS Error:", error);
            let errorMessage = `Lightning CSS Formatting Error: ${error.message || 'Unknown error'}`;
            if (error.source && error.loc) {
                errorMessage += ` at line ${error.loc.line}, column ${error.loc.column}`;
            }
            // 检查是否有更具体的错误信息，例如解析错误的位置
            if (error.data && error.data.loc) {
                errorMessage += ` near line ${error.data.loc.line}, column ${error.data.loc.column}`;
            }
            vscode.window.showErrorMessage(errorMessage);
        }
    });

    context.subscriptions.push(disposable);
}

function deactivate() { }

module.exports = {
    activate,
    deactivate
}