/**
 * Docket Hound Agent
 * Persona: The Receipt Gatherer
 *
 * Automated monitoring of LA Superior, Miami-Dade, NY, and PACER.
 * Uses OCR for PDF extraction and LLM-driven "Jargon Translation."
 * Converts dense legal filings into "Drama Bullet Points."
 *
 * Constraint: ZERO SPECULATION. Only report what is explicitly stated.
 *
 * =============================================================================
 * FREE ALTERNATIVES USED:
 * =============================================================================
 * - PACER: Free to search (fees only apply when downloading PDFs)
 * - LA Superior: Free public access portal
 * - NY Courts: Free online case search
 * - Miami-Dade: Free online search
 * - OCR: Tesseract (free open-source) or pdftotext (poppler utils, free)
 * =============================================================================
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const OUTPUT_DIR = path.join(__dirname, '../output/dockets');
const API_KEYS_PATH = path.join(__dirname, '../config/api-keys.json');

const COURTS = {
  LA_SUPERIOR: {
    name: 'Los Angeles Superior Court',
    baseUrl: 'https://portal.lascourtsonline.org',
    searchEndpoint: '/search',
    free: true,
    authRequired: false
  },
  MIAMI_DADE: {
    name: 'Miami-Dade County Courthouse',
    baseUrl: 'https://www.miami-courts.com',
    searchEndpoint: '/docket/search',
    free: true,
    authRequired: false
  },
  NY_SUPREME: {
    name: 'New York Supreme Court',
    baseUrl: 'https://iapps.courts.state.ny.us',
    searchEndpoint: '/docket',
    free: true,
    authRequired: false
  },
  PACER: {
    name: 'PACER (Federal Courts)',
    baseUrl: 'https://pacer.login.uscourts.gov',
    searchEndpoint: '/cgi-bin/PlinkSearch',
    free: true,  // Searching is FREE, only downloading costs
    authRequired: true
  }
};

class DocketHoundAgent {
  constructor() {
    this.monitoredCases = new Map();
    this.lastChecked = new Map();
  }

  /**
   * Start monitoring all configured courts
   */
  async startMonitoring() {
    console.log('[DOCKET] Starting court monitoring...');

    for (const [courtKey, court] of Object.entries(COURTS)) {
      console.log(`[DOCKET] Monitoring ${court.name}...`);
      await this.monitorCourt(courtKey, court);
    }

    // Continuous monitoring loop
    setInterval(async () => {
      for (const [courtKey, court] of Object.entries(COURTS)) {
        await this.checkNewFilings(courtKey, court);
      }
    }, 300000); // Check every 5 minutes
  }

  async monitorCourt(courtKey, court) {
    console.log(`[DOCKET] Setting up monitor for ${court.name}...`);
    // TODO: Implement court-specific API connections
    // TODO: Set up authenticated sessions where required (PACER)
  }

  async checkNewFilings(courtKey, court) {
    console.log(`[DOCKET] Checking ${court.name} for new filings...`);

    try {
      const newFilings = await this.fetchNewFilings(court);

      for (const filing of newFilings) {
        await this.processFiling(courtKey, filing);
      }
    } catch (err) {
      console.error(`[DOCKET] Error checking ${court.name}:`, err.message);
    }
  }

  async fetchNewFilings(court) {
    // TODO: Implement court-specific filing fetch logic
    // Must handle authentication, rate limiting, and pagination
    return [];
  }

  async processFiling(courtKey, filing) {
    console.log(`[DOCKET] Processing filing: ${filing.caseNumber}`);

    // Check if already processed
    const caseKey = `${courtKey}-${filing.caseNumber}`;
    if (this.monitoredCases.has(caseKey)) {
      return;
    }

    // Download PDF
    const pdfPath = await this.downloadPDF(filing.documentUrl, caseKey);

    // Extract text via OCR
    const rawText = await this.extractText(pdfPath);

    // Convert to drama bullet points
    const dramaPoints = this.translateToDramaBulletPoints(rawText);

    // Generate output
    const report = {
      timestamp: new Date().toISOString(),
      court: COURTS[courtKey].name,
      caseNumber: filing.caseNumber,
      parties: filing.parties,
      filingType: filing.type,
      rawText: rawText,
      dramaBulletPoints: dramaPoints,
      originalUrl: filing.documentUrl
    };

    this.saveReport(caseKey, report);
    this.monitoredCases.set(caseKey, report);

    console.log(`[DOCKET] ✅ Report generated for ${filing.caseNumber}`);
  }

  async downloadPDF(url, caseKey) {
    const downloadDir = path.join(OUTPUT_DIR, 'pdfs');
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir, { recursive: true });
    }

    const filename = `${caseKey.replace(/[^a-z0-9]/gi, '_')}.pdf`;
    const filepath = path.join(downloadDir, filename);

    // TODO: Implement actual HTTP download
    // const file = fs.createWriteStream(filepath);
    // https.get(url, (response) => { response.pipe(file); });

    return filepath;
  }

  async extractText(pdfPath) {
    console.log(`[DOCKET] Extracting text from PDF...`);

    // =================================================================
    // FREE OCR OPTIONS (no paid APIs needed):
    // =================================================================
    // 1. pdftotext (poppler-utils) - FREE, install via: apt install poppler-utils
    //    Best for text-based PDFs (court filings are usually text-based)
    // 2. Tesseract OCR - FREE, install via: apt install tesseract-ocr
    //    Needed for scanned/image PDFs
    // 3. pdf-parse npm package - FREE, install via: npm install pdf-parse
    //
    // All three are 100% free and self-hosted
    // =================================================================

    try {
      // Try pdftotext first (fastest, works for most court docs)
      const text = execSync(`pdftotext "${pdfPath}" -`, { encoding: 'utf8', timeout: 30000 });
      if (text && text.length > 100) {
        console.log('[DOCKET] Text extracted via pdftotext');
        return text;
      }
    } catch (err) {
      console.log('[DOCKET] pdftotext failed, trying pdf-parse...');
    }

    try {
      // Try pdf-parse npm package (works for most PDFs)
      const pdfParse = require('pdf-parse');
      const dataBuffer = fs.readFileSync(pdfPath);
      const pdfData = await pdfParse(dataBuffer);
      console.log('[DOCKET] Text extracted via pdf-parse');
      return pdfData.text;
    } catch (err) {
      console.log('[DOCKET] pdf-parse failed, trying Tesseract...');
    }

    try {
      // Last resort: Tesseract OCR (for scanned documents)
      // First convert PDF page to image, then OCR
      // Requires: apt install poppler-utils tesseract-ocr
      //   and for PDFs: apt install ghostscript
      const tempImg = pdfPath.replace('.pdf', '.png');
      execSync(`pdftoppm "${pdfPath}" temp -png`, { cwd: path.dirname(pdfPath) });
      const text = execSync(`tesseract "${tempImg}" stdout -l eng`, { encoding: 'utf8', timeout: 60000 });
      // Clean up temp
      try { fs.unlinkSync(tempImg); } catch {}
      console.log('[DOCKET] Text extracted via Tesseract OCR');
      return text;
    } catch (err) {
      console.error('[DOCKET] All OCR methods failed:', err.message);
    }

    return '';
  }

  translateToDramaBulletPoints(rawText) {
    console.log('[DOCKET] Translating legal jargon to drama bullet points...');

    // TODO: Implement LLM-driven jargon translation
    // Key transformations:
    // - "Petitioner seeks dissolution of marriage" → "Celebrity filing for DIVORCE"
    // - "Asset division: Real property located at..." → "They're fighting over the [mansion/penthouse/yacht]"
    // - "Restraining order requested" → "OH NO, a restraining order"

    const bulletPoints = [];

    // CONSTRAINT: ZERO SPECULATION
    // Only include what's EXPLICITLY stated in the filing

    // Parse party names
    bulletPoints.push(`- ${this.extractPartyInfo(rawText)}`);

    // Parse filing type
    bulletPoints.push(`- Filing Type: ${this.extractFilingType(rawText)}`);

    // Parse key requests/relief sought
    bulletPoints.push(`- What they want: ${this.extractReliefSought(rawText)}`);

    // Parse asset mentions (carefully)
    bulletPoints.push(`- Assets mentioned: ${this.extractAssets(rawText)}`);

    return bulletPoints;
  }

  extractPartyInfo(text) {
    // TODO: Regex/LLM extraction of party names
    return '[PARTY_INFO_PLACEHOLDER]';
  }

  extractFilingType(text) {
    // TODO: Identify filing type from legal language
    return '[FILING_TYPE_PLACEHOLDER]';
  }

  extractReliefSought(text) {
    // TODO: Extract explicitly requested relief
    return '[RELIEF_PLACEHOLDER]';
  }

  extractAssets(text) {
    // TODO: Extract ONLY explicitly mentioned assets
    // BE CAREFUL: Do not speculate on unlisted assets
    return '[ASSETS_PLACEHOLDER]';
  }

  saveReport(caseKey, report) {
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const filename = `${caseKey.replace(/[^a-z0-9]/gi, '_')}.json`;
    const filepath = path.join(OUTPUT_DIR, filename);

    fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
    console.log(`[DOCKET] Report saved: ${filepath}`);
  }

  /**
   * CLI Entry Point
   */
  static main() {
    const agent = new DocketHoundAgent();
    const args = process.argv.slice(2);

    if (args.includes('--monitor')) {
      agent.startMonitoring();
    } else if (args.includes('--court')) {
      const courtKey = args[args.indexOf('--court') + 1];
      if (COURTS[courtKey.toUpperCase()]) {
        agent.checkNewFilings(courtKey.toUpperCase(), COURTS[courtKey.toUpperCase()]);
      } else {
        console.error(`[DOCKET] Unknown court: ${courtKey}`);
        console.log('[DOCKET] Available courts:', Object.keys(COURTS).join(', '));
      }
    } else {
      console.log('[DOCKET] Usage:');
      console.log('  node docket-hound-agent.js --monitor');
      console.log('  node docket-hound-agent.js --court <court_key>');
      console.log('');
      console.log('[DOCKET] Available courts:', Object.keys(COURTS).join(', '));
    }
  }
}

// Run if executed directly
if (require.main === module) {
  DocketHoundAgent.main();
}

module.exports = { DocketHoundAgent, COURTS };
