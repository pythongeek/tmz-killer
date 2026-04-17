/**
 * WordPress Manager
 * Handles final content push to WordPress CMS
 *
 * Triggered by EIC Orchestrator after Legal Gate approval
 * Manages: post creation, media upload, category/tag assignment,
 * scheduling, and analytics tracking
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const CONFIG_PATH = path.join(__dirname, '../config/wordpress.json');
const OUTPUT_DIR = path.join(__dirname, '../output/published');

class WordPressManager {
  constructor() {
    this.config = this.loadConfig();
    this.publishedPosts = [];
  }

  loadConfig() {
    if (fs.existsSync(CONFIG_PATH)) {
      try {
        return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
      } catch {
        // Ignore
      }
    }

    return {
      siteUrl: 'https://your-wordpress-site.com',
      apiBase: '/wp-json/wp/v2',
      username: '',
      appPassword: '',
      defaultAuthor: 1,
      defaultCategory: 1
    };
  }

  /**
   * Push content to WordPress
   */
  async push(content, options = {}) {
    console.log('[WP] 📤 Initiating WordPress push...');
    console.log(`[WP] Site: ${this.config.siteUrl}`);

    // Validate content
    const validation = this.validateContent(content);
    if (!validation.valid) {
      console.error('[WP] ❌ Validation failed:', validation.errors);
      throw new Error('Content validation failed');
    }

    // Transform to WordPress format
    const wpPost = this.transformToWordPressFormat(content, options);

    // Make API call
    const result = await this.createPost(wpPost, options);

    console.log(`[WP] ✅ Published! Post ID: ${result.id}`);
    console.log(`[WP] URL: ${result.link}`);

    // Save to published log
    this.logPublished(result, content);

    return result;
  }

  validateContent(content) {
    const errors = [];

    // Check required fields
    if (!content.headline && !content.title) {
      errors.push('Missing headline/title');
    }

    if (!content.body && !content.content && !content.deck) {
      errors.push('Missing body content');
    }

    // TODO: Implement more validation
    // - Check for broken links
    // - Verify image alt text
    // - Check for prohibited content

    return {
      valid: errors.length === 0,
      errors
    };
  }

  transformToWordPressFormat(content, options) {
    const title = content.headline || content.title || 'Untitled';
    const body = this.transformBody(content);

    return {
      title,
      content: body,
      status: options.status || 'draft', // draft, publish, pending, private
      date: options.publishDate || null,
      categories: options.categories || [this.config.defaultCategory],
      tags: options.tags || [],
      author: options.author || this.config.defaultAuthor,
      featured_media: options.featuredMedia || 0,
      meta: {
        _breaking_priority: options.priority === 'urgent' ? 'true' : 'false',
        _virality_score: options.viralityScore || 0
      }
    };
  }

  transformBody(content) {
    // TODO: Convert article JSON to HTML for WordPress
    // Use content.body structure to build clean HTML

    let html = '';

    if (content.deck) {
      html += `<p class="article-deck"><strong>${content.deck}</strong></p>\n`;
    }

    if (content.body) {
      const b = content.body;

      if (b.what) html += `<p><strong>What's happening:</strong> ${b.what}</p>\n`;
      if (b.who) html += `<p><strong>Who:</strong> ${b.who}</p>\n`;
      if (b.when) html += `<p><strong>When:</strong> ${b.when}</p>\n`;
      if (b.where) html += `<p><strong>Where:</strong> ${b.where}</p>\n`;
      if (b.why) html += `<p><strong>Why:</strong> ${b.why}</p>\n`;

      if (b.keyFacts && b.keyFacts.length > 0) {
        html += `<h3>Key Facts</h3><ul>\n`;
        for (const fact of b.keyFacts) {
          html += `<li>${fact}</li>\n`;
        }
        html += `</ul>\n`;
      }

      if (b.background) {
        html += `<h3>Background</h3><p>${b.background}</p>\n`;
      }

      if (b.whatThisMeans) {
        html += `<h3>What This Means</h3><p>${b.whatThisMeans}</p>\n`;
      }
    }

    return html;
  }

  async createPost(wpPost, options) {
    // TODO: Implement actual WordPress REST API call
    // POST /wp-json/wp/v2/posts

    // const auth = Buffer.from(`${this.config.username}:${this.config.appPassword}`).toString('base64');
    //
    // const postData = JSON.stringify(wpPost);
    // const options = {
    //   hostname: new URL(this.config.siteUrl).hostname,
    //   port: 443,
    //   path: `${this.config.apiBase}/posts`,
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Basic ${auth}`,
    //     'Content-Type': 'application/json',
    //     'Content-Length': Buffer.byteLength(postData)
    //   }
    // };
    //
    // return new Promise((resolve, reject) => {
    //   const req = https.request(options, (res) => {
    //     let data = '';
    //     res.on('data', chunk => data += chunk);
    //     res.on('end', () => {
    //       if (res.statusCode >= 200 && res.statusCode < 300) {
    //         resolve(JSON.parse(data));
    //       } else {
    //         reject(new Error(`WP API error: ${res.statusCode} ${data}`));
    //       }
    //     });
    //   });
    //   req.on('error', reject);
    //   req.write(postData);
    //   req.end();
    // });

    // Placeholder return for now
    return {
      id: Date.now(),
      link: `${this.config.siteUrl}/?p=${Date.now()}`,
      status: 'draft'
    };
  }

  logPublished(result, content) {
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    this.publishedPosts.push({
      wpResult: result,
      content: content.headline || content.title,
      publishedAt: new Date().toISOString()
    });

    const logPath = path.join(OUTPUT_DIR, 'published-log.json');
    fs.writeFileSync(logPath, JSON.stringify(this.publishedPosts, null, 2));
  }

  /**
   * Update existing post
   */
  async update(postId, updates) {
    console.log(`[WP] Updating post ${postId}...`);

    // TODO: PUT /wp-json/wp/v2/posts/{id}

    return { id: postId, updated: true };
  }

  /**
   * Upload media
   */
  async uploadMedia(filePath, options = {}) {
    console.log(`[WP] Uploading media: ${filePath}...`);

    // TODO: POST /wp-json/wp/v2/media
    // Handle: image/jpeg, image/png, video/mp4
    // Set alt text, caption, post association

    return {
      id: Date.now(),
      source_url: `${this.config.siteUrl}/wp-content/uploads/${path.basename(filePath)}`
    };
  }

  /**
   * CLI Entry Point
   */
  static main() {
    const args = process.argv.slice(2);

    let contentPath = null;
    let options = { status: 'draft' };

    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--content' && args[i + 1]) {
        contentPath = args[i + 1];
      }
      if (args[i] === '--publish') {
        options.status = 'publish';
      }
      if (args[i] === '--urgent') {
        options.priority = 'urgent';
      }
    }

    if (!contentPath) {
      console.error('[WP] Usage:');
      console.error('  node wordpress-manager.js --content <json> [--publish] [--urgent]');
      process.exit(1);
    }

    if (!fs.existsSync(contentPath)) {
      console.error(`[WP] Content file not found: ${contentPath}`);
      process.exit(1);
    }

    const content = JSON.parse(fs.readFileSync(contentPath, 'utf8'));

    const manager = new WordPressManager();
    manager.push(content, options)
      .then(result => {
        console.log('[WP] ✅ WordPress push complete!');
        console.log(result);
        process.exit(0);
      })
      .catch(err => {
        console.error('[WP] Push failed:', err);
        process.exit(1);
      });
  }
}

// Run if executed directly
if (require.main === module) {
  WordPressManager.main();
}

module.exports = { WordPressManager };
