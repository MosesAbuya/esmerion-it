import { prisma } from "@/auth"

export async function logAuditAction({
  userId,
  organizationId,
  action,
  resource,
  details
}: {
  userId?: string
  organizationId?: string
  action: string
  resource: string
  details?: any
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        organizationId,
        action,
        resource,
        details
      }
    })
  } catch (error) {
    console.error("Failed to write audit log", error)
  }
}
