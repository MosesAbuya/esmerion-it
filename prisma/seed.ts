import { PrismaClient } from '@prisma/client'
import { Pool, neonConfig } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import ws from 'ws'
import dotenv from 'dotenv'

dotenv.config()
neonConfig.webSocketConstructor = ws

const connectionString = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_l45aCcbZFAqu@ep-plain-frost-b2dxi9ds-pooler.c-6.eu-central-1.aws.neon.tech/neondb?sslmode=require"
const adapter = new PrismaNeon({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding initial data...')

  // 1. Create System Modules
  const modules = [
    { key: 'tendering', name: 'Tendering & Procurement' },
    { key: 'design-web', name: 'Design & Web Development' },
    { key: 'finance', name: 'Financial Management' },
    { key: 'editorial', name: 'Editorial & Production' },
    { key: 'secretariat', name: 'Secretariat' },
    { key: 'pr-social', name: 'PR & Social Media' },
    { key: 'design-content', name: 'Design & Content' },
    { key: 'ad-sales', name: 'Ad Sales & Sponsorship' },
  ]
  
  for (const m of modules) {
    await prisma.module.upsert({
      where: { key: m.key },
      update: {},
      create: m,
    })
  }

  // 2. Create Malshe Media (Root Organization)
  const malshe = await prisma.organization.upsert({
    where: { slug: 'malshe-media' },
    update: {},
    create: {
      name: 'Malshe Media',
      slug: 'malshe-media',
      type: 'INTERNAL',
    },
  })

  // 3. Create TurningPoint (Child Organization of Malshe)
  const turningPoint = await prisma.organization.upsert({
    where: { slug: 'turningpoint' },
    update: {},
    create: {
      name: 'TurningPoint',
      slug: 'turningpoint',
      type: 'INTERNAL',
      parentOrganizationId: malshe.id,
    },
  })

  // 4. Enable Modules for Organizations
  for (const org of [malshe, turningPoint]) {
    for (const m of modules) {
      await prisma.organizationModule.upsert({
        where: {
          organizationId_moduleKey: {
            organizationId: org.id,
            moduleKey: m.key,
          },
        },
        update: {},
        create: {
          organizationId: org.id,
          moduleKey: m.key,
          enabled: true,
        },
      })
    }
  }

  // 5. Create System Superadmin User
  const superadminEmail = 'admin@malshe.media' // Change this to your preferred admin email
  const superadmin = await prisma.user.upsert({
    where: { email: superadminEmail },
    update: { isSystemSuperadmin: true },
    create: {
      email: superadminEmail,
      name: 'System Superadmin',
      isSystemSuperadmin: true,
    },
  })

  // 6. Give Superadmin OWNER role in both orgs
  for (const org of [malshe, turningPoint]) {
    await prisma.membership.upsert({
      where: {
        userId_organizationId: {
          userId: superadmin.id,
          organizationId: org.id,
        },
      },
      update: { role: 'OWNER' },
      create: {
        userId: superadmin.id,
        organizationId: org.id,
        role: 'OWNER',
        status: 'ACTIVE',
      },
    })
  }

  console.log('Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
