const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
  try {
    const resp = await axios.get('https://nekopoi.care/wp-json/wp/v2/categories?per_page=100', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 12)' },
      validateStatus: () => true
    });

    if (resp.status === 200 && Array.isArray(resp.data)) {
      const genres = resp.data.map(cat => ({
        name: cat.name,
        slug: cat.slug,
        url: `https://nekopoi.care/category/${cat.slug}/`
      }));
      return res.json({ success: true, data: genres });
    }

    const { data } = await axios.get('https://nekopoi.care/genre-list/', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 12)' }
    });
    const $ = cheerio.load(data);
    const genres = [];
    $('a[href*="/genre/"]').each((i, el) => {
      const href = $(el).attr('href');
      const text = $(el).text().trim();
      if (href && text && text.length > 1) {
        genres.push({ name: text, url: href });
      }
    });
    res.json({ success: true, data: genres });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};