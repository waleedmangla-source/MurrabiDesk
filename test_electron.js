const { app } = require('electron');
if (app) {
  app.commandLine.appendSwitch('disable-oop-rasterization');
  app.commandLine.appendSwitch('disable-gpu-compositing');
  app.commandLine.appendSwitch('disable-gpu');
  app.commandLine.appendSwitch('no-sandbox');
  app.on('ready', () => {
    console.log('App successfully initialized without Mach Rendezvous block');
    app.quit();
  });
}
