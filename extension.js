const vscode = require('vscode');
const fs = require('fs').promises; // fs.promises 모듈 추가

let treeView;
let currentPanel;           // 현재 탭을 위한 패널 변수
let deployPanel;            // deploy 탭을 위한 패널 변수
let securityAnalysisPanel;  // security-analysis 탭을 위한 패널 변수

/**
 * @param {vscode.ExtensionContext} context
 */



//////////////// activate ////////////////


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

    // Primary Sidebar - [1] Deploy 토글
    class DeployDataProvider {
        getTreeItem(element) {
            console.log('Deploy getChildren called');
            return element;
        }

        getChildren() {
            console.log('Deploy getChildren called');
            return [
                new vscode.TreeItem('Chain'),
                new vscode.TreeItem('Address'),
                new vscode.TreeItem('Gas Limit'),
                new vscode.TreeItem('Value'),
                new vscode.TreeItem('Contract')
            ];
        }
    }

    // Primary Sidebar - [1] Deploy 토글 - 트리뷰
    if (treeView) {
        treeView.dispose();
        treeView = undefined;
    } else {
        treeView = vscode.window.createTreeView('deploy', {
            treeDataProvider: new DeployDataProvider(),
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

    // [1] "AntiBug.deploy" Command 등록
    let deployCommand = vscode.commands.registerCommand('AntiBug.deploy', async function () {

        // message 팝업 띄우기
        vscode.window.showInformationMessage('Start AntiBug Deploy!');

        if (deployPanel) {
            // 이미 deploy 패널이 있다면, 2번째 panel 열기
            deployPanel.reveal(vscode.ViewColumn.Two);
        } else {
            // 아니라면, 새 패널 열기
            deployPanel = vscode.window.createWebviewPanel(
                'ResultView', // View ID
                '[1] Deploy', // View 제목
                vscode.ViewColumn.Two, // 오른쪽에 분리된 패널로 열릴 위치
                {
                    enableScripts: true // 웹페이지 스크립트 사용 가능
                }
            );

            // View에 HTML 콘텐츠 설정
            try {
                const htmlContent = await getWebviewContent(context, 'AntiBug.deploy');
                deployPanel.webview.html = htmlContent;
            } catch (error) {
                console.error('Error loading HTML content:', error);
            }

            // Reset when the deploy panel is closed
            deployPanel.onDidDispose(() => {
                deployPanel = undefined;
            });
        }
    });

    // [2] "AntiBug.security-analysis" Command 등록
    let securityAnalysisCommand = vscode.commands.registerCommand('AntiBug.security-analysis', async function () {

        // message 팝업 띄우기
        vscode.window.showInformationMessage('Start AntiBug Security Analysis!');

        if (securityAnalysisPanel) {
            // 이미 security-analysis 패널이 있다면, 2번째 panel 열기
            securityAnalysisPanel.reveal(vscode.ViewColumn.Two);
        } else {
            // 아니라면, 새 패널 열기
            securityAnalysisPanel = vscode.window.createWebviewPanel(
                'ResultView', // View ID
                '[2] Security Analysis', // View 제목
                vscode.ViewColumn.Two, // 오른쪽에 분리된 패널로 열릴 위치
                {
                    enableScripts: true // 웹페이지 스크립트 사용 가능
                }
            );

            // View에 HTML 콘텐츠 설정
            try {
                const htmlContent = await getWebviewContent(context, 'AntiBug.security-analysis');
                securityAnalysisPanel.webview.html = htmlContent;
            } catch (error) {
                console.error('Error loading HTML content:', error);
            }

            // Reset when the security-analysis panel is closed
            securityAnalysisPanel.onDidDispose(() => {
                securityAnalysisPanel = undefined;
            });
        }
    });


    context.subscriptions.push(deployCommand, statusBarItem);
    context.subscriptions.push(securityAnalysisCommand, statusBarItem);
}



//////////////// HTML ////////////////


// Webview 경로에 따른 HTML 페이지
async function getWebviewContent(context, command) {
    let htmlFilePath;

    // Command에 따른 HTML 페이지
    if (command === 'AntiBug.deploy') {
        htmlFilePath = vscode.Uri.file(context.extensionPath + '/deploy.html');
    } else if (command === 'AntiBug.security-analysis') {
        htmlFilePath = vscode.Uri.file(context.extensionPath + '/security-analysis.html');
    } else {
        // 기본 HTML 파일 (예: testing.html)을 로드하거나, 다른 명령 처리 방법을 추가하세요.
        htmlFilePath = vscode.Uri.file(context.extensionPath + '/deploy.html');
    }

    // 파일을 읽어서 HTML 내용을 반환
    try {
        const data = await fs.readFile(htmlFilePath.fsPath);
        return data.toString();
    } catch (error) {
        throw error;
    }
}


//////////////// deactivate ////////////////


function deactivate() {
    if (currentPanel) {
        currentPanel.dispose();
    }
}

module.exports = {
    activate,
    deactivate,
};
