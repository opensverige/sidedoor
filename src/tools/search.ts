import { braveSearch, BraveResult } from "../brave.js";

export interface SearchCompaniesInput {
  sector: string;
  location: string;
  signals?: string;
  radius_km?: number;
}

export interface SearchCompaniesOutput {
  query_used: string;
  results: BraveResult[];
}

export async function searchCompanies(input: SearchCompaniesInput): Promise<SearchCompaniesOutput> {
  const { sector, location, signals, radius_km } = input;
  const radiusSuffix = radius_km ? ` inom ${radius_km}km` : "";
  const query = `${sector} bolag kontor ${location}${radiusSuffix} ${signals ?? "tillväxt"} 2024 2025`;
  const results = await braveSearch(query, 8);
  return { query_used: query, results };
}
