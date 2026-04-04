import { braveSearch, BraveResult } from "../brave.js";

export interface OfficeLocationInput {
  company_name: string;
  city: string;
}

export interface OfficeLocationOutput {
  company_name: string;
  city: string;
  results: BraveResult[];
}

export async function getOfficeLocation(input: OfficeLocationInput): Promise<OfficeLocationOutput> {
  const { company_name, city } = input;
  const results = await braveSearch(
    `${company_name} kontor adress ${city} besöksadress`,
    5
  );
  return { company_name, city, results };
}
