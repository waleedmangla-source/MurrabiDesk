/**
 * Ingests all official English translations of Malfuzat from downloaded PDFs into
 * structured, page-by-page JSON files matching the Murabbi Desk corpus architecture.
 */

const fs = require('fs');
const path = require('path');
const pdfjs = require('../node_modules/pdfjs-dist/legacy/build/pdf.js');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'public', 'malfuzat-en');
const PDF_DIR = path.join(PROJECT_ROOT, 'scratch', 'malfuzat-pdfs');

const VOLUMES_METADATA = [
  {
    volume: 1,
    volumeRoman: "I",
    title: "Malfuzat – Volume I",
    dateRange: "1891 to October 1898",
    filename: "Malfuzat-1.pdf",
    sourcePdfUrl: "https://files.alislam.cloud/pdf/Malfuzat-1.pdf",
    sourceUrl: "https://www.alislam.org/book/malfuzat-volume-1/"
  },
  {
    volume: 2,
    volumeRoman: "II",
    title: "Malfuzat – Volume II",
    dateRange: "January 1899 to August 1900",
    filename: "Malfuzat-2.pdf",
    sourcePdfUrl: "https://files.alislam.cloud/pdf/Malfuzat-2.pdf",
    sourceUrl: "https://www.alislam.org/book/malfuzat-volume-2/"
  },
  {
    volume: 3,
    volumeRoman: "III",
    title: "Malfuzat – Volume III",
    dateRange: "September 1900 to August 1901",
    filename: "Malfuzat-3.pdf",
    sourcePdfUrl: "https://files.alislam.cloud/pdf/Malfuzat-3.pdf",
    sourceUrl: "https://www.alislam.org/book/malfuzat-volume-iii/"
  },
  {
    volume: 4,
    volumeRoman: "IV",
    title: "Malfuzat – Volume IV",
    dateRange: "September 1901 to December 1901",
    filename: "Malfuzat-4.pdf",
    sourcePdfUrl: "https://files.alislam.cloud/pdf/Malfuzat-4.pdf",
    sourceUrl: "https://www.alislam.org/book/malfuzat-volume-iv/"
  },
  {
    volume: 7,
    volumeRoman: "VII",
    title: "Malfuzat – Volume VII",
    dateRange: "October 1904 to September 1905",
    filename: "Malfuzat-7.pdf",
    sourcePdfUrl: "https://files.alislam.cloud/pdf/Malfuzat-7.pdf",
    sourceUrl: "https://www.alislam.org/book/malfuzat-volume-vii/"
  },
  {
    volume: 8,
    volumeRoman: "VIII",
    title: "Malfuzat – Volume VIII",
    dateRange: "October 1905 to October 1906",
    filename: "Malfuzat-8.pdf",
    sourcePdfUrl: "https://files.alislam.cloud/pdf/Malfuzat-8.pdf",
    sourceUrl: "https://www.alislam.org/book/malfuzat-volume-viii/"
  },
  {
    volume: 9,
    volumeRoman: "IX",
    title: "Malfuzat – Volume IX",
    dateRange: "November 1906 to October 1907",
    filename: "Malfuzat-9.pdf",
    sourcePdfUrl: "https://files.alislam.cloud/pdf/Malfuzat-9.pdf",
    sourceUrl: "https://www.alislam.org/book/malfuzat-volume-ix/"
  },
  {
    volume: 10,
    volumeRoman: "X",
    title: "Malfuzat – Volume X",
    dateRange: "November 1907 to May 1908",
    filename: "Malfuzat-10.pdf",
    sourcePdfUrl: "https://files.alislam.cloud/pdf/Malfuzat-10.pdf",
    sourceUrl: "https://www.alislam.org/book/malfuzat-volume-x/"
  }
];

const DATE_REGEX = /\b(?:\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}|(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}|\b(?:18[89]\d|190\d)\b)/gi;

function cleanPageLines(items) {
  if (!items || items.length === 0) return { lines: [], detectedPageNum: null };

  // 1. Group text items into lines by Y-coordinate
  const linesMap = new Map();
  for (const item of items) {
    const text = item.str;
    if (!text || text.trim() === '') continue;
    const y = Math.round(item.transform[5]);
    const x = Math.round(item.transform[4]);

    // Find existing line within 3 points
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

  // 2. Sort lines top-to-bottom (PDF Y goes up, so sort descending)
  const sortedY = Array.from(linesMap.keys()).sort((a, b) => b - a);

  const rawLines = sortedY.map(y => {
    const lineItems = linesMap.get(y).sort((a, b) => a.x - b.x);
    return lineItems.map(i => i.text).join(' ').trim();
  }).filter(l => l.length > 0);

  if (rawLines.length === 0) return { lines: [], detectedPageNum: null };

  // 3. Inspect header (first line) and footer (last line) for printed page number
  let detectedPageNum = null;
  const firstLine = rawLines[0];
  const lastLine = rawLines[rawLines.length - 1];

  // Pattern: "12 Hazrat Mirza Ghulam Ahmad" or "Malfuzat – Volume I 13" or "3 Malfuzat – Volume I"
  const headerNumMatch = firstLine.match(/^\s*(\d{1,4})\s+(?:Malfuzat|Hazrat|\w+)/i) ||
                         firstLine.match(/(?:Malfuzat|Hazrat|\w+)\s+(\d{1,4})\s*$/i) ||
                         firstLine.match(/^(\d{1,4})$/);
  if (headerNumMatch) {
    detectedPageNum = parseInt(headerNumMatch[1], 10);
  } else {
    // Check footer
    const footerNumMatch = lastLine.match(/^(\d{1,4})$/);
    if (footerNumMatch) {
      detectedPageNum = parseInt(footerNumMatch[1], 10);
    }
  }

  // Filter out running header lines
  const isRunningHeader = (line) => {
    const l = line.toLowerCase();
    if (l.includes('malfuzat – volume') || l.includes('malfuzat - volume') || l.includes('hazrat mirza ghulam ahmad')) {
      // If the line consists mostly of the running header text and optional page number
      const stripped = l.replace(/malfuzat\s*[–-]\s*volume\s*[ivx0-9]+/gi, '')
                        .replace(/hazrat\s+mirza\s+ghulam\s+ahmad/gi, '')
                        .replace(/[0-9ivxlc\s]/gi, '');
      return stripped.length < 5;
    }
    return false;
  };

  const filteredLines = rawLines.filter((line, idx) => {
    if (idx === 0 && isRunningHeader(line)) return false;
    if (idx === rawLines.length - 1 && /^\d{1,4}$/.test(line)) return false;
    return true;
  });

  return { lines: filteredLines, detectedPageNum };
}

async function processVolume(meta) {
  const fullPdfPath = path.join(PROJECT_ROOT, meta.filename.startsWith('scratch') ? meta.filename : path.join('scratch', 'malfuzat-pdfs', meta.filename));
  if (!fs.existsSync(fullPdfPath)) {
    console.error(`[Ingest] PDF file not found: ${fullPdfPath}`);
    return null;
  }

  console.log(`\n========================================`);
  console.log(`Processing: ${meta.title}`);
  console.log(`Path: ${fullPdfPath}`);
  
  const fileBuffer = fs.readFileSync(fullPdfPath);
  const data = new Uint8Array(fileBuffer);
  const doc = await pdfjs.getDocument({ data }).promise;
  const numPages = doc.numPages;
  console.log(`Total PDF Pages: ${numPages}`);

  const pages = [];
  let lastKnownBookPage = 0;
  let bookStarted = false;

  for (let p = 1; p <= numPages; p++) {
    const pageObj = await doc.getPage(p);
    const textContent = await pageObj.getTextContent();
    const { lines, detectedPageNum } = cleanPageLines(textContent.items);

    let pageNum = null;
    if (detectedPageNum !== null && detectedPageNum > 0) {
      pageNum = detectedPageNum;
      lastKnownBookPage = detectedPageNum;
      bookStarted = true;
    } else if (bookStarted) {
      lastKnownBookPage += 1;
      pageNum = lastKnownBookPage;
    } else {
      // Front matter before page 1
      pageNum = `front-${p}`;
    }

    // Reconstruct paragraph text with de-hyphenation
    let joinedText = lines.join('\n');
    // De-hyphenate words split at line ends: "re- \nligion" -> "religion"
    joinedText = joinedText.replace(/(\w+)-\s*\n\s*(\w+)/g, '$1$2');

    // Extract dates and prospective headings
    const dates = Array.from(new Set(joinedText.match(DATE_REGEX) || []));
    const headings = lines.filter(l => {
      return l.length < 75 && 
             l.length > 5 &&
             !l.endsWith('.') &&
             !l.includes('http') &&
             /^[A-Z]/.test(l);
    });

    if (joinedText.trim().length > 0) {
      pages.push({
        page_num: pageNum,
        pdf_page: p,
        text: joinedText.trim(),
        headings: headings.slice(0, 3),
        dates: dates.slice(0, 5)
      });
    }

    if (p % 50 === 0 || p === numPages) {
      process.stdout.write(`  Processed ${p}/${numPages} pages (Current Book Page: ${pageNum})\r`);
    }
  }

  console.log(`\nFinished ${meta.title}: extracted ${pages.length} non-empty pages.`);

  const volumeData = {
    volume: meta.volume,
    volumeRoman: meta.volumeRoman,
    title: meta.title,
    dateRange: meta.dateRange,
    author: "Hazrat Mirza Ghulam Ahmad, The Promised Messiah and Mahdi (as)",
    publisher: "Islam International Publications Ltd.",
    sourcePdfUrl: meta.sourcePdfUrl,
    sourceUrl: meta.sourceUrl,
    totalPdfPages: numPages,
    totalPages: pages.filter(p => typeof p.page_num === 'number').length,
    pages: pages
  };

  const outFilePath = path.join(OUTPUT_DIR, `volume_${meta.volume}.json`);
  fs.writeFileSync(outFilePath, JSON.stringify(volumeData, null, 2), 'utf-8');
  const sizeMB = (fs.statSync(outFilePath).size / (1024 * 1024)).toFixed(2);
  console.log(`Wrote: ${outFilePath} (${sizeMB} MB)`);

  return {
    volume: meta.volume,
    volumeRoman: meta.volumeRoman,
    title: meta.title,
    dateRange: meta.dateRange,
    sourcePdfUrl: meta.sourcePdfUrl,
    sourceUrl: meta.sourceUrl,
    totalPdfPages: numPages,
    totalBookPages: volumeData.totalPages,
    outputFile: `volume_${meta.volume}.json`
  };
}

async function main() {
  fs.makedirsSync = (dir) => { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); };
  fs.makedirsSync(OUTPUT_DIR);

  console.log(`[Malfuzat Ingest] Starting full-text extraction for ${VOLUMES_METADATA.length} volumes...`);
  const indexManifest = [];

  for (const meta of VOLUMES_METADATA) {
    const summary = await processVolume(meta);
    if (summary) indexManifest.push(summary);
  }

  const indexPath = path.join(OUTPUT_DIR, 'index.json');
  fs.writeFileSync(indexPath, JSON.stringify({
    series: "Malfuzat (English Translation)",
    author: "Hazrat Mirza Ghulam Ahmad, The Promised Messiah and Mahdi (as)",
    publisher: "Islam International Publications Ltd.",
    availableVolumesCount: indexManifest.length,
    volumes: indexManifest
  }, null, 2), 'utf-8');

  console.log(`\n========================================`);
  console.log(`Ingestion Complete! Generated ${indexManifest.length} volume JSON files and index manifest.`);
  console.log(`Output Directory: ${OUTPUT_DIR}`);
}

main().catch(err => {
  console.error('[Ingest] Error:', err);
  process.exit(1);
});
