const { app, BrowserWindow, Menu, ipcMain, nativeImage } = require('electron');
const path = require('path');
const escpos = require('escpos');
escpos.Network = require('escpos-network');

app.setName('RestroLink');




ipcMain.handle('print-receipt', async (event, data) => {

    try {
        const device = new escpos.Network('192.168.0.253', 6001);
        const printer = new escpos.Printer(device);

        printer.raw(Buffer.from([0x1B, 0x74, 0x13]));
        printer.encode('CP858')

        await new Promise((resolve, reject) => {
            try {
                device.open(function (error) {
                    if (error) {
                        console.error('Printer connection failed:', error);
                        reject(new Error(`Printer connection failed: ${error.message || error}`));
                        return;
                    }
                    console.log('Connected to printer')
                    resolve()
                });

            } catch (Err) {
                console.error(Err)
                reject(Err)
            }
        }
        )

        console.log(data)
        for (const line of data) {
            if (line.name === 'text') {
                const textData = line.data;

                printer.align(textData.align)
                printer.size(textData.size[0], textData.size[1])
                printer.font(textData.font)
                printer.style(textData.style)

                printer.text(textData.text)

                printer.font('A')
                printer.style('NORMAL');
                printer.size('NORMAL', 'NORMAL');
                printer.align('LT');

            } else if (line.name === 'image') {
                const ImagePath = path.join(__dirname, 'public/Images/RestroLinkPrinter.png')
                await new Promise((resolve, reject) => {
                    escpos.Image.load(ImagePath, (image) => {
                        printer
                            .align('CT')
                            .image(image, 's8')
                            .then(() => {
                                console.log('Image loaded')
                                resolve()
                            })
                            .catch(err => {
                                console.error('Error printing image:', err)
                                reject(err)
                            })
                    })
                })
            } else {
                printer[line.name](line.data)
            }
        }

        printer.cut();
        printer.close();
        return { success: true };

    } catch (error) {
        console.error('Print receipt error:', error);
        return { success: false, message: error.message || 'Unknown error occurred' };
    }
});

function StartAppWindow() {
    const win = new BrowserWindow({
        title: "Restro Link",
        width: 800,
        height: 600,
        icon: path.join(__dirname, 'public', 'favicon.ico'),
        frame: false,
        kiosk: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            enableRemoteModule: false,
            devTools: true
        }
    })

    win.maximize()
    win.loadURL('http://localhost:5000')
    // win.setMenu(null)
}

app.whenReady().then(StartAppWindow);
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) StartAppWindow()
})