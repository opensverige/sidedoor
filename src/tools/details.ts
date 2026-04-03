import { braveSearch, BraveResult } from "../brave.js";

export interface CompanyDetailsInput {
  company_name: string;
  org_nr?: string;
}

export interface CompanyDetailsOutput {
  company_name: string;
  searches: {
    general: BraveResult[];
    financial: BraveResult[];
    culture: BraveResult[];
  };
}

const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

export async function getCompanyDetails(input: CompanyDetailsInput): Promise<CompanyDetailsOutput> {
  const { company_name } = input;

  const general = await braveSearch(`${company_name} Sverige anställda omsättning`, 3);
  await wait(1200);
  const financial = await braveSearch(`${company_name} nyemission expansion tillväxt 2024 2025`, 3);
  await wait(1200);
  const culture = await braveSearch(`${company_name} VD grundare team kultur`, 3);

  return {
    company_name,
    searches: { general, financial, culture }
  };
}
