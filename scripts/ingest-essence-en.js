/**
 * Ingests all 5 volumes of "The Essence of Islam" into structured, page-by-page JSON files
 * matching the Murabbi Desk corpus architecture.
 */

const fs = require('fs');
const path = require('path');
const pdfjs = require('../node_modules/pdfjs-dist/legacy/build/pdf.js');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'public', 'essence-of-islam-en');
const PDF_DIR = path.join(PROJECT_ROOT, 'scratch', 'essence-pdfs');

const VOLUMES_METADATA = [
  {
    volume: 1,
    volumeRoman: "I",
    title: "The Essence of Islam – Volume I",
    filename: "Essence-1.pdf",
    sourcePdfUrl: "https://files.alislam.cloud/pdf/Essence-1.pdf",
    sourceUrl: "https://www.alislam.org/book/essence-islam-volume-1/",
    topics: ["Islam", "Allah the Exalted", "The Holy Prophet (sa)", "The Holy Quran"]
  },
  {
    volume: 2,
    volumeRoman: "II",
    title: "The Essence of Islam – Volume II",
    filename: "Essence-2.pdf",
    sourcePdfUrl: "https://files.alislam.cloud/pdf/Essence-2.pdf",
    sourceUrl: "https://www.alislam.org/book/essence-islam-volume-2/",
    topics: ["Prayer", "Remembrance of God", "Angels", "Destiny", "Life After Death", "Repentance", "Patience"]
  },
  {
    volume: 3,
    volumeRoman: "III",
    title: "The Essence of Islam – Volume III",
    filename: "Essence-3.pdf",
    sourcePdfUrl: "https://files.alislam.cloud/pdf/essence-3.pdf",
    sourceUrl: "https://www.alislam.org/book/essence-islam-volume-3/",
    topics: ["Natural, Moral and Spiritual States of Man", "Faith and Insight", "Prophethood in Islam", "The Messiah and Second Coming", "Dajjal", "Women", "The Veil"]
  },
  {
    volume: 4,
    volumeRoman: "IV",
    title: "The Essence of Islam – Volume IV",
    filename: "Essence-4.pdf",
    sourcePdfUrl: "https://files.alislam.cloud/pdf/Essence-4.pdf",
    sourceUrl: "https://www.alislam.org/book/essence-islam-volume-4/",
    topics: ["Status and Claim of the Promised Messiah", "Signs and Prophecies", "Instructions for the Jama'at", "Ahmadiyya Community"]
  },
  {
    volume: 5,
    volumeRoman: "V",
    title: "The Essence of Islam – Volume V",
    filename: "Essence-5.pdf",
    sourcePdfUrl: "https://files.alislam.cloud/pdf/Essence-5.pdf",
    sourceUrl: "https://www.alislam.org/book/essence-islam-volume-5/",
    topics: ["The Living Miracle of the Quran", "Jihad", "Religious Tolerance", "Spiritual Realities"]
  }
];

function cleanPageLines(items) {
  if (!items || items.length === 0) return { lines: [], detectedPageNum: null, runningHeader: null };

  // 1. Group text items into lines by Y-coordinate
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

  // 2. Sort lines top-to-bottom (PDF Y goes up, so sort descending)
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

  // Check top line for page number:
  // e.g. "Islam—the True and Living Faith 5" or "14 The Essence of Islam" or "1"
  const topMatch = firstLine.match(/^\s*(\d{1,4})\s+(.+)$/) ||
                   firstLine.match(/^(.+?)\s+(\d{1,4})\s*$/) ||
                   firstLine.match(/^\s*(\d{1,4})\s*$/);
  
  if (topMatch) {
    if (topMatch[2]) {
      if (/^\d+$/.test(topMatch[1])) {
        detectedPageNum = parseInt(topMatch[1], 10);
        runningHeader = topMatch[2].trim();
      } else {
        detectedPageNum = parseInt(topMatch[2], 10);
        runningHeader = topMatch[1].trim();
      }
    } else {
      detectedPageNum = parseInt(topMatch[1], 10);
    }
  }

  // Check bottom line if not detected at top
  if (!detectedPageNum) {
    const bottomMatch = lastLine.match(/^\s*(\d{1,4})\s*$/);
    if (bottomMatch) {
      detectedPageNum = parseInt(bottomMatch[1], 10);
    }
  }

  // Filter out running header line & standalone page number line
  const filteredLines = rawLines.filter((line, idx) => {
    if (idx === 0) {
      if (/^\s*\d{1,4}\s*$/.test(line)) return false;
      if (/the\s+essence\s+of\s+islam/i.test(line) && /\d+/.test(line)) return false;
      if (detectedPageNum && line.includes(String(detectedPageNum)) && line.length < 50) return false;
    }
    if (idx === rawLines.length - 1 && /^\s*\d{1,4}\s*$/.test(line)) {
      return false;
    }
    return true;
  });

  return { lines: filteredLines, detectedPageNum, runningHeader };
}

// Treatises in Ruhani Khazain regex
const SOURCE_TREATISE_REGEX = /\[\s*([A-Za-z\s'’-]+?),\s*(?:R[u\s]*h[a\s]*n[i\s]*\s*Khaz[a\s]*'?[i\s]*n|RK),?\s*(?:Vol(?:ume)?\.?\s*(\d+))?,?\s*(?:pp?\.?\s*([0-9\s,-]+))?\s*\]/i;
const GENERAL_CITATION_REGEX = /\[([A-Za-z0-9\s'’—–,.:-]+?)\]/g;

async function processVolume(meta) {
  const fullPdfPath = path.join(PDF_DIR, meta.filename);
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
  let currentTopic = meta.topics[0] || "The Essence of Islam";

  for (let p = 1; p <= numPages; p++) {
    const pageObj = await doc.getPage(p);
    const textContent = await pageObj.getTextContent();
    const { lines, detectedPageNum, runningHeader } = cleanPageLines(textContent.items);

    if (runningHeader && runningHeader.length > 3 && !/the\s+essence\s+of\s+islam/i.test(runningHeader)) {
      currentTopic = runningHeader.replace(/[—–-]\s*\d+.*$/, '').trim();
    }

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

    // Detect section headings
    const headings = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.length <= 60 && (
        /^[A-Z\s,:'’—–-]+$/.test(line) ||
        line.startsWith('Chapter') ||
        line.startsWith('Section') ||
        (i === 0 && line.length < 50)
      )) {
        if (!headings.includes(line)) headings.push(line);
      }
    }

    // Extract Ruhani Khazain source treatise citation if present on page
    let sourceTreatise = "";
    const sourceMatch = fullText.match(SOURCE_TREATISE_REGEX);
    if (sourceMatch) {
      sourceTreatise = sourceMatch[0].replace(/^\[|\]$/g, '').trim();
    } else {
      const citations = fullText.match(GENERAL_CITATION_REGEX);
      if (citations) {
        for (const c of citations) {
          if (c.toLowerCase().includes('khaza') || c.toLowerCase().includes('barahin') || c.toLowerCase().includes('vol.')) {
            sourceTreatise = c.replace(/^\[|\]$/g, '').trim();
            break;
          }
        }
      }
    }

    pages.push({
      page_num: pageNum,
      pdf_page: p,
      topic: currentTopic,
      sourceTreatise: sourceTreatise || undefined,
      text: fullText,
      headings: headings.length > 0 ? headings : undefined
    });

    if (p % 100 === 0 || p === numPages) {
      process.stdout.write(`  Processed ${p}/${numPages} pages (detected book p. ${lastKnownBookPage})\r`);
    }
  }

  console.log(`\nCompleted ${meta.title}: ${pages.length} non-empty pages extracted.`);

  const volumeData = {
    volume: meta.volume,
    volumeRoman: meta.volumeRoman,
    title: meta.title,
    author: "Hazrat Mirza Ghulam Ahmad, The Promised Messiah and Mahdi (as)",
    translator: "Muhammad Zafrulla Khan",
    publisher: "Islam International Publications Ltd.",
    sourcePdfUrl: meta.sourcePdfUrl,
    sourceUrl: meta.sourceUrl,
    totalPdfPages: numPages,
    totalPages: lastKnownBookPage || pages.length,
    topics: meta.topics,
    pages
  };

  const outputFilename = `volume_${meta.volume}.json`;
  const outputPath = path.join(OUTPUT_DIR, outputFilename);
  fs.writeFileSync(outputPath, JSON.stringify(volumeData, null, 2), 'utf8');
  console.log(`Saved volume ${meta.volume} to: ${outputPath} (${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB)`);

  return {
    volume: meta.volume,
    volumeRoman: meta.volumeRoman,
    title: meta.title,
    sourcePdfUrl: meta.sourcePdfUrl,
    sourceUrl: meta.sourceUrl,
    totalPdfPages: numPages,
    totalBookPages: lastKnownBookPage || pages.length,
    outputFile: outputFilename,
    topics: meta.topics
  };
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log("Starting The Essence of Islam Ingestion Pipeline (Volumes 1-5)...");
  const summaryVolumes = [];

  for (const meta of VOLUMES_METADATA) {
    const summary = await processVolume(meta);
    if (summary) summaryVolumes.push(summary);
  }

  const masterIndex = {
    series: "The Essence of Islam (Extracts from Ruhani Khazain)",
    author: "Hazrat Mirza Ghulam Ahmad, The Promised Messiah and Mahdi (as)",
    translator: "Muhammad Zafrulla Khan",
    publisher: "Islam International Publications Ltd.",
    totalVolumes: summaryVolumes.length,
    volumes: summaryVolumes
  };

  const indexPath = path.join(OUTPUT_DIR, 'index.json');
  fs.writeFileSync(indexPath, JSON.stringify(masterIndex, null, 2), 'utf8');
  console.log(`\n========================================`);
  console.log(`Master index written to: ${indexPath}`);
  console.log(`All 5 volumes of Essence of Islam successfully ingested!`);
}

main().catch(err => {
  console.error("Ingestion failed:", err);
  process.exit(1);
});
