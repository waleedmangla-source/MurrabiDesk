/**
 * Ingests the complete English edition of Tadhkirah (2019 UK Edition) into structured,
 * page-by-page JSON files matching the Murabbi Desk corpus architecture.
 */

const fs = require('fs');
const path = require('path');
const pdfjs = require('../node_modules/pdfjs-dist/legacy/build/pdf.js');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'public', 'tadhkirah-en');
const PDF_PATH = path.join(PROJECT_ROOT, 'scratch', 'tadhkirah-pdf', 'Tadhkirah.pdf');

const ARABIC_REGEX = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]{2,}/;
const DATE_REGEX = /\b(?:\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}|(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}|\b(?:18[6-9]\d|190[0-8])\b)/gi;
const YEAR_REGEX = /\b(18[6-9]\d|190[0-8])\b/;

function cleanPageLines(items) {
  if (!items || items.length === 0) return { lines: [], detectedPageNum: null, runningHeader: null };

  const linesMap = new Map();
  for (const item of items) {
    const text = item.str;
    if (!text || text.trim() === '') continue;
    const y = Math.round(item.transform[5]);
    const x = Math.round(item.transform[4]);

    let foundY = null;
    for (const key of linesMap.keys()) {
      if (Math.abs(key - y) <= 3) {
        foundY = key;
        break;
      }
    }

    if (foundY !== null) {
      linesMap.get(foundY).push({ x, text });
    } else {
      linesMap.set(y, [{ x, text }]);
    }
  }

  const sortedY = Array.from(linesMap.keys()).sort((a, b) => b - a);

  const rawLines = sortedY.map(y => {
    const lineItems = linesMap.get(y).sort((a, b) => a.x - b.x);
    return lineItems.map(i => i.text).join(' ').trim();
  }).filter(l => l.length > 0);

  if (rawLines.length === 0) return { lines: [], detectedPageNum: null, runningHeader: null };

  let detectedPageNum = null;
  let runningHeader = null;

  const firstLine = rawLines[0];
  const lastLine = rawLines[rawLines.length - 1];

  // In Tadhkirah, the printed page number is typically at the bottom center or top
  // Check bottom line:
  if (/^\s*\d{1,4}\s*$/.test(lastLine)) {
    detectedPageNum = parseInt(lastLine.trim(), 10);
  } else if (/^\s*\d{1,4}\s*$/.test(firstLine)) {
    detectedPageNum = parseInt(firstLine.trim(), 10);
  } else {
    // Check if combined with running header (e.g. "T ADHKIRAH 78" or "23 E ARLY Y EARS")
    const topMatch = firstLine.match(/^(?:T\s*ADHKIRAH|E\s*ARLY|\w+)\s+(\d{1,4})$/i) ||
                     firstLine.match(/^(\d{1,4})\s+(?:T\s*ADHKIRAH|E\s*ARLY|\w+)/i);
    if (topMatch) {
      detectedPageNum = parseInt(topMatch[1], 10);
    }
  }

  // Running header detection
  if (/t\s*adhkirah/i.test(firstLine) || /–|-/.test(firstLine) || /years/i.test(firstLine)) {
    runningHeader = firstLine.replace(/\b\d{1,4}\b/g, '').trim();
  }

  // Filter out running header & bottom page number
  const filteredLines = rawLines.filter((line, idx) => {
    if (idx === 0) {
      if (/^\s*\d{1,4}\s*$/.test(line)) return false;
      if (/t\s*adhkirah/i.test(line) && line.length < 30) return false;
      if (/early\s+years/i.test(line) && line.length < 30) return false;
    }
    if (idx === rawLines.length - 1 && /^\s*\d{1,4}\s*$/.test(line)) {
      return false;
    }
    return true;
  });

  return { lines: filteredLines, detectedPageNum, runningHeader };
}

async function runIngestion() {
  if (!fs.existsSync(PDF_PATH)) {
    console.error(`Tadhkirah PDF not found at: ${PDF_PATH}`);
    process.exit(1);
  }

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log("========================================");
  console.log("Starting Tadhkirah (English Translation) Ingestion Pipeline");
  console.log(`Path: ${PDF_PATH}`);

  const fileBuffer = fs.readFileSync(PDF_PATH);
  const data = new Uint8Array(fileBuffer);
  const doc = await pdfjs.getDocument({ data }).promise;
  const numPages = doc.numPages;
  console.log(`Total PDF Pages: ${numPages}`);

  const pages = [];
  let lastKnownBookPage = 0;
  let bookStarted = false;
  let currentYear = 1881;
  let totalArabicSnippets = 0;

  for (let p = 1; p <= numPages; p++) {
    const pageObj = await doc.getPage(p);
    const textContent = await pageObj.getTextContent();
    const { lines, detectedPageNum, runningHeader } = cleanPageLines(textContent.items);

    let pageNum = null;
    if (detectedPageNum !== null && detectedPageNum > 0) {
      pageNum = detectedPageNum;
      lastKnownBookPage = detectedPageNum;
      bookStarted = true;
    } else if (bookStarted) {
      lastKnownBookPage++;
      pageNum = lastKnownBookPage;
    } else {
      pageNum = `front-${p}`;
    }

    const fullText = lines.join('\n');
    if (!fullText.trim()) continue;

    // Detect year from running header or content
    if (runningHeader) {
      const yearInHeader = runningHeader.match(YEAR_REGEX);
      if (yearInHeader) {
        currentYear = parseInt(yearInHeader[1], 10);
      }
    }
    const yearInText = fullText.match(YEAR_REGEX);
    if (yearInText && !runningHeader) {
      currentYear = parseInt(yearInText[1], 10);
    }

    // Extract dates on this page
    const dates = fullText.match(DATE_REGEX) || [];
    const uniqueDates = Array.from(new Set(dates.map(d => d.trim()))).filter(d => d.length >= 4);

    // Extract Arabic text segments
    const arabicSnippets = [];
    for (const line of lines) {
      if (ARABIC_REGEX.test(line)) {
        arabicSnippets.push(line.trim());
      }
    }
    totalArabicSnippets += arabicSnippets.length;

    // Determine primary category
    let category = "Revelation";
    const lowerText = fullText.toLowerCase();
    if (lowerText.includes('saw in a dream') || lowerText.includes('[dream]') || lowerText.includes('dreamt')) {
      category = "Dream (Ru'ya)";
    } else if (lowerText.includes('in a vision') || lowerText.includes('[vision]') || lowerText.includes('kashf')) {
      category = "Vision (Kashf)";
    } else if (lowerText.includes('verbal revelation') || lowerText.includes('words revealed')) {
      category = "Verbal Inspiration";
    }

    // Section headings (e.g. "March 20, 1886", "Sign of the Promised Son")
    const headings = [];
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      if (l.length <= 60 && (
        /^(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}/i.test(l) ||
        /^\b(18[6-9]\d|190[0-8])\b/.test(l) ||
        (l.length >= 5 && l.length <= 45 && !/[.:;]$/.test(l) && i < 3)
      )) {
        if (!headings.includes(l)) headings.push(l);
      }
    }

    pages.push({
      page_num: pageNum,
      pdf_page: p,
      year: currentYear,
      dateStr: uniqueDates[0] || (currentYear ? String(currentYear) : undefined),
      category,
      text: fullText,
      arabicSnippets: arabicSnippets.length > 0 ? arabicSnippets : undefined,
      headings: headings.length > 0 ? headings : undefined,
      dates: uniqueDates.length > 0 ? uniqueDates : undefined
    });

    if (p % 100 === 0 || p === numPages) {
      process.stdout.write(`  Processed ${p}/${numPages} pages (book p. ${lastKnownBookPage}, year ${currentYear})\r`);
    }
  }

  console.log(`\nExtracted ${pages.length} pages from Tadhkirah (${totalArabicSnippets} Arabic segments detected).`);

  const masterData = {
    title: "Tadhkirah: English Translation of Divine Revelations, Dreams and Visions",
    urduTitle: "تذکرہ (خواب، کشوف اور الہاماتِ مقدسہ)",
    author: "Hazrat Mirza Ghulam Ahmad, The Promised Messiah and Mahdi (as)",
    publisher: "Islam International Publications Ltd.",
    edition: "2019 UK Edition",
    sourcePdfUrl: "https://files.alislam.cloud/pdf/Tadhkirah.pdf",
    sourceUrl: "https://www.alislam.org/book/tadhkirah/",
    totalPdfPages: numPages,
    totalPages: lastKnownBookPage || pages.length,
    dateRange: "1869 to 1908",
    pages
  };

  const outputFullJson = path.join(OUTPUT_DIR, 'tadhkirah.json');
  fs.writeFileSync(outputFullJson, JSON.stringify(masterData, null, 2), 'utf8');
  console.log(`Saved full Tadhkirah corpus to: ${outputFullJson} (${(fs.statSync(outputFullJson).size / 1024 / 1024).toFixed(2)} MB)`);

  const indexData = {
    title: masterData.title,
    urduTitle: masterData.urduTitle,
    author: masterData.author,
    publisher: masterData.publisher,
    edition: masterData.edition,
    sourcePdfUrl: masterData.sourcePdfUrl,
    sourceUrl: masterData.sourceUrl,
    totalPdfPages: numPages,
    totalPages: lastKnownBookPage || pages.length,
    dateRange: masterData.dateRange,
    totalExtractedPages: pages.length,
    outputFile: "tadhkirah.json"
  };

  const outputIndex = path.join(OUTPUT_DIR, 'index.json');
  fs.writeFileSync(outputIndex, JSON.stringify(indexData, null, 2), 'utf8');
  console.log(`Master index written to: ${outputIndex}`);
  console.log("========================================");
  console.log("Tadhkirah ingestion completed successfully!");
}

runIngestion().catch(err => {
  console.error("Tadhkirah ingestion failed:", err);
  process.exit(1);
});
