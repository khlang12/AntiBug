const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const markdownIt = require('markdown-it');
const md = markdownIt();

let treeView;
let deployPanel;
let securityAnalysisPanel;
let solfilePanel;
let TestPanel;
let AuditReportPanel;

function activate(context) {

    module.exports = {
        extendMarkdownIt: function(md) {
            return md.use(require('markdown-it-emoji'));
        }
    };
    

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



    ////////////////// Command //////////////////

    // [1] "AntiBug.deploy" Command 등록
    const deployCommand = vscode.commands.registerCommand('AntiBug.deploy', () => {
        openDeployPanel(context);
    });

    // [2] "AntiBug.securityanalysis" Command 등록
    const securityAnalysisCommand = vscode.commands.registerCommand('AntiBug.securityanalysis', () => {
        openSecurityAnalysisPanel(context);
    });

    // [3] "AntiBug.solfile" Command 등록
    const solfileCommand = vscode.commands.registerCommand('AntiBug.solfile', () => {
        openSolfileWebview();
    });

    // [4] "AntiBug.test" Command 등록
    const testCommand = vscode.commands.registerCommand('AntiBug.test', () => {
        openTestPanel(context);
    });

    // [5] "AntiBug.auditreport" Command 등록
    const auditreportCommand = vscode.commands.registerCommand('AntiBug.auditreport', () => {
        openAuditReportPanel(context);
    })

    context.subscriptions.push(deployCommand, securityAnalysisCommand, solfileCommand, testCommand, auditreportCommand);

    // 초기 워크스페이스 열기
    openSolfileWebview();
}



////////////////// Function //////////////////

////// Webview 경로에 따른 HTML 페이지 연결
async function getWebviewContent(context, command) {
    let htmlFilePath;
    let markdownFilePath;

    // Command에 따른 HTML 페이지
    if (command === 'AntiBug.deploy') {
        htmlFilePath = vscode.Uri.file(context.extensionPath + '/pages/deploy.html');
    } else if (command === 'AntiBug.securityanalysis') {
        htmlFilePath = vscode.Uri.file(context.extensionPath + '/pages/security-analysis.html');
    } else if (command === 'AntiBug.test') {
        htmlFilePath = vscode.Uri.file(context.extensionPath + '/pages/test.html');
    } else if (command === 'AntiBug.auditreport') {
        markdownFilePath = vscode.Uri.file(context.extensionPath + '/pages/auditreport.md');

        try {
            const markdownContent = await fs.readFileSync(markdownFilePath.fsPath, 'utf-8');
            return md.render(markdownContent);
        } catch (error) {
            throw error;
        }
    } else {
        htmlFilePath = vscode.Uri.file(context.extensionPath + '/pages/test.html');
    }

    // 파일을 읽어서 HTML 내용을 반환
    try {
        const data = await fs.promises.readFile(htmlFilePath.fsPath);
        return data.toString();
    } catch (error) {
        throw error;
    }
}

// [1] "AntiBug.deploy" Command의 동작
async function openDeployPanel(context) {

    // message 팝업 띄우기
    vscode.window.showInformationMessage('Start AntiBug Deploy!');

    // deploy.html 띄우기
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

        //deploy panel 닫으면 Reset
        deployPanel.onDidDispose(() => {
            deployPanel = undefined;
        });
    }
}

// [2] "AntiBug.security-analysis" Command의 동작
async function openSecurityAnalysisPanel(context) {

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
            const htmlContent = await getWebviewContent(context, 'AntiBug.securityanalysis');
            securityAnalysisPanel.webview.html = htmlContent;
        } catch (error) {
            console.error('Error loading HTML content:', error);
        }

        // security-analysis panel 닫으면 Reset
        securityAnalysisPanel.onDidDispose(() => {
            securityAnalysisPanel = undefined;
        });
    }
}

////// 모든 .sol 파일 찾기 함수
async function findSolFiles(folderPath) {
    const solFiles = [];

    async function findFilesRecursively(folderPath) {
        const entries = await fs.promises.readdir(folderPath);
        for (const entry of entries) {
            const entryPath = path.join(folderPath, entry);
            const stats = await fs.promises.stat(entryPath);
            if (stats.isDirectory()) {
                await findFilesRecursively(entryPath);
            } else if (path.extname(entry) === '.sol') {
                solFiles.push(entryPath);
            }
        }
    }
    await findFilesRecursively(folderPath);
    return solFiles;
}

////// 현재 활성 파일 중 .sol 파일 찾기 함수
async function findVisibleSolFiles() {

    // 현재 열려있는 모든 파일 찾기
    const allVisibleTextEditors = vscode.window.visibleTextEditors;
    const visibleSolFiles = [];

    // 확인용 출력 채널 생성
    const outputChannel = vscode.window.createOutputChannel('Visible File List Channel');

    // 현재 열려있는 파일 하나씩 꺼내보기
    for (const textEditor of allVisibleTextEditors) {
        const visibleFileUri = textEditor.document.uri; // 현재 열려있는 파일 uri
        const visibleFilePath = visibleFileUri.fsPath;  // 현재 열려있는 파일 경로
        const visibleFileExtension = path.extname(visibleFilePath); // 현재 열려있는 파일 확장자 추출

        // 현재 열려있는 파일이 .sol 파일이면 visibleSolFiles 리스트에 추가
        if (visibleFileExtension === '.sol') {
            visibleSolFiles.push(visibleFilePath);
        }
        outputChannel.appendLine(visibleFilePath);  // 확인용 출력 채널
    }

    // visibelSolFiles 리스트 확인용 출력 채널 생성
    if (visibleSolFiles.length > 0) {
        outputChannel.appendLine('Visible Sol File List Channel');
        for (const visibleSolFile of visibleSolFiles) {
            outputChannel.appendLine(visibleSolFile);
        }
    }

    outputChannel.show();
    return visibleSolFiles;
}

// [3] "AntiBug.solfile" Command의 동작
async function openSolfilePanel(workspaceFolderPath) {

    // message 팝업 띄우기
    vscode.window.showInformationMessage('Start AntiBug Open SOL file!');

    // 이미 패널이 열려있으면 리셋하고 새로 열기
    if (solfilePanel) {
        solfilePanel.dispose();
    }

    // Webview 패널 생성
    solfilePanel = vscode.window.createWebviewPanel(
        'WebViewExample',
        'Sol Files in Workspace',
        vscode.ViewColumn.One,
        {}
    );

    // 현재 열려있는 파일 중 .sol 파일 찾기
    const visibleSolFiles = await findVisibleSolFiles();

    // 모든 .sol 파일 찾기
    const solFiles = await findSolFiles(workspaceFolderPath);

    // .sol 파일 목록을 HTML list로 변환
    const fileItems = solFiles.map((filePath) => `<li>${filePath}</li>`).join('');

    // .sol 파일 목록을 HTML dropdown option으로 변환
    const dropdownItems = solFiles.map((filePath) => `<option value=${filePath}>${filePath}</option>`).join('');

    // submit 버튼을 누를 때 실행될 js 코드
    // const submitScript = ``

    // WebView에 HTML 내용 설정
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>SOL Files in Workspace</title>
    </head>
    <body>
      <h1>SOL Files in Workspace</h1>

      <h3>Visible SOL files</h3>
      <p>Visible Sol File : ${visibleSolFiles}</p>

      <h3>SOL Files DROPDOWN</h3>
      <form action="#">
        <label for="solfile">Select SOL file</label>
        <select name="selectsolfile" id="solfile">
            ${dropdownItems}
        </select>
        <input type="submit" value="Submit" />
      </form>

      <h3>SOL Files LIST</h3>
      <ul>
        ${fileItems}
      </ul>
    </body>
    </html>
  `;

    // WebView에 HTML 내용 설정
    solfilePanel.webview.html = htmlContent;

    // solfilePanel이 닫힐 때 리셋
    solfilePanel.onDidDispose(() => {
        solfilePanel = undefined;
    });
}

async function openSolfileWebview() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders) {
        const workspaceFolder = workspaceFolders[0];
        const workspaceFolderPath = workspaceFolder.uri.fsPath;

        // Webview 열기
        openSolfilePanel(workspaceFolderPath);
    } else {
        vscode.window.showErrorMessage('No workspace folders are open.');
    }
}

// [4] "AntiBug.test" Command의 동작
async function openTestPanel(context) {

    // message 팝업 띄우기
    vscode.window.showInformationMessage('Start AntiBug Test!');

    // test.html 띄우기
    if (TestPanel) {
        // 이미 test 패널이 있다면, 2번째 panel 열기
        TestPanel.reveal(vscode.ViewColumn.Two);
    } else {
        // 아니라면, 새 패널 열기
        TestPanel = vscode.window.createWebviewPanel(
            'ResultView', // View ID
            '[4] Test', // View 제목
            vscode.ViewColumn.Two, // 오른쪽에 분리된 패널로 열릴 위치
            {
                enableScripts: true // 웹페이지 스크립트 사용 가능
            }
        );

        // View에 HTML 콘텐츠 설정
        try {
            const htmlContent = await getWebviewContent(context, 'AntiBug.test');
            TestPanel.webview.html = htmlContent;
        } catch (error) {
            console.error('Error loading HTML content:', error);
        }

        //test panel 닫으면 Reset
        TestPanel.onDidDispose(() => {
            TestPanel = undefined;
        });
    }
}

// [5] "AntiBug.auditreport" Command의 동작
async function openAuditReportPanel(context) {

    // message 팝업 띄우기
    vscode.window.showInformationMessage('Start AntiBug Audit Report!');

    if (AuditReportPanel) {
        // 이미 audit report 패널이 있다면, 2번째 panel 열기
        AuditReportPanel.reveal(vscode.ViewColumn.Two);
    } else {
        // 아니라면, 새 패널 열기
        AuditReportPanel = vscode.window.createWebviewPanel(
            'ResultView', // View ID
            '[5] Audit Report', // View 제목
            vscode.ViewColumn.Two, // 오른쪽에 분리된 패널로 열릴 위치
            {
                enableScripts: true // 웹페이지 스크립트 사용 가능
            }
        );

        try {
            // Markdown 파일을 HTML로 변환
            const htmlContent = await getWebviewContent(context, 'AntiBug.auditreport')
            AuditReportPanel.webview.html = htmlContent;

        } catch (error) {
            console.error('Error loading Markdown content:', error);
        }

        // audit report panel 닫으면 Reset
        AuditReportPanel.onDidDispose(() => {
            AuditReportPanel = undefined;
        });
    }
}


////////////////// Function //////////////////

function deactivate() {
    if (deployPanel) {
        deployPanel.dispose();
    }
    if (solfilePanel) {
        solfilePanel.dispose();
    }
}

module.exports = {
    activate,
    deactivate,
};
