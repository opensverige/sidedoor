import { braveSearch, BraveResult } from "../brave.js";

export type ContactType = "vd" | "grundare" | "hr" | "alla";

export interface ContactStrategyInput {
  company_name: string;
  contact_type: ContactType;
}

export interface ContactStrategyOutput {
  company_name: string;
  contact_type: ContactType;
  results: BraveResult[];
}

const QUERIES: Record<ContactType, (name: string) => string> = {
  vd: (name) => `${name} VD CEO LinkedIn kontakt`,
  grundare: (name) => `${name} grundare founder LinkedIn`,
  hr: (name) => `${name} HR People karriär`,
  alla: (name) => `${name} kontakt LinkedIn team`
};

export async function getContactStrategy(input: ContactStrategyInput): Promise<ContactStrategyOutput> {
  const { company_name, contact_type } = input;
  const query = QUERIES[contact_type](company_name);
  const results = await braveSearch(query, 5);
  return { company_name, contact_type, results };
}
