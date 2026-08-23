import { auth, prisma } from "@/auth"
import { redirect } from "next/navigation"
import { saveSmtpConfig } from "./actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default async function SettingsPage() {
  const session = await auth()
  const isSuperadmin = (session?.user as any)?.isSystemSuperadmin

  if (!isSuperadmin) {
    redirect("/")
  }

  const configRecord = await prisma.systemConfig.findUnique({
    where: { key: 'SMTP_CONFIG' }
  })

  const currentConfig = configRecord?.value as any || { host: '', port: '', user: '', pass: '', from: '' }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-zinc-500 mt-2">Manage global configurations for Esmerion IT.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>SMTP Configuration</CardTitle>
          <CardDescription>
            Configure the email server used for sending Magic Links and invitations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={saveSmtpConfig} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="host">SMTP Host</Label>
                <Input id="host" name="host" defaultValue={currentConfig.host} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="port">SMTP Port</Label>
                <Input id="port" name="port" type="number" defaultValue={currentConfig.port} required />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="user">SMTP Username</Label>
              <Input id="user" name="user" defaultValue={currentConfig.user} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pass">SMTP Password</Label>
              <Input id="pass" name="pass" type="password" defaultValue={currentConfig.pass} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="from">From Email Address</Label>
              <Input id="from" name="from" type="email" placeholder="noreply@malshemedia.com" defaultValue={currentConfig.from} required />
            </div>

            <Button type="submit">Save Configuration</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
