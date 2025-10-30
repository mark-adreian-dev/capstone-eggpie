

import * as React from "react"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

interface TeamSwitcherProps {
  teams: TeamSwitcher[]
}
interface TeamSwitcher {
  name: string
  logo: React.ElementType
  plan: string
}

export function TeamSwitcher({ teams }: TeamSwitcherProps) {
  const Team = teams[0]

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
            <Team.logo className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">Clarmil</span>
            <span className="truncate text-xs">Operations</span>
          </div>

        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
