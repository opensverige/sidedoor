import axios from "axios";

const BRAVE_BASE = "https://api.search.brave.com/res/v1/web/search";

export interface BraveResult {
  title: string;
  url: string;
  description: string;
}

interface BraveApiResponse {
  web?: { results: BraveResult[] };
}

export async function braveSearch(query: string, count = 5): Promise<BraveResult[]> {
  const key = process.env.BRAVE_API_KEY;
  if (!key) {
    throw new Error(
      "BRAVE_API_KEY saknas. Hämta din gratis nyckel på brave.com/search/api och lägg till den i claude_desktop_config.json"
    );
  }

  if (count < 1 || count > 20) {
    throw new Error("count måste vara mellan 1 och 20");
  }

  try {
    const res = await axios.get<BraveApiResponse>(BRAVE_BASE, {
      headers: {
        "Accept": "application/json",
        "X-Subscription-Token": key
      },
      params: { q: query, count, country: "se", search_lang: "sv" }
    });

    return res.data?.web?.results ?? [];
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      const status = err.response.status;
      if (status === 401) throw new Error("Ogiltig BRAVE_API_KEY. Kontrollera din nyckel på brave.com/search/api");
      if (status === 429) throw new Error("Brave Search API rate limit nådd. Försök igen om en stund.");
      throw new Error(`Brave Search API fel: HTTP ${status}`);
    }
    throw err;
  }
}
