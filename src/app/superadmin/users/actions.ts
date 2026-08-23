"use server"

import { auth, prisma } from "@/auth"
import { logAuditAction } from "@/lib/audit"
import { revalidatePath } from "next/cache"
import nodemailer from "nodemailer"
import crypto from "crypto"

export async function inviteUser(formData: FormData) {
  const session = await auth()
  const isSuperadmin = (session?.user as any)?.isSystemSuperadmin

  if (!session?.user?.id || !isSuperadmin) throw new Error("Unauthorized")

  const email = formData.get("email") as string
  const role = formData.get("role") as string
  const organizationIds = formData.getAll("organizations") as string[]

  if (!email || !role || organizationIds.length === 0) {
    throw new Error("Missing fields")
  }

  // 1. Fetch SMTP Config
  const configRecord = await prisma.systemConfig.findUnique({
    where: { key: 'SMTP_CONFIG' }
  })
  
  if (!configRecord) {
    throw new Error("SMTP is not configured. Please configure it in System Settings first.")
  }
  
  const smtpConfig = configRecord.value as any

  // 2. Create Invitations
  const token = crypto.randomUUID()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 7 days

  for (const orgId of organizationIds) {
    await prisma.organizationInvitation.create({
      data: {
        email,
        organizationId: orgId,
        role,
        token: `${token}-${orgId}`, // Unique per org invite
        expiresAt,
        inviterId: session.user.id
      }
    })
  }

  // 3. Send Email
  const transport = nodemailer.createTransport({
    host: smtpConfig.host,
    port: smtpConfig.port,
    secure: smtpConfig.port === 465,
    auth: {
      user: smtpConfig.user,
      pass: smtpConfig.pass,
    },
  })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const inviteUrl = `${appUrl}/api/auth/signin?email=${encodeURIComponent(email)}`

  await transport.sendMail({
    to: email,
    from: smtpConfig.from,
    subject: `You've been invited to Esmerion IT`,
    text: `You have been invited to join an organization on Esmerion IT. Login here: ${inviteUrl}`,
    html: `<p>You have been invited to join an organization on Esmerion IT. <br/><a href="${inviteUrl}">Click here to log in</a></p>`,
  })

  await logAuditAction({
    userId: session.user.id,
    action: "INVITE_USER",
    resource: "OrganizationInvitation",
    details: { email, role, organizationIds }
  })

  revalidatePath("/superadmin/users")
}

export async function updateUserStatus(userId: string, status: string) {
  const session = await auth()
  const isSuperadmin = (session?.user as any)?.isSystemSuperadmin
  
  if (!session?.user?.id || !isSuperadmin) throw new Error("Unauthorized")

  await prisma.membership.updateMany({
    where: { userId },
    data: { status }
  })

  await logAuditAction({
    userId: session.user.id,
    action: `UPDATE_USER_STATUS_${status}`,
    resource: "User",
    details: { targetUserId: userId }
  })

  revalidatePath("/superadmin/users")
}
