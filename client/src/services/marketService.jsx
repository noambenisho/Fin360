// client/src/services/marketService.jsx
import axios from "axios";

const FINNHUB_KEY =
  "d2gtoshr01qon4e9igpgd2gtoshr01qon4e9igq0"; // consider moving to .env

// General market news (latest)
export async function getMarketNews(limit = 20) {
  const url = `https://finnhub.io/api/v1/news?category=general&token=${FINNHUB_KEY}`;
  const { data } = await axios.get(url, { timeout: 10000 });
  // Finnhub can return many — trim + normalize a few fields
  return (data || [])
    .slice(0, limit)
    .map(n => ({
      id: `${n.id || n.datetime}-${n.url}`,
      headline: n.headline,
      summary: n.summary,
      source: n.source,
      url: n.url,
      image: n.image,
      datetime: n.datetime, // seconds epoch
      category: n.category
    }));
}
