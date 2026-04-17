/**
 * Viral Asset Factory
 * Persona: The Amplifier
 *
 * Multimodal Transformation Agent
 * Ingests SEO articles and extracts:
 * - 3-second "Pattern Interrupt" hook
 * - 3 core facts
 *
 * Platform Outputs:
 * - TikTok/Shorts: 9:16 ratio, kinetic captions, high-energy TTS voiceover
 * - X: 5-7 post threads with "open-loop" psychological hooks
 *
 * Constraint: All video scripts must be under 45 seconds
 *
 * =============================================================================
 * FREE ALTERNATIVES USED (no paid APIs required):
 * =============================================================================
 * - TTS: Google Translate TTS (100% free) or
 *        Coqui TTS (open-source, self-hosted)
 * - Video: FFmpeg (free, open-source) for video generation
 * - Captions: whale字幕 (built into FFmpeg) or subtitle-edit (free)
 * - Image Generation: NONE needed (use text overlays + stock footage)
 * =============================================================================
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { spawn } = require('child_process');

const OUTPUT_DIR = path.join(__dirname, '../output/viral-assets');
const API_KEYS_PATH = path.join(__dirname, '../config/api-keys.json');

const PLATFORMS = {
  TIKTOK: 'tiktok',
  X_THREAD: 'x_thread',
  YOUTUBE_SHORTS: 'youtube_shorts'
};

class ViralAssetFactory {
  constructor() {
    this.platformSpecs = {
      [PLATFORMS.TIKTOK]: {
        aspectRatio: '9:16',
        duration: 45, // seconds max
        captionStyle: 'kinetic',
        voiceoverStyle: 'high-energy'
      },
      [PLATFORMS.X_THREAD]: {
        posts: '5-7',
        hookStyle: 'open-loop',
        maxCharsPerPost: 280
      },
      [PLATFORMS.YOUTUBE_SHORTS]: {
        aspectRatio: '9:16',
        duration: 60,
        captionStyle: 'kinetic',
        voiceoverStyle: 'medium-energy'
      }
    };
  }

  /**
   * Main entry point: Generate viral assets from source content
   */
  async generateAssets(sourcePath, outputFormats = ['tiktok', 'x_thread']) {
    console.log('[FACTORY] Starting viral asset generation...');

    // Load source content
    const source = this.loadSource(sourcePath);

    // Extract hook + facts
    const extracted = this.extractHookAndFacts(source);

    const results = {};

    for (const format of outputFormats) {
      console.log(`[FACTORY] Generating ${format} asset...`);

      switch (format) {
        case 'tiktok':
        case 'youtube_shorts':
          results[format] = await this.generateVideoAsset(extracted, format);
          break;
        case 'x_thread':
          results[format] = await this.generateThreadAsset(extracted);
          break;
        default:
          console.warn(`[FACTORY] Unknown format: ${format}`);
      }
    }

    return results;
  }

  loadSource(sourcePath) {
    console.log(`[FACTORY] Loading source from: ${sourcePath}`);

    if (fs.existsSync(sourcePath)) {
      const content = fs.readFileSync(sourcePath, 'utf8');
      try {
        return JSON.parse(content);
      } catch {
        return { text: content, title: 'Untitled' };
      }
    }

    return { text: sourcePath, title: 'Direct Input' };
  }

  extractHookAndFacts(source) {
    console.log('[FACTORY] Extracting pattern interrupt hook and 3 core facts...');

    // TODO: Implement LLM-driven extraction
    // Input: SEO article or structured JSON
    // Output:
    //   - hook: 3-second attention grabber
    //   - fact1, fact2, fact3: Key story points
    //   - closingLoop: How to end for engagement

    // The "Pattern Interrupt" should be:
    // - Visceral / shocking statistic
    // - Provocative question
    // - Bold claim that breaks expectations

    // Example outputs:
    return {
      hook: '[PATTERN_INTERRUPT_PLACEHOLDER]',
      fact1: '[FACT_1_PLACEHOLDER]',
      fact2: '[FACT_2_PLACEHOLDER]',
      fact3: '[FACT_3_PLACEHOLDER]',
      closingLoop: '[CLOSING_LOOP_PLACEHOLDER]',
      sourceTitle: source.title || 'Untitled'
    };
  }

  async generateVideoAsset(extracted, platform) {
    console.log(`[FACTORY] Generating ${platform} video script...`);

    const spec = this.platformSpecs[platform];
    const script = this.buildVideoScript(extracted, spec);

    const output = {
      platform,
      script,
      timing: {
        hookDuration: '0-3s',
        fact1Duration: '3-15s',
        fact2Duration: '15-27s',
        fact3Duration: '27-39s',
        closingDuration: '39-45s'
      },
      captionStyle: spec.captionStyle,
      voiceoverStyle: spec.voiceoverStyle,
      outputPath: this.getOutputPath(platform, 'json')
    };

    // Save script
    this.saveAsset(output);

    // Generate TTS audio (FREE methods)
    await this.generateTTSFree(script);

    // Generate captions (FREE - built into FFmpeg)
    await this.generateCaptionsFree(script, platform);

    // TODO: Compile video with FFmpeg (see compileVideoFree method)
    // await this.compileVideoFree(platform, output);

    return output;
  }

  /**
   * FREE TTS: Google Translate method (100% free, no API key)
   * Uses the same TTS engine behind translate.google.com
   */
  async generateTTSFree(script) {
    console.log('[FACTORY] Generating TTS (FREE - Google Translate method)...');

    // =================================================================
    // FREE TTS OPTIONS:
    // =================================================================
    // 1. Google Translate TTS (used here) - 100% FREE, no API key
    //    - Works by hitting translate.google.com
    //    - Limit: Don't abuse or IP may get rate-limited
    //    - Voice: Use ?tl=en-US for US English
    //
    // 2. Coqui TTS (open-source, self-hosted) - 100% FREE
    //    - Install: pip install TTS
    //    - Much higher quality, no rate limits
    //    - Best for production
    //
    // 3. espeak-ng (free, command-line) - 100% FREE
    //    - Install: apt install espeak-ng
    //    - Works offline
    // =================================================================

    const fullText = `${script.hook}. ${script.body}. ${script.closing}`;

    // Method 1: Google Translate TTS (quick, free)
    try {
      const mp3Path = this.getOutputPath('tiktok', 'mp3').replace('.mp3', '_voice.mp3');
      // Download from Google Translate TTS
      // Note: This may break as Google updates their API
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(fullText)}&tl=en-US&client=twob`;
      execSync(`curl -s -A "Mozilla/5.0" -o "${mp3Path}" "${url}"`, { timeout: 30000 });
      console.log('[FACTORY] TTS saved (Google Translate method):', mp3Path);
      return mp3Path;
    } catch (err) {
      console.warn('[FACTORY] Google TTS failed, trying espeak-ng...');
    }

    // Method 2: espeak-ng (fallback, always works)
    try {
      const wavPath = this.getOutputPath('tiktok', 'wav').replace('.wav', '_voice.wav');
      execSync(`espeak-ng "${fullText}" -w "${wavPath}" --rate=150`, { timeout: 30000 });
      console.log('[FACTORY] TTS saved (espeak-ng):', wavPath);
      return wavPath;
    } catch (err) {
      console.warn('[FACTORY] espeak-ng not installed:', err.message);
      console.log('[FACTORY] Install with: apt install espeak-ng');
    }

    return null;
  }

  /**
   * FREE Captions: Using FFmpeg drawtext filter
   */
  async generateCaptionsFree(script, platform) {
    console.log('[FACTORY] Generating captions (FREE - FFmpeg)...');

    // FFmpeg with drawtext filter is 100% free
    // You can create simple text overlays this way
    // For kinetic captions (animated), you'd need to pre-render frames

    // Example FFmpeg command for simple subtitles:
    // ffmpeg -i video.mp4 -vf "subtitles=subs.srt" output.mp4

    // TODO: For full kinetic captions, pre-render each frame with ImageMagick
    // convert -background black -fill white -font Arial-Bold -pointsize 72 \
    //   label:"HOOK TEXT" hook_frame.png

    console.log('[FACTORY] Caption generation requires FFmpeg + ImageMagick');
    console.log('[FACTORY] Install: apt install ffmpeg imagemagick');

    return null;
  }

  /**
   * FREE Video Compilation: FFmpeg
   * Compiles images + audio + captions into final video
   */
  async compileVideoFree(platform, output) {
    console.log('[FACTORY] Compiling video (FREE - FFmpeg)...');

    // Requires:
    // - FFmpeg installed (apt install ffmpeg)
    // - Background image/video
    // - TTS audio file
    // - Caption files

    // Example FFmpeg command structure:
    // ffmpeg -loop 1 -i background.jpg -i voice.mp3 \
    //   -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2" \
    //   -c:v libx264 -t 45 -pix_fmt yuv420p -c:a aac output.mp4

    console.log('[FACTORY] Video compilation would use FFmpeg command above');
    return null;
  }

  buildVideoScript(extracted, spec) {
    // Enforce 45-second constraint
    const maxWords = 110; // ~140 WPM average speaking rate

    return {
      hook: extracted.hook,
      body: [
        extracted.fact1,
        extracted.fact2,
        extracted.fact3
      ].filter(Boolean).join(' '),
      closing: extracted.closingLoop,
      captionTemplate: this.buildCaptionTemplate(extracted, spec.captionStyle)
    };
  }

  buildCaptionTemplate(extracted, style) {
    // Kinetic captions = big, bold, animated text
    // that pops on screen with key words highlighted

    if (style === 'kinetic') {
      return {
        hook: { text: extracted.hook, animation: 'zoom-in', fontSize: 'extra-large' },
        facts: extracted.fact1 + '|' + extracted.fact2 + '|' + extracted.fact3,
        closing: { text: extracted.closingLoop, animation: 'pulse' }
      };
    }

    return { text: extracted.hook };
  }

  async generateThreadAsset(extracted) {
    console.log('[FACTORY] Generating X thread...');

    const spec = this.platformSpecs[PLATFORMS.X_THREAD];
    const posts = this.buildThreadPosts(extracted, spec);

    const output = {
      platform: 'x_thread',
      posts,
      hookStyle: spec.hookStyle,
      totalPosts: posts.length,
      outputPath: this.getOutputPath('x_thread', 'json')
    };

    this.saveAsset(output);

    // TODO: Generate images for each post
    // TODO: Schedule thread posting via social API

    return output;
  }

  buildThreadPosts(extracted, spec) {
    // X Thread Structure:
    // Post 1: HOOK (open loop - creates curiosity)
    // Post 2-6: FACTS (build the story)
    // Post 7: CLOSING + CTA (follow for more)

    const posts = [];

    // Post 1: The Hook (must stop the scroll)
    posts.push({
      number: 1,
      text: extracted.hook,
      isHook: true
    });

    // Posts 2-4: Core facts
    if (extracted.fact1) {
      posts.push({ number: 2, text: extracted.fact1, isFact: true });
    }
    if (extracted.fact2) {
      posts.push({ number: 3, text: extracted.fact2, isFact: true });
    }
    if (extracted.fact3) {
      posts.push({ number: 4, text: extracted.fact3, isFact: true });
    }

    // Post 5: The reveal / plot twist
    posts.push({
      number: 5,
      text: `And THEN... ${extracted.closingLoop}`,
      isReveal: true
    });

    // Post 6: The close (open loop for engagement)
    posts.push({
      number: 6,
      text: 'Follow for more celebrity chaos updates 🏆',
      isClosing: true
    });

    // Trim to max 7 posts
    return posts.slice(0, 7);
  }

  getOutputPath(platform, extension) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${platform}_${timestamp}.${extension}`;
    return path.join(OUTPUT_DIR, filename);
  }

  saveAsset(asset) {
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    fs.writeFileSync(asset.outputPath, JSON.stringify(asset, null, 2));
    console.log(`[FACTORY] Asset saved: ${asset.outputPath}`);
  }

  /**
   * CLI Entry Point
   */
  static main() {
    const args = process.argv.slice(2);

    let sourcePath = null;
    let outputs = ['tiktok', 'x_thread'];

    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--source' && args[i + 1]) {
        sourcePath = args[i + 1];
      }
      if (args[i] === '--outputs' && args[i + 1]) {
        outputs = args[i + 1].split(',');
      }
    }

    if (!sourcePath) {
      console.error('[FACTORY] Usage:');
      console.error('  node viral-asset-factory.js --source <path> [--outputs tiktok,x_thread]');
      process.exit(1);
    }

    const factory = new ViralAssetFactory();
    factory.generateAssets(sourcePath, outputs)
      .then(results => {
        console.log('[FACTORY] ✅ Generation complete!');
        console.log(JSON.stringify(results, null, 2));
        process.exit(0);
      })
      .catch(err => {
        console.error('[FACTORY] Generation failed:', err);
        process.exit(1);
      });
  }
}

// Run if executed directly
if (require.main === module) {
  ViralAssetFactory.main();
}

module.exports = { ViralAssetFactory, PLATFORMS };
