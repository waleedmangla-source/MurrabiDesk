import { PDFDocument, rgb, StandardFonts, PDFFont, PDFPage } from 'pdf-lib';
import { WAQFEEN_EXPENSE_V1 } from './pdf-templates';
const PDF_TEMPLATES = { WAQFEEN_EXPENSE_V1 };

export interface ExpenseItem {
  ref: string;
  hst: string;
  total: string;
}

export interface WaqfeenReportData {
  full_name: string;
  member_code: string;
  date: string;
  cheque_num: string;
  expense_month: string;
  posting: string;
  posting_location: string;
  d1: string;
  d2: string;
  d3: string;
  fiscal_period: string;
  date_received: string;
  other_label: string;
  items: ExpenseItem[];
  grand_hst: string;
  grand_total: string;
  comments: string;
}

const RC = [{"row": 0, "ref": [338.56, 713.43, 28.69], "hst": [415.06, 713.43, 36.34], "total": [515.92, 713.43, 59.99], "cell_h": 13.2, "font_size": 8}, {"row": 1, "ref": [339.25, 696.73, 27.99], "hst": [415.06, 696.73, 36.34], "total": [515.22, 696.73, 60.69], "cell_h": 13.2, "font_size": 8}, {"row": 2, "ref": [339.25, 680.74, 27.3], "hst": [414.37, 680.74, 37.04], "total": [515.22, 681.43, 59.99], "cell_h": 12.5, "font_size": 8}, {"row": 3, "ref": [339.21, 663.68, 28.69], "hst": [415.72, 663.68, 36.34], "total": [516.57, 663.68, 59.99], "cell_h": 13.2, "font_size": 8}, {"row": 4, "ref": [339.91, 646.99, 27.99], "hst": [415.72, 646.99, 36.34], "total": [515.88, 646.99, 60.69], "cell_h": 13.2, "font_size": 8}, {"row": 5, "ref": [339.91, 630.99, 27.3], "hst": [415.02, 630.99, 37.04], "total": [515.88, 631.69, 59.99], "cell_h": 12.5, "font_size": 8}, {"row": 6, "ref": [337.25, 581.86, 28.69], "hst": [413.76, 581.86, 36.34], "total": [514.61, 581.86, 59.99], "cell_h": 13.2, "font_size": 8}, {"row": 7, "ref": [337.94, 565.17, 27.99], "hst": [413.76, 565.17, 36.34], "total": [513.91, 565.17, 60.68], "cell_h": 13.2, "font_size": 8}, {"row": 8, "ref": [337.94, 549.17, 27.3], "hst": [413.06, 549.17, 37.04], "total": [513.91, 549.87, 59.99], "cell_h": 12.5, "font_size": 8}, {"row": 9, "ref": [337.25, 515.1, 28.69], "hst": [413.76, 515.1, 36.34], "total": [514.61, 515.1, 59.99], "cell_h": 13.2, "font_size": 8}, {"row": 10, "ref": [337.94, 498.4, 27.99], "hst": [413.76, 498.4, 36.34], "total": [513.91, 498.4, 60.68], "cell_h": 13.2, "font_size": 8}, {"row": 11, "ref": [337.94, 482.41, 27.3], "hst": [413.06, 482.41, 37.04], "total": [513.91, 483.1, 59.99], "cell_h": 12.5, "font_size": 8}, {"row": 12, "ref": [337.9, 465.35, 28.69], "hst": [414.41, 465.35, 36.34], "total": [515.26, 465.35, 59.99], "cell_h": 13.2, "font_size": 8}, {"row": 13, "ref": [338.6, 448.66, 27.99], "hst": [414.41, 448.66, 36.34], "total": [514.57, 448.66, 60.69], "cell_h": 13.2, "font_size": 8}, {"row": 14, "ref": [338.6, 432.66, 27.3], "hst": [413.72, 432.66, 37.04], "total": [514.57, 433.36, 59.99], "cell_h": 12.5, "font_size": 8}, {"row": 15, "ref": [337.9, 399.9, 28.69], "hst": [414.41, 399.9, 36.34], "total": [515.26, 399.9, 59.99], "cell_h": 13.2, "font_size": 8}, {"row": 16, "ref": [338.6, 383.2, 27.99], "hst": [414.41, 383.2, 36.34], "total": [514.57, 383.2, 60.69], "cell_h": 13.2, "font_size": 8}, {"row": 17, "ref": [338.56, 348.84, 28.69], "hst": [415.06, 348.84, 36.34], "total": [515.92, 348.84, 59.99], "cell_h": 13.2, "font_size": 8}, {"row": 18, "ref": [339.25, 332.15, 27.99], "hst": [415.06, 332.15, 36.34], "total": [515.22, 332.15, 60.69], "cell_h": 13.2, "font_size": 8}, {"row": 19, "ref": [339.25, 316.15, 27.3], "hst": [414.37, 316.15, 37.04], "total": [515.22, 316.85, 59.99], "cell_h": 12.5, "font_size": 8}, {"row": 20, "ref": [338.56, 282.73, 28.69], "hst": [415.06, 282.73, 36.34], "total": [515.92, 282.73, 59.99], "cell_h": 13.2, "font_size": 8}, {"row": 21, "ref": [339.25, 266.04, 27.99], "hst": [415.06, 266.04, 36.34], "total": [515.22, 266.04, 60.69], "cell_h": 13.2, "font_size": 8}, {"row": 22, "ref": [339.25, 250.04, 27.3], "hst": [414.37, 250.04, 37.04], "total": [515.22, 250.74, 59.99], "cell_h": 12.5, "font_size": 8}, {"row": 23, "ref": [339.91, 234.33, 27.3], "hst": [415.02, 234.33, 37.04], "total": [515.88, 235.03, 59.99], "cell_h": 12.5, "font_size": 8}, {"row": 24, "ref": [339.91, 199.93, 27.99], "hst": [415.72, 199.93, 36.34], "total": [515.88, 199.93, 60.69], "cell_h": 13.2, "font_size": 8}, {"row": 25, "ref": [339.91, 183.93, 27.3], "hst": [415.02, 183.93, 37.04], "total": [515.88, 184.63, 59.99], "cell_h": 12.5, "font_size": 8}, {"row": 26, "ref": [340.56, 168.22, 27.3], "hst": [415.68, 168.22, 37.04], "total": [516.53, 168.92, 59.99], "cell_h": 12.5, "font_size": 8}, {"row": 27, "ref": [339.25, 133.82, 27.99], "hst": [415.06, 133.82, 36.34], "total": [515.22, 133.82, 60.69], "cell_h": 13.2, "font_size": 8}, {"row": 28, "ref": [339.25, 117.83, 27.3], "hst": [414.37, 117.83, 37.04], "total": [515.22, 118.52, 59.99], "cell_h": 12.5, "font_size": 8}, {"row": 29, "ref": [339.25, 84.73, 27.99], "hst": [415.06, 84.73, 36.34], "total": [515.22, 84.73, 60.69], "cell_h": 13.2, "font_size": 8}];

export async function generateWaqfeenPDF(data: WaqfeenReportData) {
  let templateB64 = PDF_TEMPLATES.WAQFEEN_EXPENSE_V1;
  
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('waqfeen_template_b64');
    if (saved && saved.length > 1000) templateB64 = saved;
  }

  if (!templateB64 || templateB64 === 'PDF_B64_PLACEHOLDER') {
    throw new Error('Template asset not found. Please sync the template in settings.');
  }

  const pdfBytes = Uint8Array.from(atob(templateB64), c => c.charCodeAt(0));
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();
  if (pages.length < 3) {
      // If template is only 2 pages, add a third for comments
      pdfDoc.addPage();
  }
  const [p1, p2, p3] = pdfDoc.getPages();

  const helv = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helvB = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const black = rgb(0, 0, 0);

  const dt = (pg: PDFPage, txt: string, x: number, y: number, size: number, font: PDFFont, maxW?: number, align: 'left' | 'center' = 'left') => {
    if (!txt) return;
    let drawX = x;
    if (maxW && align === 'center') {
      const w = font.widthOfTextAtSize(txt, size);
      if (w < maxW) drawX = x + (maxW - w) / 2;
    }
    pg.drawText(txt, { x: drawX, y, size, font, color: black });
  };

  const dtR = (pg: PDFPage, txt: string, x: number, y: number, size: number, font: PDFFont) => {
    if (!txt) return;
    const w = font.widthOfTextAtSize(txt, size);
    pg.drawText(txt, { x: x - w, y, size, font, color: black });
  };

  // ---- PAGE 1 ----
  // Full name
  dt(p1, data.full_name, 106.3, 664.3, 10, helvB, 380, 'center');

  // Member code - 5 boxes
  if (data.member_code) {
      const mc = (data.member_code + '     ').slice(0, 5).split('');
      const mcX = [116.1, 138.3, 159.2, 180.8, 201.6];
      mc.forEach((c, i) => dt(p1, c.trim(), mcX[i], 637.8, 9, helv, 14, 'center'));
  }

  // Date boxes DD MM YY
  if (data.date && data.date.length === 10) {
    const [yr, mo, dy] = data.date.split('-');
    const chars = [dy[0], dy[1], mo[0], mo[1], yr[2], yr[3]];
    const dX = [369.2, 390.8, 411.7, 431.1, 451.3, 472.2];
    chars.forEach((c, i) => dt(p1, c, dX[i], 637.8, 9, helv, 12, 'center'));
  }

  // Posting checkboxes
  const ckCenters: Record<string, [number, number]> = { 
      branch: [124.9, 612.2], 
      national: [271.5, 612.8], 
      jamia: [437.1, 614.1] 
  };
  if (data.posting && ckCenters[data.posting]) {
    const [cx, cy] = ckCenters[data.posting];
    p1.drawText('X', { x: cx - 4, y: cy - 4, size: 10, font: helvB, color: black });
  }

  dt(p1, data.posting_location, 333.1, 605.1, 8, helv, 85, 'center');
  dt(p1, data.cheque_num, 512.5, 576.9, 9, helv, 82, 'center');
  dt(p1, data.d1, 96.9, 575.1, 9, helv);
  dt(p1, data.expense_month, 370.5, 575.7, 11, helvB, 132, 'center');
  dt(p1, data.d2, 17.7, 547.6, 9, helv);
  dt(p1, data.d3, 17.1, 518.8, 9, helv);

  // Fiscal period
  if (data.fiscal_period && data.fiscal_period.length === 7) {
    const [fy, fm] = data.fiscal_period.split('-');
    const fpChars = [fm[0], fm[1], fy[2], fy[3]];
    const fpX = [373.7, 394.7, 413.6, 433.4];
    fpChars.forEach((c, i) => dt(p1, c, fpX[i], 247.9, 9, helv, 12));
  }

  // Date received
  if (data.date_received && data.date_received.length === 10) {
    const [,,dd] = data.date_received.split('-');
    dt(p1, dd[0], 456.0, 247.9, 9, helv, 12);
    dt(p1, dd[1], 477.0, 247.9, 9, helv, 11);
  }

  dt(p1, data.other_label, 348.7, 45.6, 8, helv, 178);

  // ---- PAGE 2: expense rows ----
  data.items.forEach((item, ri) => {
    if (ri >= 30) return;
    const c = RC[ri];
    dt(p2, item.ref, c.ref[0], c.ref[1], 8, helv, c.ref[2]);
    if (item.hst) dtR(p2, item.hst, c.hst[0] + c.hst[2], c.hst[1], 8, helv);
    if (item.total) dtR(p2, item.total, c.total[0] + c.total[2], c.total[1], 8, helv);
  });

  // Grand totals
  if (data.grand_hst) dtR(p2, data.grand_hst, 438, 31, 9, helv);
  if (data.grand_total) dtR(p2, data.grand_total, 540, 31, 9, helv);

  // ---- PAGE 3: comments ----
  if (data.comments) {
    const maxW = 560, lineH = 13, startY = 285, startX = 24;
    const words = data.comments.split(' ');
    let line = '', y = startY;
    for (const word of words) {
      const test = line ? line + ' ' + word : word;
      if (helv.widthOfTextAtSize(test, 9) > maxW && line) {
        p3.drawText(line, { x: startX, y, size: 9, font: helv, color: black });
        y -= lineH; line = word;
        if (y < 145) break; 
      } else { line = test; }
    }
    if (line && y >= 145) p3.drawText(line, { x: startX, y, size: 9, font: helv, color: black });
  }

  return await pdfDoc.save();
}
