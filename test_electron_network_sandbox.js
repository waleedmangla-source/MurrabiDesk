const { app } = require('electron');

// Force macOS to treat the binary as if it wasn't launched by a sandboxed process
app.commandLine.appendSwitch('disable-mach-ports-rendezvous');
app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-oop-rasterization');
app.commandLine.appendSwitch('disable-gpu-compositing');
app.commandLine.appendSwitch('disable-software-rasterizer');

// Try catching the error early
process.on('uncaughtException', (err) => {
  console.log('Uncaught exception:', err);
});

if (app) {
  setTimeout(() => {
    if(!app.isReady()) {
      console.log('App failed to reach ready state within 2 seconds. Mach port block confirmed.');
      process.exit(1);
    }
  }, 2000);
  
  app.on('ready', () => {
    console.log('App successfully initialized. Mach Rendezvous bypass successful.');
    app.quit();
  });
}
