# PRD: Career Alchemist MCP Server
**Version:** 2.0 — Verified architecture, Claude Code ready  
**Datakälla:** Brave Search API (verifierad, fungerar)  
**Token-kostnad för byggaren:** Noll  
**Testad endpoint:** api.search.brave.com ✓

---

## Vad vi bygger

En MCP-server (TypeScript) som ger Claude Desktop tre verktyg för att hitta
dolda jobbmöjligheter på den svenska marknaden. Användaren kör sin egen LLM.
MCP-servern levererar bara data via Brave Search API.

### Dataflöde
```
Claude Desktop
  → anropar MCP tool
    → Brave Search API (användarens egen nyckel)
      → returnerar bolagsdata
        → Claude tolkar + presenterar
```

---

## Konfiguration

Användaren lägger sin Brave API-nyckel i `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "career-alchemist": {
      "command": "career-alchemist-mcp",
      "env": {
        "BRAVE_API_KEY": "användarens-nyckel-här"
      }
    }
  }
}
```

Servern läser: `process.env.BRAVE_API_KEY`  
Om saknas: kasta tydligt felmeddelande med länk till brave.com/search/api

---

## Stack

```
TypeScript
@modelcontextprotocol/sdk
axios
Node.js ≥18
```

Inga scraping-beroenden. Inga puppeteer/playwright. Inga andra API:er.

---

## Filstruktur

```
career-alchemist-mcp/
├── src/
│   ├── index.ts              # entry point, tool + resource registration
│   ├── tools/
│   │   ├── search.ts         # search_companies
│   │   ├── details.ts        # get_company_details
│   │   └── strategy.ts       # get_contact_strategy
│   ├── brave.ts              # Brave API wrapper, ett ställe för alla anrop
│   └── resources/
│       └── prompts.ts        # MCP Resource: system prompt
├── package.json
├── tsconfig.json
└── README.md
```

---

## Brave API wrapper: `src/brave.ts`

```typescript
const BRAVE_BASE = "https://api.search.brave.com/res/v1/web/search";

export async function braveSearch(query: string, count = 5): Promise<BraveResult[]> {
  const key = process.env.BRAVE_API_KEY;
  if (!key) throw new Error("BRAVE_API_KEY saknas. Se README för setup.");

  const res = await axios.get(BRAVE_BASE, {
    headers: {
      "Accept": "application/json",
      "X-Subscription-Token": key
    },
    params: { q: query, count, country: "se", search_lang: "sv" }
  });

  return res.data?.web?.results ?? [];
}

interface BraveResult {
  title: string;
  url: string;
  description: string;
}
```

---

## Tools

### Tool 1: `search_companies`

**Syfte:** Hitta svenska bolag som matchar kandidatens profil.

**Input:**
```typescript
{
  sector: string,     // t.ex. "fintech", "cleantech", "SaaS B2B"
  location: string,   // t.ex. "Stockholm", "Göteborg"
  signals?: string    // t.ex. "tillväxt nyemission scale-up" (valfritt)
}
```

**Implementation:**
```typescript
const query = `${sector} bolag ${location} ${signals ?? "tillväxt"} 2024 2025`;
const results = await braveSearch(query, 8);
// returnera results direkt — Claude tolkar och rangordnar
```

**Output:**
```typescript
{
  query_used: string,
  results: [{
    title: string,
    url: string,
    description: string
  }]
}
```

---

### Tool 2: `get_company_details`

**Syfte:** Djupare info om ett specifikt bolag — tillväxtsignaler, storlek, kultur.

**Input:**
```typescript
{
  company_name: string,
  org_nr?: string      // valfritt, förbättrar precision
}
```

**Implementation:**
Kör tre Brave-sökningar parallellt med `Promise.all`:

```typescript
const [general, financial, culture] = await Promise.all([
  braveSearch(`${company_name} Sverige anställda omsättning`, 3),
  braveSearch(`${company_name} nyemission expansion tillväxt 2024 2025`, 3),
  braveSearch(`${company_name} VD grundare team kultur`, 3)
]);
```

**Output:**
```typescript
{
  company_name: string,
  searches: {
    general: BraveResult[],
    financial: BraveResult[],
    culture: BraveResult[]
  }
}
```

---

### Tool 3: `get_contact_strategy`

**Syfte:** Hitta kontaktinfo och ingångspunkter för ett specifikt bolag.

**Input:**
```typescript
{
  company_name: string,
  contact_type: "vd" | "grundare" | "hr" | "alla"
}
```

**Implementation:**
```typescript
const queries = {
  vd: `${company_name} VD CEO LinkedIn kontakt`,
  grundare: `${company_name} grundare founder LinkedIn`,
  hr: `${company_name} HR People karriär`,
  alla: `${company_name} kontakt LinkedIn team`
};
const results = await braveSearch(queries[contact_type], 5);
```

**Output:**
```typescript
{
  company_name: string,
  contact_type: string,
  results: BraveResult[]
}
```

---

## MCP Resource: System Prompt

**URI:** `career-alchemist://prompts/interview`  
**Typ:** MCP Resource (inte tool) — statisk text, laddas av Claude Desktop

```
Du är en karriärnavigator för den dolda svenska arbetsmarknaden.
Bolag som behöver någon som kandidaten — men ännu inte publicerat en annons.

INTERVJU (6 frågor, EN i taget):
1. Nuläge: Vad driver dig att titta dig om just nu?
2. Topprestation: Beskriv ett tillfälle du verkligen levererade. Vad möjliggjorde det?
3. Geografi: Var i Sverige? Flexibel eller måste vara lokalt?
4. Kontext: Startup, scale-up eller etablerat? Hur stor organisation?
5. Dealbreakers: Vad kompromissar du aldrig med igen?
6. Wildcard: Vad kan du som inte syns på ditt CV?

EFTER INTERVJUN:
Sammanfatta i 3 punkter. Fråga: "Vilken stad söker vi i?"

SÖK:
- Anropa search_companies med sektor + ort + tillväxtsignaler
- Anropa get_company_details för topp 3-4 bolag
- Presentera som tabell: Bolag | Vad de gör | Varför du matchar | Signal

VAL:
Användaren väljer ett bolag.
Anropa get_contact_strategy för det valda bolaget.

STRATEGI (basera på Wildcard × Bolagets signal):
1. Primär kanal: mail till VD / LinkedIn / fysiskt besök
2. Hook: en öppningsmening som är ovanlig och specifik för just dem
3. Utkast: max 5 meningar, aldrig generiskt
4. Plan B: om primär kanal inte funkar
```

---

## README: Installationsguide

### Krav
- Node.js ≥18 (`node --version` för att kontrollera)
- Claude Desktop
- Brave Search API-nyckel (gratis, 2000 queries/mån) → brave.com/search/api

### Installation

```bash
npm install -g @opensverige/career-alchemist-mcp
```

### Konfigurera Claude Desktop

Öppna konfigurationsfilen:
- Mac: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

Lägg till:
```json
{
  "mcpServers": {
    "career-alchemist": {
      "command": "career-alchemist-mcp",
      "env": {
        "BRAVE_API_KEY": "din-nyckel-här"
      }
    }
  }
}
```

Starta om Claude Desktop. Skriv `Starta karriärintervjun` i ett nytt samtal.

---

## Byggordning för Claude Code

Exakt denna ordning. Testa varje steg innan nästa.

```
Steg 1: src/brave.ts
Steg 2: src/tools/search.ts
Steg 3: src/tools/details.ts
Steg 4: src/tools/strategy.ts
Steg 5: src/resources/prompts.ts
Steg 6: src/index.ts
Steg 7: package.json + tsconfig.json
Steg 8: Testa mot riktig Claude Desktop
```

---

## Validering: Dödsregler

| Metric | Mät via | Dödsregel |
|---|---|---|
| npm downloads | npmjs.com | <10 på 14 dagar → skrota |
| GitHub stars | github | <15 på 14 dagar → ifrågasätt |
| Faktisk kontakt | Tally-form i README: "Tog du kontakt med ett bolag?" | 0 svar → skrota |

Ett bekräftat möte från ett spontanansök = validerat. Inget annat räknas.
