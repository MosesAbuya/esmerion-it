"use server"

import { auth, prisma } from "@/auth"
import { logAuditAction } from "@/lib/audit"
import { revalidatePath } from "next/cache"

export async function saveSmtpConfig(formData: FormData) {
  const session = await auth()
  const isSuperadmin = (session?.user as any)?.isSystemSuperadmin

  if (!session?.user?.id || !isSuperadmin) {
    throw new Error("Unauthorized")
  }

  const host = formData.get("host") as string
  const port = parseInt(formData.get("port") as string, 10)
  const user = formData.get("user") as string
  const pass = formData.get("pass") as string
  const from = formData.get("from") as string

  const configValue = { host, port, user, pass, from }

  await prisma.systemConfig.upsert({
    where: { key: 'SMTP_CONFIG' },
    update: { value: configValue },
    create: { key: 'SMTP_CONFIG', value: configValue }
  })

  await logAuditAction({
    userId: session.user.id,
    action: "UPDATE_SMTP_CONFIG",
    resource: "SystemConfig"
  })

  revalidatePath("/superadmin/settings")
}
