const { fetchHTML } = require('../lib/scraper');

module.exports = async (req, res) => {
  try {
    const $ = await fetchHTML('https://nekopoi.care/jadwal-new-hentai/');
    const schedule = [];
    $('.entry-content h2, .entry-content h3').each((i, el) => {
      const dateText = $(el).text().trim();
      const nextUl = $(el).next('ul');
      if (nextUl.length > 0) {
        const items = [];
        nextUl.find('li').each((j, li) => {
          items.push($(li).text().trim());
        });
        schedule.push({ date: dateText, items });
      }
    });
    if (schedule.length === 0) {
      const text = $('.entry-content').text();
      schedule.push({ raw: text });
    }
    res.json({ success: true, data: schedule });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};