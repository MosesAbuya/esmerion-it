import NextAuth from "next-auth"
import Nodemailer from "next-auth/providers/nodemailer"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client/edge"
import { PrismaNeon } from "@prisma/adapter-neon"
import { Pool, neonConfig } from "@neondatabase/serverless"
import ws from "ws"
import nodemailer from "nodemailer"

neonConfig.webSocketConstructor = ws

const connectionString = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_l45aCcbZFAqu@ep-plain-frost-b2dxi9ds-pooler.c-6.eu-central-1.aws.neon.tech/neondb?sslmode=require"
const adapter = new PrismaNeon({ connectionString })
export const prisma = new PrismaClient({ adapter })

export const { handlers, auth, signIn, signOut } = NextAuth((req) => ({
  secret: process.env.AUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  providers: [
    Nodemailer({
      server: {
        host: "dummy",
        port: 25,
        auth: { user: "dummy", pass: "dummy" },
      },
      from: "dummy@example.com",
      async sendVerificationRequest(params) {
        const { identifier, url, provider } = params
        
        // Fetch SMTP config from DB
        const configRecord = await prisma.systemConfig.findUnique({
          where: { key: 'SMTP_CONFIG' }
        })
        
        if (!configRecord) {
          console.log("\n=======================================================")
          console.log("⚠️ SMTP Config missing in DB. Printing Magic Link to console:")
          console.log(url)
          console.log("=======================================================\n")
          return
        }
        
        const smtpConfig = configRecord.value as any
        const transport = nodemailer.createTransport({
          host: smtpConfig.host,
          port: smtpConfig.port,
          secure: smtpConfig.port === 465,
          auth: {
            user: smtpConfig.user,
            pass: smtpConfig.pass,
          },
        })
        
        const result = await transport.sendMail({
          to: identifier,
          from: smtpConfig.from || provider.from,
          subject: `Sign in to Esmerion IT`,
          text: `Sign in link: ${url}`,
          html: `<p>Click here to sign in: <a href="${url}">${url}</a></p>`,
        })
        
        const failed = result.rejected.concat(result.pending).filter(Boolean)
        if (failed.length) {
          throw new Error(`Email(s) (${failed.join(", ")}) could not be sent`)
        }
      },
    }),
  ],
  events: {
    async signIn({ user }) {
      if (!user.email) return

      // Find pending invitations for this email
      const pendingInvites = await prisma.organizationInvitation.findMany({
        where: { email: user.email, status: 'PENDING' }
      })

      for (const invite of pendingInvites) {
        // Create membership
        await prisma.membership.upsert({
          where: {
            userId_organizationId: {
              userId: user.id!,
              organizationId: invite.organizationId
            }
          },
          update: { role: invite.role, status: 'ACTIVE' },
          create: {
            userId: user.id!,
            organizationId: invite.organizationId,
            role: invite.role,
            status: 'ACTIVE'
          }
        })

        // Mark invite accepted
        await prisma.organizationInvitation.update({
          where: { id: invite.id },
          data: { status: 'ACCEPTED' }
        })
      }
    }
  },
  callbacks: {
    async session({ session, user }) {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          memberships: {
            include: { organization: true }
          }
        }
      })
      
      if (dbUser) {
        // @ts-ignore
        session.user.memberships = dbUser.memberships
        // @ts-ignore
        session.user.isSystemSuperadmin = dbUser.isSystemSuperadmin
      }
      return session
    }
  }
}));\n