"use client"

import * as React from "react"
import { updateUserStatus } from "./actions"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function UserActions({ userId }: { userId: string }) {
  return (
    <DropdownMenu>
      <div className="inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-zinc-100 hover:text-zinc-900 h-8 w-8 p-0 cursor-pointer">
        <DropdownMenuTrigger>
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>
      </div>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(userId)}>
          Copy User ID
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => updateUserStatus(userId, 'ACTIVE')}>
          Reinstate Access
        </DropdownMenuItem>
        <DropdownMenuItem className="text-red-600" onClick={() => updateUserStatus(userId, 'SUSPENDED')}>
          Suspend User
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
