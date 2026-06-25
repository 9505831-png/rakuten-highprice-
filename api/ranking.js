const APP_ID   = '0a20b387-b2e2-42b3-83d4-276e265b0abf';
const AFF_ID   = '536bbf3d.7c674743.536bbf3e.d20abd20';
const ENDPOINT = 'https://app.rakuten.co.jp/services/api/IchibaItem/Ranking/20170628';

const MIN_PRICE = 20000;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const params = new URLSearchParams({
    applicationId: APP_ID,
    affiliateId:   AFF_ID,
    genreId:       '0:213', // 家電・PC・カメラ
    hits:          30,
    format:        'json',
    formatVersion: 2,
  });

  try {
    const resp = await fetch(`${ENDPOINT}?${params}`, {
      headers: {
        'Referer': 'https://script.google.com/',
        'Origin':  'https://script.google.com',
      },
    });

    const text = await resp.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    if (!resp.ok || data.error) {
      return res.status(resp.status).json({
        error:   'api_error',
        status:  resp.status,
        message: data.error_description || data.error || '不明なエラー',
        detail:  data,
      });
    }

    // 2万円以上でフィルター
    const items = (data.Items || []).filter(item => {
      const price = Number((item.Item ?? item).itemPrice);
      return price >= MIN_PRICE;
    });

    if (!items.length) {
      return res.status(200).json({ Items: [], filtered: true });
    }

    return res.status(200).json({ ...data, Items: items });

  } catch (e) {
    return res.status(500).json({ error: 'fetch_failed', message: e.message });
  }
}
