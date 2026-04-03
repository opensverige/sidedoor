import { braveSearch, BraveResult } from "../brave.js";

export interface SearchCompaniesInput {
  sector: string;
  location: string;
  signals?: string;
}

export interface SearchCompaniesOutput {
  query_used: string;
  results: BraveResult[];
}

export async function searchCompanies(input: SearchCompaniesInput): Promise<SearchCompaniesOutput> {
  const { sector, location, signals } = input;
  const query = `${sector} bolag ${location} ${signals ?? "tillväxt"} 2024 2025`;
  const results = await braveSearch(query, 8);
  return { query_used: query, results };
}
