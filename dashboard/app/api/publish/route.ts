/**
 * POST /api/publish
 * Publish article to WordPress
 */
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { article, queueItemId } = await request.json()

    // Validate required fields
    if (!article?.headline || !article?.body) {
      return NextResponse.json({ error: 'Missing article content' }, { status: 400 })
    }

    // Get WordPress credentials from env
    const siteUrl = process.env.WORDPRESS_SITE_URL
    const username = process.env.WORDPRESS_USERNAME
    const appPassword = process.env.WORDPRESS_APP_PASSWORD

    if (!siteUrl || !username || !appPassword) {
      return NextResponse.json({
        error: 'WordPress not configured. Set WORDPRESS_SITE_URL, WORDPRESS_USERNAME, and WORDPRESS_APP_PASSWORD in environment variables.'
      }, { status: 400 })
    }

    // Build WordPress post
    const wpPost = {
      title: article.headline,
      content: buildHtmlContent(article),
      status: 'publish',
      categories: [1], // Default category
      date: new Date().toISOString()
    }

    // Make WordPress REST API call
    const auth = Buffer.from(`${username}:${appPassword}`).toString('base64')
    const wpUrl = `${siteUrl}/wp-json/wp/v2/posts`

    const response = await fetch(wpUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(wpPost)
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({
        error: `WordPress API error: ${response.status}`,
        details: errorText
      }, { status: response.status })
    }

    const wpResponse = await response.json()

    return NextResponse.json({
      success: true,
      postId: wpResponse.id,
      postUrl: wpResponse.link,
      message: 'Published to WordPress successfully!'
    })
  } catch (error) {
    console.error('Publish error:', error)
    return NextResponse.json({ error: 'Failed to publish' }, { status: 500 })
  }
}

function buildHtmlContent(article: any): string {
  let html = ''

  if (article.deck) {
    html += `<p class="article-deck"><strong>${article.deck}</strong></p>\n`
  }

  const b = article.body || {}

  if (b.who) html += `<p><strong>Who:</strong> ${b.who}</p>\n`
  if (b.what) html += `<p><strong>What's happening:</strong> ${b.what}</p>\n`
  if (b.when) html += `<p><strong>When:</strong> ${b.when}</p>\n`
  if (b.where) html += `<p><strong>Where:</strong> ${b.where}</p>\n`
  if (b.why) html += `<p><strong>Why:</strong> ${b.why}</p>\n`

  if (b.keyFacts && b.keyFacts.length > 0) {
    html += `<h3>Key Facts</h3>\n<ul>\n`
    for (const fact of b.keyFacts) {
      html += `<li>${fact}</li>\n`
    }
    html += `</ul>\n`
  }

  if (b.background) {
    html += `<h3>Background</h3>\n<p>${b.background}</p>\n`
  }

  if (b.whatThisMeans) {
    html += `<h3>What This Means</h3>\n<p>${b.whatThisMeans}</p>\n`
  }

  return html
}
