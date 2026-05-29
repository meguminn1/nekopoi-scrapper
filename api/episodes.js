const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ success: false, error: 'URL diperlukan' });

  try {
    const { data } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 12)' },
      validateStatus: () => true
    });

    if (typeof data === 'object' && !Array.isArray(data)) {
      return res.json({ success: true, data: [] });
    }

    const $ = cheerio.load(data);
    const episodes = [];

    $('a[href*="/episode/"], a[href*="/videos/"]').each((i, el) => {
      const href = $(el).attr('href');
      const text = $(el).text().trim();
      if (href && text && !text.toLowerCase().includes('download')) {
        episodes.push({ title: text, url: href });
      }
    });

    if (episodes.length === 0) {
      $('.entry-content a').each((i, el) => {
        const href = $(el).attr('href');
        const text = $(el).text().trim();
        if (href && text && text.length > 3) {
          episodes.push({ title: text, url: href });
        }
      });
    }

    res.json({ success: true, data: episodes });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};