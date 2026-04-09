const { exec } = require('child_process');
const path = require('path');

const APP_URL = 'http://localhost:7778';

// Use strict terminal bypass for Chrome App to avoid LaunchServices 54 lockouts
const chromeProfile = path.join(__dirname, '.chrome-profile');
const chromeMacCmd = `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --app=${APP_URL} --user-data-dir="${chromeProfile}" --disable-crash-reporter`;

console.log('Initiating Hardened Desktop Protocol...');
console.log(`Target: ${APP_URL}`);

// Run direct binary instead of generic 'open' which fails on locked OSes
exec(chromeMacCmd, { shell: true }, (error, stdout, stderr) => {
    if (error) {
        console.error('Chrome explicit mode failed:', error);
    }
});
