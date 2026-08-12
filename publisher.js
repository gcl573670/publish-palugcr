// ============================================
// CONFIGURATION
// ============================================
const SITE_API_KEY = process.env.SITE_API_KEY;
const SITE_URL = process.env.SITE_URL || 'https://palugcr.live';
const NEWS_DATA_IO_KEY = process.env.NEWS_DATA_IO_KEY || '';
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || '';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct';
const MAX_ARTICLES = parseInt(process.env.MAX_ARTICLES) || 2;
const FETCH_TIMEOUT = 30000; // 30 seconds

const YOUTUBE_CHANNELS = {
  world:      { channelId: 'UC86C66AOH665m489f6_s_1g', name: 'Reuters' },
  national:   { channelId: 'UC86C66AOH665m489f6_s_1g', name: 'Reuters' },
  politics:   { channelId: 'UC1A_NcVMj2XwE_XyV312qmg', name: 'C-SPAN' },
  business:   { channelId: 'UCEAZeUIeJs0ijQdEj5OMH8A', name: 'Bloomberg Technology' },
  technology: { channelId: 'UCBJycSMzs18yp4052X57X8w', name: 'MKBHD' },
  science:    { channelId: 'UC2pnh_w0Cpx-0F2k4KylN0g', name: 'NASA' },
  health:     { channelId: 'UCvSmp-6gH1S5T3A9a2XN2xg', name: 'NIH' },
  entertainment: { channelId: 'UC3gS26y-J18s1-S8mC4dY2A', name: 'FilmIsNow' },
  sports:     { channelId: 'UC18_p_4uVp_v1A44S09oGaw', name: 'Olympics' },
  lifestyle:  { channelId: 'UC0k2f2G_yJ1c07D4FzWv9xg', name: 'Architectural Digest' },
  opinion:    { channelId: 'UCAuUUnT6oDeKwE6v1NGQxug', name: 'TED' },
};

// Fetch with timeout
async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
  
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

// ============================================
// ALL NEWS SOURCES CONFIGURATION
// ============================================
const SOURCES = {
  newsdata: {
    name: 'NewsData.io',
    api_key: NEWS_DATA_IO_KEY,
    categories: {
      technology: { query: 'technology', slug: 'technology' },
      world: { query: 'world', slug: 'world' },
      science: { query: 'science', slug: 'science' },
      national: { query: 'breaking,domestic,crime', slug: 'national' },
      business: { query: 'business', slug: 'business-economy' },
      health: { query: 'health', slug: 'health' },
      sports: { query: 'sports', slug: 'sports' },
      entertainment: { query: 'entertainment', slug: 'entertainment' },
      lifestyle: { query: 'food,lifestyle', slug: 'lifestyle' },
      opinion: { query: 'other,tourism,education', slug: 'opinion' },
      politics: { query: 'politics', slug: 'politics' }
    }
  },
  newsapi: {
    name: 'NewsAPI.org',
    api_key: process.env.NEWSAPI_KEY || '',
    categories: {
      world: { endpoint: 'top-headlines', query: 'language=en', slug: 'world' },
      national: { endpoint: 'top-headlines', query: 'country=us&language=en', slug: 'national' },
      politics: { endpoint: 'everything', query: 'q=politics&language=en&sortBy=publishedAt', slug: 'politics' },
      business: { endpoint: 'top-headlines', query: 'category=business&language=en', slug: 'business-economy' },
      technology: { endpoint: 'top-headlines', query: 'category=technology&language=en', slug: 'technology' },
      science: { endpoint: 'top-headlines', query: 'category=science&language=en', slug: 'science' },
      health: { endpoint: 'top-headlines', query: 'category=health&language=en', slug: 'health' },
      sports: { endpoint: 'top-headlines', query: 'category=sports&language=en', slug: 'sports' },
      entertainment: { endpoint: 'top-headlines', query: 'category=entertainment&language=en', slug: 'entertainment' },
      lifestyle: { endpoint: 'everything', query: 'q=lifestyle&language=en&sortBy=publishedAt', slug: 'lifestyle' },
      opinion: { endpoint: 'everything', query: 'q=opinion OR editorial&language=en&sortBy=publishedAt', slug: 'opinion' }
    }
  },
  worldnewsapi: {
    name: 'WorldNewsAPI.com',
    api_key: process.env.WORLDNEWSAPI_KEY || '',
    categories: {
      world: { query: 'language=en', slug: 'world' },
      national: { query: 'language=en&source-country=us', slug: 'national' },
      politics: { query: 'language=en&categories=politics', slug: 'politics' },
      business: { query: 'language=en&categories=business', slug: 'business-economy' },
      technology: { query: 'language=en&categories=technology', slug: 'technology' },
      science: { query: 'language=en&categories=science', slug: 'science' },
      health: { query: 'language=en&categories=health', slug: 'health' },
      sports: { query: 'language=en&categories=sports', slug: 'sports' },
      entertainment: { query: 'language=en&categories=entertainment', slug: 'entertainment' },
      lifestyle: { query: 'language=en&categories=lifestyle', slug: 'lifestyle' },
      opinion: { query: 'language=en&text=opinion%20OR%20editorial&sort=publish-time&sort-direction=DESC', slug: 'opinion' }
    }
  },
  gnews: {
    name: 'GNews.io',
    api_key: process.env.GNEWS_KEY || '',
    categories: {
      world: { endpoint: 'top-headlines', query: 'category=world&lang=en&sortby=publishedAt', slug: 'world' },
      national: { endpoint: 'top-headlines', query: 'category=nation&lang=en&country=us&sortby=publishedAt', slug: 'national' },
      politics: { endpoint: 'search', query: 'q=politics&lang=en&sortby=publishedAt', slug: 'politics' },
      business: { endpoint: 'top-headlines', query: 'category=business&lang=en&sortby=publishedAt', slug: 'business-economy' },
      technology: { endpoint: 'top-headlines', query: 'category=technology&lang=en&sortby=publishedAt', slug: 'technology' },
      science: { endpoint: 'top-headlines', query: 'category=science&lang=en&sortby=publishedAt', slug: 'science' },
      health: { endpoint: 'top-headlines', query: 'category=health&lang=en&sortby=publishedAt', slug: 'health' },
      sports: { endpoint: 'top-headlines', query: 'category=sports&lang=en&sortby=publishedAt', slug: 'sports' },
      entertainment: { endpoint: 'top-headlines', query: 'category=entertainment&lang=en&sortby=publishedAt', slug: 'entertainment' },
      lifestyle: { endpoint: 'search', query: 'q=lifestyle OR fashion&lang=en&sortby=publishedAt', slug: 'lifestyle' },
      opinion: { endpoint: 'search', query: 'q=opinion OR editorial&lang=en&sortby=publishedAt', slug: 'opinion' }
    }
  }
};

// Source order for rotation
const SOURCE_ORDER = ['newsdata', 'newsapi', 'worldnewsapi', 'gnews', 'youtube'];

// ============================================
// API FETCH FUNCTIONS FOR EACH PROVIDER
// ============================================

async function fetchNewsData(source, categoryKey, maxArticles) {
  const cat = source.categories[categoryKey];
  const url = new URL('https://newsdata.io/api/1/latest');
  url.searchParams.append('apikey', source.api_key);
  url.searchParams.append('language', 'en');
  url.searchParams.append('country', 'us,gb,ca,au,mx');
  url.searchParams.append('category', cat.query);
  url.searchParams.append('image', '1');
  url.searchParams.append('video', '1');
  url.searchParams.append('removeduplicate', '1');
  url.searchParams.append('size', Math.min(maxArticles * 3, 10).toString());

  const response = await fetchWithTimeout(url.toString());
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  if (data.status !== 'success') throw new Error(data.message || 'API Error');

  return (data.results || []).map(a => ({
    title: a.title,
    description: a.description || a.ai_summary || '',
    content: a.content || a.ai_summary || a.description || '',
    link: a.link,
    image_url: a.image_url,
    video_url: a.video_url,
    source_name: a.source_name,
    creator: a.creator,
    keywords: a.keywords,
    pubDate: a.pubDate,
    article_id: a.article_id
  }));
}

async function fetchNewsAPI(source, categoryKey, maxArticles) {
  const cat = source.categories[categoryKey];
  const baseUrl = cat.endpoint === 'everything'
    ? 'https://newsapi.org/v2/everything'
    : 'https://newsapi.org/v2/top-headlines';
  const url = `${baseUrl}?${cat.query}&apiKey=${source.api_key}&pageSize=${maxArticles * 3}`;

  const response = await fetchWithTimeout(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();

  return (data.articles || []).map(a => ({
    title: a.title,
    description: a.description || '',
    content: a.content || a.description || '',
    link: a.url,
    image_url: a.urlToImage,
    video_url: '',
    source_name: a.source?.name || 'NewsAPI',
    creator: a.author ? [a.author] : [],
    keywords: [],
    pubDate: a.publishedAt || new Date().toISOString(),
    article_id: a.url
  }));
}

async function fetchWorldNewsAPI(source, categoryKey, maxArticles) {
  const cat = source.categories[categoryKey];
  const url = `https://api.worldnewsapi.com/search-news?${cat.query}&api-key=${source.api_key}&number=${maxArticles * 3}`;

  const response = await fetchWithTimeout(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();

  return (data.news || []).map(a => {
    let sourceName = 'News Source';
    try {
      if (a.url) {
        const hostname = new URL(a.url).hostname;
        sourceName = hostname.replace('www.', '');
      }
    } catch {}
    return {
      title: a.title,
      description: a.summary || '',
      content: a.text || a.summary || '',
      link: a.url,
      image_url: a.image,
      video_url: '',
      source_name: sourceName,
      creator: a.author ? [a.author] : [],
      keywords: a.keywords || [],
      pubDate: a.publish_date || new Date().toISOString(),
      article_id: a.id || a.url
    };
  });
}

async function fetchGNews(source, categoryKey, maxArticles) {
  const cat = source.categories[categoryKey];
  const baseUrl = cat.endpoint === 'search'
    ? 'https://gnews.io/api/v4/search'
    : 'https://gnews.io/api/v4/top-headlines';
  const url = `${baseUrl}?${cat.query}&apikey=${source.api_key}&max=${maxArticles * 3}`;

  const response = await fetchWithTimeout(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();

  return (data.articles || []).map(a => ({
    title: a.title,
    description: a.description || '',
    content: a.content || a.description || '',
    link: a.url,
    image_url: a.image,
    video_url: '',
    source_name: a.source?.name || 'GNews',
    source_url: a.source?.url || '',
    creator: a.author ? [a.author] : [],
    keywords: [],
    pubDate: a.publishedAt || new Date().toISOString(),
    article_id: a.id || a.url
  }));
}

// Fetch router
const FETCH_FUNCTIONS = {
  newsdata: fetchNewsData,
  newsapi: fetchNewsAPI,
  worldnewsapi: fetchWorldNewsAPI,
  gnews: fetchGNews,
  youtube: fetchYouTubeChannel,
};

// ============================================
// AI REWRITE VIA OPENROUTER
// ============================================
async function aiRewrite(title, content, category) {
  const prompt = `You are a professional news editor and SEO content writer. Rewrite the following article to be engaging, professional, and search-engine optimized. The article MUST be written entirely in English.

CRITICAL FORMATTING RULE:
The CONTENT field MUST contain exactly 6 separate short paragraphs. Each paragraph must be 2-3 sentences long. Between each paragraph there MUST be a completely empty line. This means double line breaks between paragraphs. Example:

First paragraph text here with two or three sentences maximum.

Second paragraph text here with two or three sentences maximum.

Third paragraph text here with two or three sentences maximum.

Fourth paragraph text here with two or three sentences maximum.

Fifth paragraph text here with two or three sentences maximum.

Sixth paragraph text here with two or three sentences maximum.

RULES:
- Keep the rewriting factual and accurate to the original
- Write in a professional journalistic tone
- The article MUST be in English
- Make the title compelling and SEO-friendly (keep under 70 characters)
- Write a concise meta description (under 155 characters) that captures the key point
- Write exactly 6 short paragraphs, each 2-3 sentences
- Separate each paragraph with a blank line (double newline)
- Naturally incorporate relevant keywords for the category
- Do NOT add information that isn't in the original
- Do NOT use markdown formatting, just plain text
- Do NOT write one continuous block of text
- Output ONLY the rewritten title, description, and content, nothing else
- Format your response exactly like this:
TITLE: [rewritten title]
DESCRIPTION: [meta description under 155 characters]
CONTENT: [paragraph 1]

[paragraph 2]

[paragraph 3]

[paragraph 4]

[paragraph 5]

[paragraph 6]

ORIGINAL TITLE: ${title}
CATEGORY: ${category}
ORIGINAL CONTENT: ${content}`;

  try {
    const response = await fetchWithTimeout('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': SITE_URL,
        'X-Title': 'News Publisher',
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.log(`   ⚠️ OpenRouter error ${response.status}: ${errText.substring(0, 200)}`);
      return null;
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';
    if (!text) return null;

    const titleMatch = text.match(/TITLE:\s*(.+)/i);
    const descMatch = text.match(/DESCRIPTION:\s*(.+)/i);
    const contentMatch = text.match(/CONTENT:\s*([\s\S]+)/i);

    return {
      title: titleMatch ? titleMatch[1].trim() : title,
      description: descMatch ? descMatch[1].trim() : '',
      content: contentMatch ? contentMatch[1].trim() : content,
    };
  } catch (error) {
    console.log(`   ⚠️ OpenRouter failed: ${error.message}`);
    return null;
  }
}

// ============================================
// YOUTUBE CHANNEL FETCH
// ============================================
async function fetchYouTubeChannel(source, categoryKey, maxArticles) {
  const channel = YOUTUBE_CHANNELS[categoryKey];
  if (!channel) {
    console.log(`   ⚠️ No YouTube channel configured for category: ${categoryKey}`);
    return [];
  }

  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channel.channelId}&order=date&type=video&maxResults=${Math.min(maxArticles * 2, 10)}&key=${YOUTUBE_API_KEY}`;

  const response = await fetchWithTimeout(url);
  if (!response.ok) throw new Error(`YouTube API HTTP ${response.status}`);
  const data = await response.json();

  if (!data.items || data.items.length === 0) {
    console.log(`   ⚠️ No videos found for channel: ${channel.name}`);
    return [];
  }

  return data.items.map(item => {
    const videoId = item.id.videoId;
    const snippet = item.snippet;
    return {
      title: snippet.title,
      description: snippet.description || '',
      content: snippet.description || '',
      link: `https://www.youtube.com/watch?v=${videoId}`,
      image_url: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || '',
      video_url: `https://www.youtube.com/watch?v=${videoId}`,
      video_embed_id: videoId,
      source_name: channel.name,
      creator: [snippet.channelTitle || channel.name],
      keywords: [categoryKey, channel.name],
      pubDate: snippet.publishedAt,
      article_id: videoId,
      isYouTube: true,
    };
  });
}

// ============================================
// ROTATION SYSTEM
// ============================================
async function getRotation() {
  try {
    const response = await fetchWithTimeout(`${SITE_URL}/api/multi-source-rotation`, {
      headers: { 'x-api-key': SITE_API_KEY }
    });

    if (response.ok) {
      const data = await response.json();
      if (data.source && data.category) {
        // Ensure youtube is a valid source
        if (!SOURCE_ORDER.includes(data.source)) {
          data.source = 'newsdata';
        }
        // Ensure category exists for the source
        if (data.source === 'youtube') {
          if (!YOUTUBE_CHANNELS[data.category]) {
            data.category = 'world';
          }
        } else if (SOURCES[data.source] && !SOURCES[data.source].categories[data.category]) {
          data.category = Object.keys(SOURCES[data.source].categories)[0];
        }
        console.log('📡 Using remote rotation');
        return data;
      }
    }
    throw new Error('Remote rotation returned invalid data');
  } catch (error) {
    console.error(`❌ Failed to get rotation: ${error.message}`);
    process.exit(1);
  }
}

// ============================================
// MAIN FUNCTION
// ============================================
async function main() {
  const startTime = Date.now();
  console.log('🚀 Starting multi-source news publisher...');
  console.log(`🔗 Site: ${SITE_URL}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}\n`);

  if (!SITE_API_KEY) {
    console.error('❌ ERROR: SITE_API_KEY environment variable is required!');
    process.exit(1);
  }

  const rotation = await getRotation();
  const sourceKey = rotation.source;
  const categoryKey = rotation.category;
  const isYouTube = sourceKey === 'youtube';

  const sourceName = isYouTube
    ? (YOUTUBE_CHANNELS[categoryKey]?.name || 'YouTube')
    : (SOURCES[sourceKey]?.name || sourceKey);

  console.log(`📰 Source: ${sourceName} (${SOURCE_ORDER.indexOf(sourceKey) + 1}/${SOURCE_ORDER.length})`);
  console.log(`📂 Category: ${categoryKey} (${rotation.index + 1}/${rotation.total})`);
  console.log(`📝 Max ${MAX_ARTICLES} articles`);
  console.log(`🤖 AI Rewrite: OpenRouter (${OPENROUTER_MODEL})\n`);

  try {
    const fetchFn = FETCH_FUNCTIONS[sourceKey];
    const articles = await fetchFn(isYouTube ? null : SOURCES[sourceKey], categoryKey, MAX_ARTICLES);
    console.log(`📰 Found ${articles.length} articles`);

    const categorySlug = isYouTube
      ? categoryKey
      : SOURCES[sourceKey].categories[categoryKey]?.slug || categoryKey;

    const existingSlugs = await checkExistingArticles();
    console.log(`🔍 ${existingSlugs.size} articles already exist, skipping them\n`);

    let publishedCount = 0;
    let skippedCount = 0;

    for (const article of articles) {
      if (publishedCount >= MAX_ARTICLES) break;

      const slug = generateSlug(article.title, article.article_id);
      if (existingSlugs.has(slug)) {
        console.log(`⏭️ Skipping duplicate: ${article.title.substring(0, 50)}...`);
        skippedCount++;
        continue;
      }

      const result = await publishArticle(article, categorySlug, sourceName, sourceKey);
      if (result === true) {
        publishedCount++;
        await sleep(1500);
      } else if (result === false) {
        skippedCount++;
      }
    }

    console.log(`\n✅ Published ${publishedCount} articles (${skippedCount} skipped)`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`✅ Done in ${duration}s`);
}

// ============================================
// PUBLISH ARTICLE
// ============================================
async function publishArticle(article, categorySlug, sourceName, sourceKey) {
  if (!article.title || article.title === '') {
    console.warn('⚠️ Article missing title, skipping...');
    return false;
  }

  const isYouTube = sourceKey === 'youtube';
  const isNewsData = sourceKey === 'newsdata';

  let hasImage = article.image_url &&
    !article.image_url.includes('ONLY AVAILABLE IN PAID PLANS') &&
    article.image_url !== '' &&
    article.image_url.startsWith('http');

  if (hasImage) {
    try {
      let imgRes;
      try {
        imgRes = await fetchWithTimeout(article.image_url, { method: 'HEAD' });
      } catch {
        try {
          imgRes = await fetchWithTimeout(article.image_url, { method: 'GET' });
        } catch {
          console.log(`   🖼️ Image URL looks valid, using it`);
        }
      }

      if (imgRes) {
        if (!imgRes.ok) {
          console.log(`   ⚠️ Image not accessible (${imgRes.status}), skipping image`);
          hasImage = false;
        } else {
          const contentLength = parseInt(imgRes.headers.get('content-length') || '0', 10);
          if (contentLength > 0 && contentLength < 15000) {
            console.log(`   ⚠️ Image too small (${Math.round(contentLength / 1024)}KB), skipping image`);
            hasImage = false;
          } else {
            console.log(`   🖼️ Image OK (${contentLength > 0 ? Math.round(contentLength / 1024) + 'KB' : 'valid'})`);
          }
        }
      }
    } catch {
      if (article.image_url.match(/\.(jpg|jpeg|png|gif|webp)/i)) {
        console.log(`   🖼️ Image validation skipped, using URL`);
      } else {
        console.log(`   ⚠️ Image validation failed, skipping image`);
        hasImage = false;
      }
    }
  }

  // YouTube uses thumbnail as feature image
  if (isYouTube && !hasImage && article.image_url) {
    hasImage = true;
    console.log(`   🖼️ Using YouTube thumbnail as feature image`);
  }

  if (!hasImage) {
    console.warn('⚠️ Skipping: Missing feature image');
    return false;
  }

  const creators = article.creator && Array.isArray(article.creator)
    ? article.creator.filter(c => c && c !== '')
    : [];

  const keywords = article.keywords && Array.isArray(article.keywords)
    ? article.keywords.filter(k => k && k !== '')
    : [];

  if (keywords.length === 0) {
    if (categorySlug) keywords.push(categorySlug);
    if (article.source_name) keywords.push(article.source_name);
  }

  // --- Get raw content to feed to AI ---
  const rawContent = article.content || article.description || article.title || '';
  const rawTitle = article.title;

  // --- AI Rewrite for non-YouTube sources ---
  let finalTitle = rawTitle;
  let finalContent = '';
  let aiDescription = '';

  if (!isYouTube && rawContent) {
    console.log(`   🤖 Rewriting with OpenRouter AI...`);
    const rewritten = await aiRewrite(rawTitle, rawContent, categorySlug);
    if (rewritten) {
      finalTitle = rewritten.title;
      finalContent = rewritten.content;
      aiDescription = rewritten.description || '';
      console.log(`   ✅ AI rewrite complete`);
    } else {
      console.log(`   ⚠️ AI rewrite failed, using original content`);
      finalContent = rawContent;
    }
  }

  let slug = generateSlug(finalTitle, article.article_id);

  // --- Build full HTML content ---
  let fullContent = '';

  if (isYouTube) {
    // YouTube: embed video after 3rd paragraph, no thumbnail in content
    const videoId = article.video_embed_id || extractYouTubeId(article.video_url);
    if (videoId) {
      const videoEmbed = `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;max-width:100%;margin:20px 0;"><iframe src="https://www.youtube.com/embed/${videoId}" style="position:absolute;top:0;left:0;width:100%;height:100%;" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
      // Split content and insert video after 3rd paragraph
      const plainText = cleanText(rawContent);
      const paragraphs = plainText.split('\n').filter(p => p.trim());
      if (paragraphs.length > 3) {
        const before = paragraphs.slice(0, 3).map(p => `<p>${p.trim()}</p>`).join('\n');
        const after = paragraphs.slice(3).map(p => `<p>${p.trim()}</p>`).join('\n');
        fullContent = `${before}\n${videoEmbed}\n${after}`;
      } else {
        fullContent = `<p>${cleanText(rawContent)}</p>\n${videoEmbed}`;
      }
      console.log(`   📹 Embedded YouTube video after paragraph 3: ${videoId}`);
    } else {
      fullContent = `<p>${cleanText(rawContent)}</p>`;
    }
  } else if (isNewsData) {
    // NewsData: embed source video if exists (image is used as featured_image only)
    let newsDataMedia = '';

    // Embed video from NewsData source if it exists
    const hasSourceVideo = article.video_url &&
      !article.video_url.includes('ONLY AVAILABLE IN PAID PLANS') &&
      article.video_url !== '' &&
      article.video_url.startsWith('http');

    if (hasSourceVideo) {
      const vUrl = article.video_url;
      let videoEmbed = '';
      if (vUrl.includes('youtube.com') || vUrl.includes('youtu.be')) {
        const ytMatch = vUrl.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
        if (ytMatch) {
          videoEmbed = `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;max-width:100%;margin-bottom:20px;"><iframe src="https://www.youtube.com/embed/${ytMatch[1]}" style="position:absolute;top:0;left:0;width:100%;height:100%;" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
        }
      } else if (vUrl.includes('vimeo.com')) {
        const vimeoMatch = vUrl.match(/vimeo\.com\/(\d+)/);
        if (vimeoMatch) {
          videoEmbed = `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;max-width:100%;margin-bottom:20px;"><iframe src="https://player.vimeo.com/video/${vimeoMatch[1]}" style="position:absolute;top:0;left:0;width:100%;height:100%;" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></div>`;
        }
      } else if (vUrl.includes('.m3u8')) {
        const vid = `newsdata-video-${Date.now()}`;
        videoEmbed = `<div style="margin-bottom:20px;"><video id="${vid}" controls style="width:100%;max-height:500px;background:#000;"></video><script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script><script>var v=document.getElementById('${vid}');if(Hls.isSupported()){var h=new Hls();h.loadSource('${vUrl}');h.attachMedia(v);h.on(Hls.Events.MANIFEST_PARSED,function(){v.play()})}else if(v.canPlayType('application/vnd.apple.mpegurl')){v.src='${vUrl}';v.addEventListener('loadedmetadata',function(){v.play()})}</script></div>`;
      } else if (vUrl.match(/\.(mp4|webm|ogg)$/i)) {
        const ext = vUrl.match(/\.(\w+)$/)?.[1] || 'mp4';
        const mimeTypes = { mp4: 'video/mp4', webm: 'video/webm', ogg: 'video/ogg' };
        videoEmbed = `<div style="margin-bottom:20px;"><video controls style="width:100%;max-height:500px;background:#000;"><source src="${vUrl}" type="${mimeTypes[ext] || 'video/mp4'}">Your browser does not support the video tag.</video></div>`;
      }
      if (videoEmbed) {
        newsDataMedia += videoEmbed;
        console.log(`   📹 Embedded NewsData source video`);
      }
    }

    // Do NOT add source image to content - it's already the featured image

    fullContent = newsDataMedia + formatContent(finalContent);
  } else {
    // NewsAPI, WorldNewsAPI, GNews: AI-rewritten content only, no video
    fullContent = formatContent(finalContent);
  }

  // Source link at the bottom
  if (article.link) {
    fullContent += `\n<p style="margin-top:24px;padding-top:16px;border-top:1px solid #eee;"><em>Source: <a href="${article.link}" target="_blank" rel="noopener noreferrer">${article.source_name || sourceName || 'Read more'}</a></em></p>`;
  }

  // --- Build post data ---
  const excerptText = cleanText(aiDescription || article.description || finalTitle || '');

  const postData = {
    title: finalTitle,
    slug: slug,
    excerpt: excerptText.substring(0, 300),
    content: fullContent,
    featured_image: hasImage ? article.image_url : '',
    image_alt: finalTitle || '',
    image_caption: article.source_name || cleanText(creators.join(', ')) || '',
    category: { name: categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1), slug: categorySlug },
    company: { name: article.source_name || 'News Source', slug: slugify(article.source_name || 'news-source') },
    tags: keywords,
    status: 'published',
    meta_title: generateMetaTitle(finalTitle, creators),
    meta_description: excerptText.substring(0, 160),
    canonical_url: article.link || '',
    focus_keyword: keywords.length > 0 ? keywords.join(', ') : '',
    og_image: hasImage ? article.image_url : '',
    author: creators.join(', ') || article.source_name || '',
    published_at: formatDate(article.pubDate),
  };

  const hasVideo = (isYouTube && article.video_embed_id) ||
    (isNewsData && article.video_url && article.video_url.startsWith('http'));

  // ============================================
  // VALIDATION: Reject articles with quality issues
  // ============================================

  // 1. Check for empty content (no text, only HTML tags)
  const strippedContent = postData.content
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (strippedContent.length < 50) {
    console.error(`❌ REJECTED: Content too short or empty (${strippedContent.length} chars of text)`);
    return false;
  }

  // 2. Check for feature image duplicated inside content
  if (postData.featured_image && postData.content.includes(postData.featured_image)) {
    console.error(`❌ REJECTED: Feature image URL found duplicated inside content`);
    return false;
  }

  // 3. Check content has actual <p> paragraphs
  const paragraphCount = (postData.content.match(/<p>/g) || []).length;
  if (paragraphCount < 2) {
    console.error(`❌ REJECTED: Content has only ${paragraphCount} paragraph(s), expected 3+`);
    return false;
  }

  console.log(`📝 Publishing: "${postData.title.substring(0, 60)}..." (${categorySlug})`);
  console.log(`   📎 Source: ${sourceName}`);
  console.log(`   🖼️ Image: ${hasImage ? '✅' : '❌'}`);
  console.log(`   📹 Video: ${hasVideo ? '✅' : '❌'}`);
  console.log(`   📄 Content: ${postData.content.length} chars`);
  console.log(`   🔗 Slug: ${postData.slug}`);

  try {
    const response = await fetchWithTimeout(`${SITE_URL}/api/publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': SITE_API_KEY,
      },
      body: JSON.stringify(postData),
    });

    const responseText = await response.text();
    console.log(`   📡 Response (${response.status}): ${responseText.substring(0, 300)}`);

    if (!response.ok) {
      console.error(`❌ API Error ${response.status}`);
      return false;
    }

    console.log(`✅ Published successfully`);
    return true;

  } catch (error) {
    console.error(`❌ Network error: ${error.message}`);
    return false;
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function extractYouTubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

async function checkExistingArticles() {
  const existing = new Set();

  try {
    const response = await fetchWithTimeout(`${SITE_URL}/api/posts?limit=500&status=published`, {
      headers: { 'x-api-key': SITE_API_KEY }
    });

    if (response.ok) {
      const data = await response.json();
      if (data.posts) {
        for (const post of data.posts) {
          existing.add(post.slug);
        }
      }
    }
  } catch {
    console.log('⚠️ Could not check existing posts via API, will rely on server-side duplicate check');
  }

  return existing;
}

function cleanText(text) {
  if (!text) return '';
  return text
    .replace(/ONLY AVAILABLE IN (PAID|PROFESSIONAL|CORPORATE) PLANS/g, '')
    .replace(/\[\+\d+ chars?\]/g, '')  // Remove [+1234 chars] truncation markers
    .replace(/\s+/g, ' ')
    .trim();
}

function generateSlug(title, articleId) {
  if (!title) return `article-${Date.now()}`;

  // Remove URLs from title
  let cleanTitle = title.replace(/https?:\/\/\S+/gi, '').trim();
  // Remove trailing dashes or special chars
  cleanTitle = cleanTitle.replace(/[\s-]+$/, '').trim();
  if (!cleanTitle) cleanTitle = 'article';

  let slug = cleanTitle
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 100);

  slug = slug.replace(/-+$/, '');

  // Generate a short hash from articleId for uniqueness
  if (articleId) {
    const strId = String(articleId);
    // If it's a URL, use last path segment or hash
    let shortId;
    if (strId.startsWith('http')) {
      const parts = strId.split('/');
      shortId = parts[parts.length - 1].substring(0, 8);
      shortId = shortId.replace(/[^a-z0-9]/gi, '');
    } else {
      shortId = strId.substring(0, 8);
    }
    if (shortId) {
      slug = `${slug}-${shortId}`;
    }
  }

  return slug;
}

function generateMetaTitle(title, creators) {
  // Remove URLs from title
  let metaTitle = (title || '').replace(/https?:\/\/[^\s]+/g, '').trim();
  if (!metaTitle) metaTitle = title || '';
  
  if (creators && creators.length > 0) {
    const creatorStr = creators.join(', ');
    if (creatorStr && creatorStr !== '') {
      metaTitle = `${metaTitle} - ${creatorStr}`;
    }
  }
  return metaTitle.substring(0, 200);
}

function formatContent(content) {
  if (!content) return '<p>Read the full article for more details.</p>';

  content = cleanText(content);

  // If content already has proper <p> tags, return as-is
  if (content.includes('<p>') && content.includes('</p>')) {
    return content;
  }

  // If content starts with other HTML tags (like div, figure, video), handle it
  if (content.trim().startsWith('<') && !content.trim().startsWith('<p>')) {
    // Extract any existing HTML blocks and text parts
    return content;
  }

  // Split by double newlines (empty lines) to preserve paragraph breaks
  let paragraphs = content.split(/\n\s*\n/).filter(p => p.trim());

  // If only one block, try splitting by single newlines
  if (paragraphs.length === 1) {
    const lines = content.split('\n').filter(p => p.trim());
    if (lines.length > 1) {
      paragraphs = lines;
    }
  }

  if (paragraphs.length === 0) return `<p>${content}</p>`;

  // Wrap each paragraph in <p> tags
  return paragraphs.map(p => {
    const trimmed = p.trim();
    // Skip if already wrapped in <p> tags
    if (trimmed.startsWith('<p>') && trimmed.endsWith('</p>')) {
      return trimmed;
    }
    return `<p>${trimmed}</p>`;
  }).join('\n\n');
}

function formatDate(dateStr) {
  if (!dateStr) return new Date().toISOString();

  try {
    const date = new Date(dateStr.replace(' ', 'T') + 'Z');
    if (isNaN(date.getTime())) {
      return new Date().toISOString();
    }
    return date.toISOString();
  } catch (error) {
    return new Date().toISOString();
  }
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 80);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// RUN THE SCRIPT
// ============================================
if (require.main === module) {
  if (!SITE_API_KEY) {
    console.error('❌ Error: SITE_API_KEY environment variable is not set');
    console.log('Please add it to GitHub Secrets or set it locally:');
    console.log('  export SITE_API_KEY=your_key_here');
    process.exit(1);
  }

  main().catch(error => {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  });
}

module.exports = { main, SOURCES, SOURCE_ORDER, FETCH_FUNCTIONS, aiRewrite, fetchYouTubeChannel };
