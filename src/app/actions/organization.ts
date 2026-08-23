"use server";

import { prisma } from "@/auth";
import { seedChartOfAccounts } from "@/lib/accounting/seed";

export async function createOrganization(name: string, slug: string, baseCurrency: string = "KES", parentOrganizationId?: string) {
  const org = await prisma.organization.create({
    data: {
      name,
      slug,
      baseCurrency,
      parentOrganizationId,
    }
  });

  // Seed the default chart of accounts
  await seedChartOfAccounts(org.id);

  return org;
}
