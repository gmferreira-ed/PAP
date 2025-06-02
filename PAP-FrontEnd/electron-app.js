const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');


function StartAppWindow() {
    const win = new BrowserWindow({
        title: "Restro Link",
        width: 800,
        height: 600,

        icon: path.join(__dirname, 'public', 'favicon.ico'),

        webPreferences: {
            contextIsolation: true,
            enableRemoteModule: false,
            devTools: true
        }
    });


    win.maximize();
    win.loadURL('http://localhost:5000');
}

app.whenReady().then(StartAppWindow);
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) StartAppWindow()
})