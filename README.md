# Sidedoor

Hitta dolda jobbmöjligheter på den svenska arbetsmarknaden — via guerilla-besök, inte ansökningar.

Sidedoor är ett kit: en MCP-server som ger Claude verktyg för bolagssökning, plus en instruktionsfil du klistrar in i Claude Desktop som gör Claude till din personliga karriärnavigator.

---

## Vad du får

- **Djupintervju** — 8 frågor som kartlägger vad du faktiskt kan bevisa, dina luckor, ditt wildcard
- **Ärlig poängsättning** — varje bolag bedöms 1–5 per relevant dimension med totalpoäng och "Ja / Nej / Inte just nu"
- **Guerilla-strategi** — fysisk besöksadress, bästa tid att dyka upp, öppningsmening, vad du lämnar bakom dig

---

## Krav

- Node.js ≥18
- Claude Desktop → claude.ai/download
- Brave Search API-nyckel — gratis, 2 000 queries/mån → brave.com/search/api

---

## Installation

### 1. Installera MCP-servern

```bash
npm install -g @opensverige/sidedoor
```

### 2. Lägg till i Claude Desktop

Öppna:
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

### 3. Skapa ett Claude Project

1. Öppna Claude Desktop
2. Klicka **Projects** → **New Project** → namnge det "Sidedoor"
3. Klicka på **Set instructions** (eller **Edit instructions**)
4. Kopiera hela innehållet i [SIDEDOOR.md](./SIDEDOOR.md) och klistra in
5. Spara och stäng

### 4. Starta

Öppna ett nytt samtal **inuti Sidedoor-projektet** och skriv bara:

> Hej

Claude tar det därifrån — 8 frågor, ärlig poängsättning, besöksplan.

---

## Verktyg (MCP)

| Verktyg | Beskrivning |
|---|---|
| `search_companies` | Hitta bolag inom sektor + stad + radie |
| `get_company_details` | Tillväxt, storlek, kultur för ett specifikt bolag |
| `get_contact_strategy` | Hitta VD, grundare eller HR |
| `get_office_location` | Fysisk besöksadress för guerilla-besök |

---

## Validering

Ett bekräftat möte från ett spontanbesök = validerat. Inget annat räknas.

| Metric | Dödsregel |
|---|---|
| npm downloads | <10 på 14 dagar → skrota |
| GitHub stars | <15 på 14 dagar → ifrågasätt |
| Faktisk kontakt | 0 svar i 14 dagar → skrota |
