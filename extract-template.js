const fs = require('fs');
const path = require('path');

const sourcePath = '/Users/waleedmangla/Downloads/waqfeen_form_1.html';
const targetPath = '/Users/waleedmangla/.gemini/antigravity/scratch/murabbi-desk/src/lib/pdf-templates.ts';

try {
  const content = fs.readFileSync(sourcePath, 'utf8');
  const match = content.match(/const TEMPLATE_B64 = "(.*?)";/s);
  if (match && match[1]) {
    const tsContent = `export const WAQFEEN_REPORT_TEMPLATE = \`${match[1]}\`;\n`;
    fs.writeFileSync(targetPath, tsContent);
    console.log('Successfully extracted template to ' + targetPath);
  } else {
    console.error('Could not find TEMPLATE_B64 in source file');
  }
} catch (err) {
  console.error('Error during extraction:', err.message);
}
