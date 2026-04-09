const fs = require('fs');
const path = require('path');

const sourcePath = path.join(__dirname, 'waqfeen_form_2.html');
const targetPath = path.join(__dirname, 'src/lib/pdf-templates.ts');

try {
    const content = fs.readFileSync(sourcePath, 'utf8');
    console.log('Read success, length:', content.length);
    
    // Improved regex to handle massive strings more robustly
    const startMarker = 'const TEMPLATE_B64 = "';
    const endMarker = '";';
    const startIdx = content.indexOf(startMarker);
    if (startIdx === -1) throw new Error('Start marker not found');
    
    const stringStart = startIdx + startMarker.length;
    const endIdx = content.indexOf(endMarker, stringStart);
    if (endIdx === -1) throw new Error('End marker not found');
    
    const base64 = content.substring(stringStart, endIdx);
    console.log('Base64 extracted, length:', base64.length);
    
    const fileContent = `export const WAQFEEN_EXPENSE_V1 = "${base64}";\n`;
    fs.writeFileSync(targetPath, fileContent);
    console.log('Successfully updated src/lib/pdf-templates.ts');
} catch (err) {
    console.error('Error during injection:', err.message);
    process.exit(1);
}
