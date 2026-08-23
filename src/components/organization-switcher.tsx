"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function OrganizationSwitcher() {
  const { data: session } = useSession()
  const memberships = (session?.user as any)?.memberships || []
  
  const [activeOrg, setActiveOrg] = React.useState<string>("")

  React.useEffect(() => {
    if (memberships.length > 0 && !activeOrg) {
      setActiveOrg(memberships[0].organization.id)
    }
  }, [memberships, activeOrg])

  if (memberships.length === 0) return null

  return (
    <Select value={activeOrg} onValueChange={(val) => { if (val) setActiveOrg(val) }}>
      <SelectTrigger className="w-[250px] bg-white text-black font-medium border-zinc-200">
        <SelectValue placeholder="Select Organization" />
      </SelectTrigger>
      <SelectContent>
        {memberships.map((m: any) => (
          <SelectItem key={m.organization.id} value={m.organization.id}>
            {m.organization.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
