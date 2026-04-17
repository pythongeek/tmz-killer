/**
 * Editor-in-Chief Orchestrator
 * Persona: "The Harvey" (Master Controller)
 *
 * The Triage: Calculates Virality Probability Score (0-100)
 * - Score > 85: Full-throttle deployment, bypasses normal review
 * - Score 50-84: Standard SEO queue, focus on gap analysis
 *
 * Legal Gate: Final scan for libel and defamation risks
 * before triggering wordpress-manager
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const INPUT_DIR = path.join(__dirname, '../input');
const OUTPUT_DIR = path.join(__dirname, '../output');
const STAGING_DIR = path.join(OUTPUT_DIR, 'staging');

const VIRALITY_THRESHOLDS = {
  CRITICAL: 85,
  STANDARD: 50
};

class EicOrchestrator {
  constructor() {
    this.pendingQueue = [];
    this.priorityQueue = [];
    this.processedHistory = [];
  }

  /**
   * Main entry point - watch for incoming tips
   */
  async watch() {
    console.log('[EIC] 🎛️  The Harvey is online. Monitoring for tips...');

    // Watch input directory for breaking-tip.json files
    this.watchInputDirectory();

    // Also poll as backup
    setInterval(() => this.pollForTips(), 30000);
  }

  watchInputDirectory() {
    console.log('[EIC] Watching input directory for new tips...');

    // TODO: Implement file watcher (fs.watch or chokidar)
    // On new breaking-tip.json:
    // 1. Load and validate
    // 2. Calculate virality score
    // 3. Route to appropriate queue
  }

  async pollForTips() {
    const inputPath = path.join(INPUT_DIR, 'breaking-tip.json');

    if (fs.existsSync(inputPath)) {
      await this.processIncomingTip(inputPath);
    }
  }

  async processIncomingTip(tipPath) {
    console.log(`[EIC] 📥 Incoming tip: ${tipPath}`);

    try {
      const tip = JSON.parse(fs.readFileSync(tipPath, 'utf8'));

      // Calculate virality score
      const viralityScore = this.calculateViralityScore(tip);

      console.log(`[EIC] Virality Score: ${viralityScore}/100`);

      // Route based on score
      if (viralityScore > VIRALITY_THRESHOLDS.CRITICAL) {
        console.log('[EIC] 🚨 CRITICAL - Full-throttle deployment!');
        await this.fullThrottleDeployment(tip, viralityScore);
      } else if (viralityScore >= VIRALITY_THRESHOLDS.STANDARD) {
        console.log('[EIC] 📋 STANDARD - Queued for SEO processing');
        await this.standardSeoQueue(tip, viralityScore);
      } else {
        console.log('[EIC] ⏸️  LOW - Archived, not newsworthy enough');
        this.archiveTip(tip, viralityScore, 'low_score');
      }

      // Clear processed tip
      fs.unlinkSync(tipPath);

    } catch (err) {
      console.error('[EIC] Error processing tip:', err.message);
    }
  }

  calculateViralityScore(tip) {
    console.log('[EIC] Calculating Virality Probability Score...');

    // Scoring factors (total: 100 points max)
    let score = 0;

    // Factor 1: Celebrity tier (0-30 points)
    // A-list (Taylor Swift, Beyonce, etc.): 30
    // B-list: 20
    // C-list: 10
    score += this.scoreCelebrityTier(tip.subject);

    // Factor 2: Story type (0-25 points)
    // Breakup/Divorce: 25 (always viral)
    // Cheating Scandal: 25
    // Legal Trouble: 20
    // New Relationship: 15
    // Career Move: 10
    score += this.scoreStoryType(tip.primarySignal);

    // Factor 3: Verification confidence (0-25 points)
    // Multi-platform confirmed: 25
    // Single platform strong: 15
    // Unconfirmed rumor: 5
    score += this.scoreVerificationConfidence(tip.confidence);

    // Factor 4: Timing (0-10 points)
    // During awards season: +10
    // Holiday season: +5
    // Slow news cycle: +5
    score += this.scoreTiming();

    // Factor 5: Engagement potential (0-10 points)
    // Controversial/polarizing: 10
    // Universal emotional appeal: 8
    // Niche interest: 4
    score += this.scoreEngagementPotential(tip);

    return Math.min(100, score);
  }

  scoreCelebrityTier(subject) {
    // TODO: Load celebrity database and check tier
    const aList = ['taylor swift', 'beyonce', 'kim kardashian', 'kanye west', 'elon musk'];
    const bList = ['扎克伯格', 'bill gates', 'a-list adjacent'];

    const subjectLower = subject?.toLowerCase() || '';

    if (aList.some(name => subjectLower.includes(name))) return 30;
    if (bList.some(name => subjectLower.includes(name))) return 20;
    return 10;
  }

  scoreStoryType(signal) {
    const highViral = ['divorce', 'breakup', 'cheating', 'affair'];
    const mediumViral = ['legal', 'arrest', 'lawsuit', 'restraining order'];
    const lowerViral = ['relationship', 'dating', 'split'];

    const signalLower = (signal || '').toLowerCase();

    if (highViral.some(term => signalLower.includes(term))) return 25;
    if (mediumViral.some(term => signalLower.includes(term))) return 20;
    if (lowerViral.some(term => signalLower.includes(term))) return 15;
    return 5;
  }

  scoreVerificationConfidence(confidence) {
    if (confidence >= 3) return 25;
    if (confidence === 2) return 15;
    return 5;
  }

  scoreTiming() {
    let score = 5; // Base score

    const now = new Date();
    const month = now.getMonth(); // 0-indexed

    // Awards season: Jan-Feb (Oscars), Sep-Oct (Emmys)
    if (month === 0 || month === 1 || month === 8 || month === 9) {
      score += 5;
    }

    // TODO: Check for slow news cycles, breaking news events

    return score;
  }

  scoreEngagementPotential(tip) {
    // TODO: Analyze tip for engagement triggers
    // Controversy, shock value, relatability

    return 7; // Default moderate engagement
  }

  async fullThrottleDeployment(tip, viralityScore) {
    console.log('[EIC] ⚡ FULL-THROTTLE: Triggering SEO content agent NOW...');

    // Step 1: Legal scan first
    const legalRisks = await this.legalGateScan(tip);

    if (legalRisks.length > 0) {
      console.warn('[EIC] ⚠️  LEGAL GATE: Risks detected!');
      console.warn('[EIC] Risks:', legalRisks);

      // For critical stories, we still proceed but flag for review
      console.log('[EIC] Proceeding with caution - risks flagged.');
    }

    // Step 2: Trigger SEO content agent with priority=urgent
    await this.triggerSeoAgent(tip, 'urgent');

    // Step 3: Immediately queue for video production
    await this.triggerViralFactory(tip);

    // Step 4: Push to WordPress immediately
    await this.triggerWordpressPush(tip);

    this.recordProcessed(tip, viralityScore, 'full_throttle');
  }

  async standardSeoQueue(tip, viralityScore) {
    console.log('[EIC] 📋 STANDARD QUEUE: Gap analysis mode...');

    // Step 1: Check for content gaps vs competitors
    const gapAnalysis = await this.performGapAnalysis(tip);

    // Step 2: Add to SEO queue with gap insights
    const queuedItem = {
      ...tip,
      viralityScore,
      gapAnalysis,
      queuedAt: new Date().toISOString()
    };

    this.pendingQueue.push(queuedItem);
    this.saveSeoQueue();

    this.recordProcessed(tip, viralityScore, 'standard_queue');
  }

  async performGapAnalysis(tip) {
    // TODO: Analyze what competitors have published
    // Identify unique angles we can own
    // Find long-tail opportunities

    return {
      competitorCount: 0, // TODO
      uniqueAngle: null,
      longTailOpportunities: []
    };
  }

  async legalGateScan(tip) {
    console.log('[EIC] ⚖️  Running legal gate scan...');

    const risks = [];

    // TODO: Implement legal risk detection
    // - Check for unverified allegations
    // - Flag potentially defamatory statements
    // - Check for invasion of privacy issues
    // - Verify no names of minors (unless public interest)

    // Example checks:
    if (tip.primarySignal?.includes('alleged')) {
      risks.push('Contains unverified allegations - use "alleged" language');
    }

    if (!tip.confidence || tip.confidence < 2) {
      risks.push('Low confidence signal - fact-check before publishing');
    }

    return risks;
  }

  async triggerSeoAgent(tip, priority = 'standard') {
    console.log(`[EIC] 📝 Triggering seo-content-intelligence-agent.js --priority=${priority}`);

    // TODO: Execute seo-content-intelligence-agent
    // const child = spawn('node', [
    //   path.join(__dirname, 'seo-content-intelligence-agent.js'),
    //   tip.subject,
    //   `--style=breaking`,
    //   `--priority=${priority}`
    // ], { stdio: 'inherit' });

    return { triggered: true, priority };
  }

  async triggerViralFactory(tip) {
    console.log('[EIC] 🎬 Triggering viral-asset-factory.js...');

    // TODO: Execute viral-asset-factory
    // First need SEO content to be ready
    // This will be triggered after SEO content is done

    return { triggered: true };
  }

  async triggerWordpressPush(tip) {
    console.log('[EIC] 🌐 Triggering wordpress-manager...');

    // TODO: Push content to WordPress via API
    // Must pass legal gate first!

    return { triggered: true };
  }

  archiveTip(tip, viralityScore, reason) {
    const archiveDir = path.join(OUTPUT_DIR, 'archive');
    if (!fs.existsSync(archiveDir)) {
      fs.mkdirSync(archiveDir, { recursive: true });
    }

    const archivePath = path.join(
      archiveDir,
      `archived_${Date.now()}.json`
    );

    fs.writeFileSync(archivePath, JSON.stringify({
      tip,
      viralityScore,
      reason,
      archivedAt: new Date().toISOString()
    }, null, 2));
  }

  saveSeoQueue() {
    const queuePath = path.join(OUTPUT_DIR, 'seo-queue.json');
    fs.writeFileSync(queuePath, JSON.stringify(this.pendingQueue, null, 2));
  }

  recordProcessed(tip, viralityScore, deploymentType) {
    this.processedHistory.push({
      tip,
      viralityScore,
      deploymentType,
      processedAt: new Date().toISOString()
    });
  }

  /**
   * CLI Entry Point
   */
  static main() {
    const orchestrator = new EicOrchestrator();
    const args = process.argv.slice(2);

    if (args.includes('--watch')) {
      orchestrator.watch();
    } else if (args.includes('--score')) {
      // Manual scoring mode for testing
      const tipPath = args[args.indexOf('--score') + 1];
      if (tipPath && fs.existsSync(tipPath)) {
        const tip = JSON.parse(fs.readFileSync(tipPath, 'utf8'));
        const score = orchestrator.calculateViralityScore(tip);
        console.log(`Virality Score: ${score}/100`);
      } else {
        console.error('Please provide a valid tip path');
      }
    } else {
      console.log('[EIC] Usage:');
      console.log('  node eic-orchestrator.js --watch');
      console.log('  node eic-orchestrator.js --score <tip.json>');
    }
  }
}

// Run if executed directly
if (require.main === module) {
  EicOrchestrator.main();
}

module.exports = { EicOrchestrator, VIRALITY_THRESHOLDS };
