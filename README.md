# Sidedoor MCP

Hitta dolda jobbmöjligheter på den svenska arbetsmarknaden via Claude Desktop.

## Krav

- Node.js ≥18 (`node --version`)
- Claude Desktop
- Brave Search API-nyckel (gratis, 2 000 queries/mån) → [brave.com/search/api](https://brave.com/search/api)

## Installation

```bash
npm install -g @opensverige/sidedoor
```

## Konfigurera Claude Desktop

Öppna konfigurationsfilen:
- **Mac:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

Lägg till:

```json
{
  "mcpServers": {
    "sidedoor": {
      "command": "sidedoor",
      "env": {
        "BRAVE_API_KEY": "din-nyckel-här"
      }
    }
  }
}
```

Starta om Claude Desktop. Skriv **"Starta karriärintervjun"** i ett nytt samtal.

## Verktyg

| Verktyg | Beskrivning |
|---|---|
| `search_companies` | Hitta svenska bolag som matchar din profil |
| `get_company_details` | Djupare info om ett bolag — tillväxt, storlek, kultur |
| `get_contact_strategy` | Hitta kontaktvägar till VD, grundare eller HR |

## Systemresurs

`sidedoor://prompts/interview` — Laddar karriärintervju-prompten automatiskt i Claude Desktop.

## Validering

Ett bekräftat möte från ett spontanansök = validerat. Inget annat räknas.

| Metric | Dödsregel |
|---|---|
| npm downloads | <10 på 14 dagar → skrota |
| GitHub stars | <15 på 14 dagar → ifrågasätt |
| Faktisk kontakt | 0 svar i 14 dagar → skrota |

---

*Tog du kontakt med ett bolag tack vare detta verktyg? [Berätta här](https://tally.so) — det är den enda validering som räknas.*
