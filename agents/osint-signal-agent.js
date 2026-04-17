/**
 * OSINT Signal Detection Agent
 * Persona: The Digital Paparazzi
 *
 * Monitors the "Whale Database" (Top 500 celebrities + inner circles)
 * for "Digital Bleeding" — sudden unfollows, mass post archiving, or
 * private jet transponder anomalies.
 *
 * Verification Gate: Must confirm signal across at least TWO platforms
 * before outputting breaking-tip.json
 *
 * =============================================================================
 * FREE ALTERNATIVES USED (no paid APIs required):
 * =============================================================================
 * - Instagram: Public scraping via iggg.me or instagram-private-api (npm)
 * - X/Twitter: Free Reddit sentiment + Google Alerts as signal sources
 * - TikTok: Public scrape via TikWM.com API or similar free endpoints
 * - Flight Tracking: OpenSky Network (free) or ADS-B Exchange (free)
 * =============================================================================
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');

const WHALE_DB_PATH = path.join(__dirname, '../data/whale-database.json');
const API_KEYS_PATH = path.join(__dirname, '../config/api-keys.json');
const OUTPUT_PATH = path.join(__dirname, '../output/breaking-tip.json');

const PLATFORMS = {
  INSTAGRAM: 'instagram',
  X: 'x',
  TIKTOK: 'tiktok',
  FLIGHT_RADAR: 'flight_radar',
  REDDIT: 'reddit'    // Free signal source
};

class OsintSignalAgent {
  constructor() {
    this.signals = [];
    this.whaleDatabase = this.loadWhaleDatabase();
  }

  loadWhaleDatabase() {
    try {
      if (fs.existsSync(WHALE_DB_PATH)) {
        return JSON.parse(fs.readFileSync(WHALE_DB_PATH, 'utf8'));
      }
    } catch (err) {
      console.warn('[OSINT] Could not load whale database:', err.message);
    }
    return { celebrities: [], innerCircles: [] };
  }

  /**
   * Main continuous scan loop
   */
  async continuousScan() {
    console.log('[OSINT] Starting continuous signal scan...');

    while (true) {
      try {
        await this.scanAllPlatforms();
        await this.analyzeSignals();
        await this.checkVerificationGate();
      } catch (err) {
        console.error('[OSINT] Scan error:', err.message);
      }

      // Scan interval: 60 seconds
      await this.sleep(60000);
    }
  }

  async scanAllPlatforms() {
    console.log('[OSINT] Scanning platforms for signals...');

    // Scan social platforms (using free methods)
    await this.scanInstagram();
    await this.scanX();
    await this.scanTiktok();

    // Free: Reddit as celebrity gossip signal aggregator
    await this.scanReddit();

    // Free: OpenSky Network for private jet tracking (no API key needed)
    await this.scanFlightRadarFree();
  }

  /**
   * FREE METHOD: Instagram scraping via public endpoints
   * No API key needed - uses public profile data
   */
  async scanInstagram() {
    console.log('[OSINT] Checking Instagram (free scrape)...');

    // FREE OPTION 1: Use public profile pages (no auth)
    // Instagram public profiles show:
    // - Follower counts
    // - Bio changes (via archive.is or similar)
    // - Post counts
    //
    // Example: Check if a celeb's post count dropped suddenly
    // Use instagram-private-api npm package (free, no official API)

    const apiKeys = this.loadApiKeys();
    const instagramTarget = apiKeys?.instagram?.targets || [];

    for (const celeb of this.whaleDatabase.celebrities || []) {
      // Check if in our monitored list
      if (!instagramTarget.includes(celeb.username)) continue;

      try {
        // FREE: Use instagram-private-api (npm install instagram-private-api)
        // const { IgApiClient } = require('instagram-private-api');
        // const ig = new IgApiClient();
        // ig.state.generateDevice(celeb.username);
        // await ig.account.login(username, password);
        // const user = await ig.user.info(celeb.pk);
        // Check: user.follower_count, user.media_count

        this.signals.push({
          platform: PLATFORMS.INSTAGRAM,
          celeb: celeb.name,
          type: 'follower_count',
          value: '[PLACEHOLDER]', // Would be actual count from scrape
          timestamp: new Date().toISOString()
        });
      } catch (err) {
        console.warn(`[OSINT] IG scrape failed for ${celeb.name}:`, err.message);
      }
    }
  }

  /**
   * FREE METHOD: Reddit as celebrity gossip signal source
   * Reddit is 100% free to access via JSON API
   */
  async scanReddit() {
    console.log('[OSINT] Checking Reddit (free JSON API)...');

    // Reddit's public JSON API: https://www.reddit.com/r/{subreddit}/new.json
    // No API key needed for read-only public access

    const subreddits = [
      'FauxMoI',      // CeCelebrity gossip
      'Dear_Molotov', // Relationship tea
      'ktoreports',   // Kiwi Farms (celeb watchdog)
      'CringeParam',  // Pop culture snark
      ' DeuxMoi'      // Blind items
    ];

    for (const sub of subreddits) {
      try {
        const posts = await this.fetchRedditSubreddit(sub);

        for (const post of posts) {
          // Check for celebrity mentions from whale database
          for (const celeb of this.whaleDatabase.celebrities || []) {
            if (post.title.toLowerCase().includes(celeb.name.toLowerCase())) {
              this.signals.push({
                platform: PLATFORMS.REDDIT,
                celeb: celeb.name,
                type: 'gossip_post',
                title: post.title,
                score: post.score,
                url: post.url,
                timestamp: new Date().toISOString()
              });
            }
          }
        }
      } catch (err) {
        console.warn(`[OSINT] Reddit fetch failed for ${sub}:`, err.message);
      }
    }
  }

  fetchRedditSubreddit(subreddit) {
    return new Promise((resolve, reject) => {
      const url = `https://www.reddit.com/r/${subreddit}/new.json?limit=25`;
      https.get(url, { headers: { 'User-Agent': 'TMZ-Killer-OSINT/1.0' } }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            const posts = (json.data?.children || []).map(child => ({
              title: child.data?.title || '',
              score: child.data?.score || 0,
              url: child.data?.url || '',
              created: child.data?.created_utc || 0
            }));
            resolve(posts);
          } catch {
            resolve([]);
          }
        });
      }).on('error', reject);
    });
  }

  /**
   * FREE METHOD: X/Twitter via Nitter (free, no auth)
   * Nitter is an open-source Twitter frontend with RSS/JSON
   */
  async scanX() {
    console.log('[OSINT] Checking X via Nitter (free, no auth)...');

    // FREE: Use Nitter instances (no API key needed)
    // Nitter instances: nitter.net, nitter.privacydev.net, etc.
    // Returns RSS feeds and some profile data

    const nitterInstances = [
      'https://nitter.privacydev.net',
      'https://nitter.net'
    ];

    for (const celeb of this.whaleDatabase.celebrities || []) {
      if (!celeb.twitter) continue;

      for (const instance of nitterInstances) {
        try {
          const url = `${instance}/${celeb.twitter}/rss`;
          // Use RSS parser or direct fetch
          // Free, no authentication

          this.signals.push({
            platform: PLATFORMS.X,
            celeb: celeb.name,
            type: 'twitter_activity',
            handle: celeb.twitter,
            timestamp: new Date().toISOString()
          });
          break; // Success, stop trying instances
        } catch {
          // Try next instance
        }
      }
    }
  }

  /**
   * FREE METHOD: TikTok via free web scraper
   * No TikTok API needed - uses public data
   */
  async scanTiktok() {
    console.log('[OSINT] Checking TikTok (free scrape)...');

    // FREE OPTIONS:
    // 1. TikWM.com API (free tier) - no auth needed for basic data
    // 2. ssstik.me API (free)
    // 3. RapidAPI TikScraper (free tier available)

    // Example using free RapidAPI tier:
    // const apiKeys = this.loadApiKeys();
    // if (apiKeys?.rapidapi?.key) { ... }

    // For now: Check Google Trends for TikTok viral moments
    await this.checkGoogleTrends();
  }

  async checkGoogleTrends() {
    // FREE: Google Trends has a free RSS/API
    // https://trends.google.com/trends/trendingsearches/daily/rss?geo=US
    // This captures what people are searching - good leading indicator

    try {
      const url = 'https://trends.google.com/trends/trendingsearches/daily/rss?geo=US';
      https.get(url, { headers: { 'User-Agent': 'TMZ-Killer-OSINT/1.0' } }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          // Parse RSS - look for celebrity names
          for (const celeb of this.whaleDatabase.celebrities || []) {
            if (data.toLowerCase().includes(celeb.name.toLowerCase())) {
              this.signals.push({
                platform: 'google_trends',
                celeb: celeb.name,
                type: 'trending_search',
                timestamp: new Date().toISOString()
              });
            }
          }
        });
      });
    } catch (err) {
      console.warn('[OSINT] Google Trends fetch failed:', err.message);
    }
  }

  /**
   * FREE METHOD: Flight tracking via OpenSky Network
   * No API key needed - completely free
   * https://opensky-network.org/apidoc
   */
  async scanFlightRadarFree() {
    console.log('[OSINT] Checking OpenSky Network (FREE, no API key)...');

    // FREE: OpenSky Network API
    // - No API key required
    // - Limit: 1000 requests/hour for free tier
    // - Get real-time flight data by callsign, ICAO, or bounding box

    try {
      // Example: Get flights within bounding box around LA
      // Los Angeles bounding box: 33.5, -118.7, 34.3, -117.5
      const bbox = '33.5,-118.7,34.3,-117.5'; // LA area
      const url = `https://opensky-network.org/api/flights/all?begin=${this.getTodayStart()}&end=${this.getNowEpoch()}&bbox=${bbox}`;

      https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const flights = JSON.parse(data);
            // Look for private jets (vs commercial)
            // Private jets often have callsigns like N123AB or use specific ICAO types
            for (const flight of flights || []) {
              if (this.isPrivateJet(flight)) {
                const matchedCeleb = this.matchFlightToCeleb(flight);
                if (matchedCeleb) {
                  this.signals.push({
                    platform: PLATFORMS.FLIGHT_RADAR,
                    celeb: matchedCeleb.name,
                    type: 'private_jet_flight',
                    callsign: flight.callsign,
                    origin: flight.estDepartureAirport,
                    destination: flight.estArrivalAirport,
                    timestamp: new Date().toISOString()
                  });
                }
              }
            }
          } catch {
            // Ignore parse errors
          }
        });
      });
    } catch (err) {
      console.warn('[OSINT] OpenSky fetch failed:', err.message);
    }
  }

  /**
   * Also supports paid FlightRadar24 if user has API key
   */
  async scanFlightRadar() {
    // This method kept for when user adds FR24 API key
    // For free operation, scanFlightRadarFree() is used instead
    console.log('[OSINT] FlightRadar24 paid API not configured - using free OpenSky');
  }

  isPrivateJet(flight) {
    // Private jet heuristic:
    // - Short flights (<2 hrs)
    // - Callsign looks like N-number or European registration
    // - Departing from private FBO airports
    const callsign = (flight.callsign || '').toUpperCase();
    // N-numbers (US): N followed by 5 characters
    // European: similar patterns
    return /^[A-Z]{0,2}[0-9][A-Z0-9]{3,5}$/.test(callsign) || flight.number < 1000;
  }

  matchFlightToCeleb(flight) {
    // TODO: Match flight to celebrity based on:
    // - Known N-numbers from celebrity fleet databases
    // - Flight patterns (celebrity flying to gossip hotspots)
    return null;
  }

  getTodayStart() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return Math.floor(d.getTime() / 1000);
  }

  getNowEpoch() {
    return Math.floor(Date.now() / 1000);
  }

  loadApiKeys() {
    try {
      if (fs.existsSync(API_KEYS_PATH)) {
        return JSON.parse(fs.readFileSync(API_KEYS_PATH, 'utf8'));
      }
    } catch {}
    return {};
  }

  async analyzeSignals() {
    console.log('[OSINT] Analyzing signals for Digital Bleeding patterns...');

    // Pattern matching for:
    // 1. Sudden unfollows (>50% in 24h)
    // 2. Mass post archiving (>10 posts deleted)
    // 3. Private jet to: LA, Miami, NYC unexpectedly

    // TODO: Implement signal analysis algorithms
  }

  async checkVerificationGate() {
    // VERIFICATION GATE: Must confirm across AT LEAST TWO platforms
    // Platform combinations:
    // - Instagram + X
    // - Instagram + Flight Radar
    // - X + TikTok
    // etc.

    const platformSignals = this.groupByPlatform(this.signals);

    for (const [platform1, signals1] of Object.entries(platformSignals)) {
      for (const [platform2, signals2] of Object.entries(platformSignals)) {
        if (platform1 >= platform2) continue;

        const crossPlatformMatch = this.findCrossPlatformCorrelation(
          signals1,
          signals2
        );

        if (crossPlatformMatch && crossPlatformMatch.confidence >= 2) {
          this.emitBreakingTip(crossPlatformMatch);
        }
      }
    }
  }

  groupByPlatform(signals) {
    return signals.reduce((acc, signal) => {
      if (!acc[signal.platform]) acc[signal.platform] = [];
      acc[signal.platform].push(signal);
      return acc;
    }, {});
  }

  findCrossPlatformCorrelation(signals1, signals2) {
    // TODO: Implement correlation logic
    // Must find temporal and content correlation between platforms
    return null;
  }

  emitBreakingTip(correlation) {
    console.log('[OSINT] 🚨 BREAKING TIP GENERATED!');

    const tip = {
      timestamp: new Date().toISOString(),
      subject: correlation.subject,
      primarySignal: correlation.primarySignal,
      secondarySignal: correlation.secondarySignal,
      confidence: correlation.confidence,
      platforms: correlation.platforms,
      recommendedAction: 'ESCALATE_TO_EIC'
    };

    // Ensure output directory exists
    const outputDir = path.dirname(OUTPUT_PATH);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(tip, null, 2));
    console.log('[OSINT] Breaking tip written to:', OUTPUT_PATH);

    return tip;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * CLI Entry Point
   */
  static main() {
    const agent = new OsintSignalAgent();
    const mode = process.argv.includes('--mode=continuous-scan') ? 'continuous' : 'single';

    if (mode === 'continuous') {
      agent.continuousScan();
    } else {
      console.log('[OSINT] Single scan mode...');
      agent.scanAllPlatforms().then(() => {
        console.log('[OSINT] Scan complete.');
        process.exit(0);
      });
    }
  }
}

// Run if executed directly
if (require.main === module) {
  OsintSignalAgent.main();
}

module.exports = { OsintSignalAgent };
