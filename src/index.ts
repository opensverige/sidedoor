#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { searchCompanies } from "./tools/search.js";
import { getCompanyDetails } from "./tools/details.js";
import { getContactStrategy } from "./tools/strategy.js";
import { getOfficeLocation } from "./tools/office.js";
import { INTERVIEW_PROMPT_RESOURCE, INTERVIEW_PROMPT_URI } from "./resources/prompts.js";

// Validate API key at startup
if (!process.env.BRAVE_API_KEY) {
  console.error(
    "Fel: BRAVE_API_KEY saknas.\n" +
    "Hämta din gratis nyckel på brave.com/search/api\n" +
    "Lägg till den i claude_desktop_config.json under env.BRAVE_API_KEY"
  );
  process.exit(1);
}

const server = new Server(
  { name: "sidedoor", version: "1.0.0" },
  { capabilities: { tools: {}, resources: {} } }
);

// List tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "search_companies",
      description: "Hitta svenska bolag som matchar kandidatens profil och sektor",
      inputSchema: {
        type: "object",
        properties: {
          sector: { type: "string", description: "Sektor, t.ex. 'fintech', 'cleantech', 'SaaS B2B'" },
          location: { type: "string", description: "Stad, t.ex. 'Stockholm', 'Göteborg'" },
          signals: { type: "string", description: "Tillväxtsignaler, t.ex. 'nyemission scale-up'" },
          radius_km: { type: "number", description: "Sökradie i km från hemadress, t.ex. 20" }
        },
        required: ["sector", "location"]
      }
    },
    {
      name: "get_company_details",
      description: "Hämta djupare info om ett specifikt bolag — tillväxt, storlek, kultur",
      inputSchema: {
        type: "object",
        properties: {
          company_name: { type: "string", description: "Bolagets namn" },
          org_nr: { type: "string", description: "Organisationsnummer (valfritt)" }
        },
        required: ["company_name"]
      }
    },
    {
      name: "get_contact_strategy",
      description: "Hitta kontaktvägar och ingångspunkter till ett specifikt bolag",
      inputSchema: {
        type: "object",
        properties: {
          company_name: { type: "string", description: "Bolagets namn" },
          contact_type: {
            type: "string",
            enum: ["vd", "grundare", "hr", "alla"],
            description: "Vem du vill nå"
          }
        },
        required: ["company_name", "contact_type"]
      }
    },
    {
      name: "get_office_location",
      description: "Hitta fysisk besöksadress till ett bolags kontor — för guerilla-besök",
      inputSchema: {
        type: "object",
        properties: {
          company_name: { type: "string", description: "Bolagets namn" },
          city: { type: "string", description: "Stad att söka i" }
        },
        required: ["company_name", "city"]
      }
    }
  ]
}));

// Call tool
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result: unknown;

    if (name === "search_companies") {
      const a = args as Record<string, string | number | undefined>;
      if (!a.sector || !a.location) throw new Error("search_companies kräver 'sector' och 'location'");
      result = await searchCompanies({
        sector: String(a.sector),
        location: String(a.location),
        signals: a.signals ? String(a.signals) : undefined,
        radius_km: a.radius_km ? Number(a.radius_km) : undefined
      });
    } else if (name === "get_company_details") {
      const a = args as Record<string, string | undefined>;
      if (!a.company_name) throw new Error("get_company_details kräver 'company_name'");
      result = await getCompanyDetails({ company_name: a.company_name, org_nr: a.org_nr });
    } else if (name === "get_contact_strategy") {
      const a = args as Record<string, string | undefined>;
      if (!a.company_name || !a.contact_type) throw new Error("get_contact_strategy kräver 'company_name' och 'contact_type'");
      result = await getContactStrategy({
        company_name: a.company_name,
        contact_type: a.contact_type as "vd" | "grundare" | "hr" | "alla"
      });
    } else if (name === "get_office_location") {
      const a = args as Record<string, string | undefined>;
      if (!a.company_name || !a.city) throw new Error("get_office_location kräver 'company_name' och 'city'");
      result = await getOfficeLocation({ company_name: a.company_name, city: a.city });
    } else {
      throw new Error(`Okänt verktyg: ${name}`);
    }

    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      content: [{ type: "text", text: `Fel: ${message}` }],
      isError: true
    };
  }
});

// List resources
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    {
      uri: INTERVIEW_PROMPT_URI,
      name: INTERVIEW_PROMPT_RESOURCE.name,
      description: INTERVIEW_PROMPT_RESOURCE.description,
      mimeType: INTERVIEW_PROMPT_RESOURCE.mimeType
    }
  ]
}));

// Read resource
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;
  if (uri === INTERVIEW_PROMPT_URI) {
    return {
      contents: [
        {
          uri,
          mimeType: INTERVIEW_PROMPT_RESOURCE.mimeType,
          text: INTERVIEW_PROMPT_RESOURCE.text
        }
      ]
    };
  }
  throw new Error(`Okänd resurs: ${uri}`);
});

// Start server
(async () => {
  const transport = new StdioServerTransport();
  await server.connect(transport);
})();
