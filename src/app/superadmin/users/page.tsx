import { auth, prisma } from "@/auth"
import { redirect } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { InviteUserModal } from "./invite-user-modal"
import { UserActions } from "./user-actions"

export default async function UsersPage() {
  const session = await auth()
  const isSuperadmin = (session?.user as any)?.isSystemSuperadmin

  if (!isSuperadmin) redirect("/")

  const users = await prisma.user.findMany({
    include: {
      memberships: {
        include: { organization: true }
      }
    }
  })

  const organizations = await prisma.organization.findMany()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Directory</h1>
          <p className="text-zinc-500 mt-2">Manage members, access levels, and invitations across all organizations.</p>
        </div>
        <InviteUserModal organizations={organizations} />
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Organizations & Roles</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="font-medium">{user.name || "Unknown"}</div>
                  <div className="text-sm text-zinc-500">{user.email}</div>
                  {user.isSystemSuperadmin && (
                    <Badge variant="secondary" className="mt-1">Superadmin</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {user.memberships.map((m) => (
                      <span key={m.organization.id} className="text-sm">
                        <span className="font-medium">{m.organization.name}</span>: <span className="text-zinc-500">{m.role}</span>
                      </span>
                    ))}
                    {user.memberships.length === 0 && (
                      <span className="text-sm text-zinc-400 italic">No access</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {/* We consider a user suspended if ANY membership is suspended, for simplicity, or just show the primary status */}
                  {user.memberships.some(m => m.status === 'SUSPENDED') ? (
                    <Badge variant="destructive">Suspended</Badge>
                  ) : (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <UserActions userId={user.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
