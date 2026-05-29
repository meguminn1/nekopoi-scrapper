const { fetchHTML, extractListItems } = require('../lib/scraper');
const axios = require('axios');

module.exports = async (req, res) => {
  try {
    const { page = 1, type = 'home', letter = '', category = '' } = req.query;

    let url;
    if (type === 'hentai-list') {
      url = 'https://nekopoi.care/hentai-list/';
    } else if (type === 'jav-list') {
      url = 'https://nekopoi.care/jav-list/';
    } else if (type === 'az-list') {
      const l = (letter || 'a').toLowerCase();
      url = `https://nekopoi.care/az-list/${l}/`;
    } else if (category) {
      url = `https://nekopoi.care/category/${category}/`;
      if (page > 1) url += `page/${page}/`;
    } else {
      url = page == 1 ? 'https://nekopoi.care/' : `https://nekopoi.care/page/${page}/`;
    }

    let items = [];
    const wpCategory = category || '';
    const wpPage = page;
    
    try {
      let apiUrl;
      if (type === 'hentai-list' || type === 'jav-list' || type === 'az-list') {
        apiUrl = `${url.replace(/\/$/, '')}?json=1`;
      } else if (wpCategory) {
        apiUrl = `https://nekopoi.care/wp-json/wp/v2/posts?categories=${getCategoryId(wpCategory)}&page=${wpPage}&per_page=20`;
      } else {
        apiUrl = `https://nekopoi.care/wp-json/wp/v2/posts?page=${wpPage}&per_page=20`;
      }

      const wpResp = await axios.get(apiUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 12)' },
        timeout: 10000,
        validateStatus: () => true
      });

      if (wpResp.status === 200 && Array.isArray(wpResp.data)) {
        items = wpResp.data.map(post => ({
          title: post.title?.rendered || post.title || '',
          url: post.link || '',
          poster: post.jetpack_featured_media_url || post._embedded?.['wp:featuredmedia']?.[0]?.source_url || ''
        }));
      }
    } catch (e) {
    }

    if (items.length === 0) {
      const $ = await fetchHTML(url);
      items = extractListItems($);
    }

    res.json({
      success: true,
      data: items,
      meta: { url, count: items.length }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

function getCategoryId(slug) {
  const map = {
    'hentai': 2,
    '2d-hentai': 80,
    '3d-hentai': 81,
    'jav': 5,
    'jav-cosplay': 386
  };
  return map[slug] || slug;
}