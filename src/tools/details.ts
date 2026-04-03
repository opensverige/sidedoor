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

export async function getCompanyDetails(input: CompanyDetailsInput): Promise<CompanyDetailsOutput> {
  const { company_name } = input;

  const [general, financial, culture] = await Promise.all([
    braveSearch(`${company_name} Sverige anställda omsättning`, 3),
    braveSearch(`${company_name} nyemission expansion tillväxt 2024 2025`, 3),
    braveSearch(`${company_name} VD grundare team kultur`, 3)
  ]);

  return {
    company_name,
    searches: { general, financial, culture }
  };
}
