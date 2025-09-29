'use client';

import * as React from 'react';
import { usePathname, useParams } from 'next/navigation';
import { LogOut, Users, type LucideIcon, BarChart3, Settings, Grid3X3 } from 'lucide-react';
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
import { useGetWorkspaceByIdQuery } from '@/hooks/use-workspace';

interface NavItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const params = useParams();
  const { logout } = useAuth();
  const { open: isOpen } = useSidebar();
  
  const workspaceId = params?.id as string;
  const { data: workspace } = useGetWorkspaceByIdQuery(workspaceId);

  const isActive = (url: string) => {
    if (url === '/dashboard' && pathname === '/dashboard') return true;
    if (url !== '/dashboard' && pathname.startsWith(url)) return true;
    return false;
  };

  // Main navigation items
  const mainNavItems: NavItem[] = [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Workspaces',
      url: '/workspaces',
      icon: Briefcase,
    },
  ];

  // Workspace-specific navigation (only show when in a workspace)
  const workspaceNavItems: NavItem[] = workspaceId ? [
    {
      title: 'Boards',
      url: `/workspaces/${workspaceId}`,
      icon: Grid3X3,
    },
    {
      title: 'Analytics',
      url: `/workspaces/${workspaceId}/dashboard`,
      icon: BarChart3,
    },
    {
      title: 'Teams',
      url: `/workspaces/${workspaceId}/teams`,
      icon: Users,
    },
    {
      title: 'Settings',
      url: `/workspaces/${workspaceId}/settings`,
      icon: Settings,
    },
  ] : [];

  // Global items
  const globalNavItems: NavItem[] = [
    {
      title: 'My Items',
      url: '/my-items',
      icon: CheckSquare,
    },
    {
      title: 'Labels',
      url: '/labels',
      icon: Tag,
    },
  ];

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
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarMenu>
            {mainNavItems.map((item) => (
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

        {/* Workspace-specific navigation */}
        {workspaceId && workspace && (
          <SidebarGroup>
            <SidebarGroupLabel>
              {workspace.name}
            </SidebarGroupLabel>
            <SidebarMenu>
              {workspaceNavItems.map((item) => (
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
        )}

        {/* Global navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Personal</SidebarGroupLabel>
          <SidebarMenu>
            {globalNavItems.map((item) => (
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
