import axios from "axios";

const BRAVE_BASE = "https://api.search.brave.com/res/v1/web/search";

export interface BraveResult {
  title: string;
  url: string;
  description: string;
}

export async function braveSearch(query: string, count = 5): Promise<BraveResult[]> {
  const key = process.env.BRAVE_API_KEY;
  if (!key) {
    throw new Error(
      "BRAVE_API_KEY saknas. Hämta din gratis nyckel på brave.com/search/api och lägg till den i claude_desktop_config.json"
    );
  }

  const res = await axios.get(BRAVE_BASE, {
    headers: {
      "Accept": "application/json",
      "X-Subscription-Token": key
    },
    params: { q: query, count, country: "se", search_lang: "sv" }
  });

  return res.data?.web?.results ?? [];
}
