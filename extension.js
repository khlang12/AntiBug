const vscode = require('vscode');
const fs = require('fs').promises; // fs.promises 모듈 추가

let treeView;
let currentPanel;

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
    console.log('Congratulations, your extension "AntiBug" is now active!');

    //////////////// Status Bar ////////////////

    // StatusBar 아이콘 생성 >>>>>실패했어<<<<<< 왠지 모르겠네ㅜㅜ
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
    statusBarItem.text = '$(my-icon)';
    statusBarItem.tooltip = 'AntiBug project from AntiBug';
    statusBarItem.command = '';     // 아이콘 누르면 어떤 명령 실행될지

    // 이거 왜 안 되냐고!!!!!!!!!!1
    console.log('###### statusBarItem.text ######', statusBarItem.text);

    // StatusBar 아이콘을 추가
    statusBarItem.show();



    //////////////// Primary Sidebar ////////////////

    // Primary Sidebar - [1] Testing 토글
    class TestingDataProvider {
        getTreeItem(element) {
            console.log('Testing getChildren called');
            return element;
        }
    
        getChildren() {
            console.log('Testing getChildren called');
            return [
                new vscode.TreeItem('Chain'),
                new vscode.TreeItem('Address'),
                new vscode.TreeItem('Gas Limit'),
                new vscode.TreeItem('Value'),
                new vscode.TreeItem('Contract')
            ];
        }
    }

    // Primary Sidebar - [1] Testing 토글 - 트리뷰
    if (treeView) {
        treeView.dispose();
        treeView = undefined;
    } else {
        treeView = vscode.window.createTreeView('testing', {
            treeDataProvider: new TestingDataProvider(),
            showCollapseAll: true
        });
    }

    // Primary Sidebar - [2] Security Analysis 토글
    class SecurityAnalysisDataProvider {
        getTreeItem(element) {
            console.log('Security getTreeItem called:', element.label);
            return element;
        }
    
        getChildren() {
            console.log('Security getChildren called');
            return [
                new vscode.TreeItem('Applicable rule'),
                new vscode.TreeItem('Print Type'),
                new vscode.TreeItem('Analysis'),
                new vscode.TreeItem('Audit Report')
            ];
        }
    }

    // Primary SideBar - [2] Security Analysis 토글 - 트리뷰
    if (treeView) {
        treeView.dispose();
        treeView = undefined;
    } else {
        treeView = vscode.window.createTreeView('security-analysis', {
            treeDataProvider: new SecurityAnalysisDataProvider(),
            showCollapseAll: true
        });
    }



    //////////////// Command ////////////////


    // "AntiBug.testing" Command 등록
    let disposable = vscode.commands.registerCommand('AntiBug.testing', async function () {

        // message 팝업 띄우기
        vscode.window.showInformationMessage('Start AntiBug project from AntiBug!');

        if (currentPanel) {
            // 이미 current panel이 있다면, 2번째 panel 열기
            currentPanel.reveal(vscode.ViewColumn.Two);
        } else {
            // 아니라면, 새 패널 열기
            currentPanel = vscode.window.createWebviewPanel(
                'ResultView', // View ID
                '[1] Testing', // View 제목
                vscode.ViewColumn.Two, // 오른쪽에 분리된 패널로 열릴 위치
                {
                    enableScripts: true // 웹페이지 스크립트 사용 가능
                }
            );

            // View에 HTML 콘텐츠 설정
            try {
                const htmlContent = await getWebviewContent(context);
                currentPanel.webview.html = htmlContent;
            } catch (error) {
                console.error('Error loading HTML content:', error);
            }

            // Reset when the current panel is closed
            currentPanel.onDidDispose(() => {
                currentPanel = undefined;
            });
        }
    });

    // "AntiBug.security-analysis" Command 등록


    // "AntiBug.openai" Command 등록


    context.subscriptions.push(disposable, statusBarItem);
}

async function getWebviewContent(context) {
    // 외부 HTML 파일 경로 (testing.html 파일이 extension 루트에 있는 경우)
    const htmlFilePath = vscode.Uri.file(context.extensionPath + '/testing.html');

    // 파일을 읽어서 HTML 내용을 반환
    try {
        const data = await fs.readFile(htmlFilePath.fsPath);
        return data.toString();
    } catch (error) {
        throw error;
    }
}

// This method is called when your extension is deactivated
function deactivate() {
    if (currentPanel) {
        currentPanel.dispose();
    }
}

module.exports = {
    activate,
    deactivate,
};
