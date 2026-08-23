"use client"

import * as React from "react"
import { inviteUser } from "./actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

export function InviteUserModal({ organizations }: { organizations: any[] }) {
  const [open, setOpen] = React.useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium bg-zinc-900 text-zinc-50 hover:bg-zinc-900/90 h-9 px-4 py-2 cursor-pointer">
        <DialogTrigger>Invite User</DialogTrigger>
      </div>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a New User</DialogTitle>
          <DialogDescription>
            Send an email invitation. They will be granted access to the selected organizations upon login.
          </DialogDescription>
        </DialogHeader>
        <form action={async (formData) => {
          await inviteUser(formData)
          setOpen(false)
        }} className="space-y-4 pt-4">
          
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" name="email" type="email" placeholder="jane@example.com" required />
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <Select name="role" defaultValue="MEMBER">
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="COMPANY_ADMIN">Company Admin</SelectItem>
                <SelectItem value="FINANCE_OFFICER">Finance Officer</SelectItem>
                <SelectItem value="TEAM_LEAD">Team Lead</SelectItem>
                <SelectItem value="MEMBER">Member</SelectItem>
                <SelectItem value="VIEWER">Viewer / Auditor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Organization Access</Label>
            <div className="space-y-2 border rounded-md p-3 bg-zinc-50">
              {organizations.map((org) => (
                <div key={org.id} className="flex items-center space-x-2">
                  <Checkbox id={`org-${org.id}`} name="organizations" value={org.id} />
                  <Label htmlFor={`org-${org.id}`} className="font-normal">{org.name}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit">Send Invitation</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
