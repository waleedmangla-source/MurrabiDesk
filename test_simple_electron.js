const { app, BrowserWindow } = require('electron');
app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-features', 'MachPortRendezvous');
app.whenReady().then(() => {
  console.log('App ready. Creating window...');
  const win = new BrowserWindow({ width: 800, height: 600 });
  win.loadURL('https://google.com');
  console.log('Window created.');
  setTimeout(() => app.quit(), 5000);
});
