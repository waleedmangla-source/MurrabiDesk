const fs = require('fs');
const content = fs.readFileSync('waqfeen_expense_form_4.html', 'utf8');
const match = content.match(/const PDF_B64='([^']+)'/);
if (match) {
    fs.writeFileSync('src/lib/pdf-templates.ts', `export const WAQFEEN_EXPENSE_V1 = "${match[1]}";\n`);
    console.log('Successfully updated src/lib/pdf-templates.ts');
} else {
    console.error('Could not find PDF_B64 in HTML file');
}
