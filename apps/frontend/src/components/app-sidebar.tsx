'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { LogOut, Users, type LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Folder,
  CheckSquare,
  Tag,
  Home,
  Briefcase,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/providers/auth-provider';

interface NavItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
}

const data: {
  navMain: NavItem[];
  navWork: NavItem[];
} = {
  navMain: [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: LayoutDashboard,
      isActive: true,
    },

    {
      title: 'Workspaces',
      url: '/workspaces',
      icon: Briefcase,
    },
  ],

  navWork: [
    {
      title: 'My Tasks',
      url: '/tasks',
      icon: CheckSquare,
    },
    {
      title: 'Teams',
      url: '/teams',
      icon: Users,
    },
    {
      title: 'Projects',
      url: '/projects',
      icon: Folder,
    },
    {
      title: 'Labels',
      url: '/labels',
      icon: Tag,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { open: isOpen } = useSidebar();

  const isActive = (url: string) => {
    if (url === '/dashboard' && pathname === '/dashboard') return true;
    if (url !== '/dashboard' && pathname.startsWith(url)) return true;
    return false;
  };

  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Home className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Tasker</span>
                  <span className="truncate text-xs">Task Management</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarMenu>
            {data.navMain.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  asChild
                  isActive={isActive(item.url)}
                >
                  <a href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Organization</SidebarGroupLabel>
          <SidebarMenu>
            {data.navWork.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  asChild
                  isActive={isActive(item.url)}
                >
                  <a href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <Separator />
      <SidebarFooter className="flex items-center">
        <SidebarMenu className={!isOpen ? 'items-center' : ''}>
          <SidebarMenuItem>
            <SidebarMenuButton className="w-full" onClick={logout}>
              <LogOut className="mr-2" />
              Logout
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarTrigger className="self-end gap-0" />
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
