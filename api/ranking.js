const APP_ID   = '0a20b387-b2e2-42b3-83d4-276e265b0abf';
const AFF_ID   = '536bbf3d.7c674743.536bbf3e.d20abd20';
const ENDPOINT = 'https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706';

const MIN_PRICE = 20000;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const params = new URLSearchParams({
    applicationId: APP_ID,
    affiliateId:   AFF_ID,
    keyword:       '家電',
    genreId:       '213',
    minPrice:      MIN_PRICE,
    hits:          10,
    sort:          '-reviewCount',
    format:        'json',
    formatVersion: 2,
  });

  try {
    const resp = await fetch(`${ENDPOINT}?${params}`, {
      headers: {
        'Referer': 'https://rakuten-highprice.vercel.app/',
        'Origin':  'https://rakuten-highprice.vercel.app',
      },
    });

    const text = await resp.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    if (!resp.ok || data.error) {
      return res.status(resp.status || 500).json({
        error:   'api_error',
        status:  resp.status,
        message: data.error_description || data.error || '不明なエラー',
        detail:  data,
      });
    }

    return res.status(200).json(data);

  } catch (e) {
    return res.status(500).json({ error: 'fetch_failed', message: e.message });
  }
}
