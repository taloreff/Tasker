'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { ChevronDown, type LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Folder,
  CheckSquare,
  Kanban,
  Tag,
  Users,
  User,
  Settings,
  Home,
  Briefcase,
} from 'lucide-react';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';

interface NavItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
  }[];
}

const data: {
  navMain: NavItem[];
  navWork: NavItem[];
  navAccount: NavItem[];
} = {
  // Core dashboard and tasks (MVP Phase 1)
  navMain: [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: 'My Tasks',
      url: '/tasks',
      icon: CheckSquare,
      items: [
        {
          title: 'All Tasks',
          url: '/tasks',
        },
        {
          title: 'High Priority',
          url: '/tasks/high-priority',
        },
        {
          title: 'Due Today',
          url: '/tasks/today',
        },
        {
          title: 'Completed',
          url: '/tasks/completed',
        },
      ],
    },
    {
      title: 'Boards',
      url: '/boards',
      icon: Kanban,
    },
  ],

  // Organization structure based on backend entities
  navWork: [
    {
      title: 'Workspaces',
      url: '/workspaces',
      icon: Briefcase,
      items: [
        {
          title: 'My Workspaces',
          url: '/workspaces',
        },
        {
          title: 'Create Workspace',
          url: '/workspaces/new',
        },
      ],
    },
    {
      title: 'Teams',
      url: '/teams',
      icon: Users,
      items: [
        {
          title: 'My Teams',
          url: '/teams',
        },
        {
          title: 'Create Team',
          url: '/teams/new',
        },
      ],
    },
    {
      title: 'Projects',
      url: '/projects',
      icon: Folder,
      items: [
        {
          title: 'All Projects',
          url: '/projects',
        },
        {
          title: 'Active Projects',
          url: '/projects/active',
        },
        {
          title: 'Create Project',
          url: '/projects/new',
        },
      ],
    },
    {
      title: 'Labels',
      url: '/labels',
      icon: Tag,
      items: [
        {
          title: 'All Labels',
          url: '/labels',
        },
        {
          title: 'Create Label',
          url: '/labels/new',
        },
      ],
    },
  ],

  navAccount: [
    {
      title: 'Profile',
      url: '/profile',
      icon: User,
    },
    {
      title: 'Settings',
      url: '/settings',
      icon: Settings,
      items: [
        {
          title: 'Account',
          url: '/settings/account',
        },
        {
          title: 'Preferences',
          url: '/settings/preferences',
        },
        {
          title: 'Notifications',
          url: '/settings/notifications',
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  const { open: isOpen, setOpen } = useSidebar();
  const [openCollapsibles, setOpenCollapsibles] = React.useState<Set<string>>(new Set());

  // Function to check if a path is active
  const isActive = (url: string) => {
    if (url === '/dashboard' && pathname === '/dashboard') return true;
    if (url !== '/dashboard' && pathname.startsWith(url)) return true;
    return false;
  };

  // Function to check if parent has active child
  const hasActiveChild = (items?: { url: string; title: string }[]) => {
    return items?.some((item) => isActive(item.url)) || false;
  };

  // Function to handle item clicks - expand sidebar if collapsed and has subitems
  const handleItemClick = (event: React.MouseEvent, itemTitle: string, hasSubItems?: boolean) => {
    if (!isOpen && hasSubItems) {
      event.preventDefault();
      setOpen(true);
      // Open the collapsible when sidebar expands
      setOpenCollapsibles(prev => new Set([...prev, itemTitle]));
    }
    // If no subitems, just allow normal navigation without expanding sidebar
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
                {item.items?.length ? (
                  <Collapsible 
                    className="group/collapsible" 
                    open={openCollapsibles.has(item.title)}
                    onOpenChange={(open) => {
                      if (open) {
                        setOpenCollapsibles(prev => new Set([...prev, item.title]));
                      } else {
                        setOpenCollapsibles(prev => {
                          const newSet = new Set(prev);
                          newSet.delete(item.title);
                          return newSet;
                        });
                      }
                    }}
                  >
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.title}
                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        isActive={hasActiveChild(item.items)}
                        onClick={(event) => handleItemClick(event, item.title, true)}
                      >
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                        <ChevronDown className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={isActive(subItem.url)}
                            >
                              <a href={subItem.url}>
                                <span>{subItem.title}</span>
                              </a>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </Collapsible>
                ) : (
                  <SidebarMenuButton
                    tooltip={item.title}
                    asChild
                    isActive={isActive(item.url)}
                  >
                    <a 
                      href={item.url}
                      onClick={(event) => {
                        // Prevent any sidebar expansion for items without subitems
                        event.stopPropagation();
                      }}
                    >
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Organization</SidebarGroupLabel>
          <SidebarMenu>
            {data.navWork.map((item) => (
              <SidebarMenuItem key={item.title}>
                {item.items?.length ? (
                  <Collapsible 
                    className="group/collapsible" 
                    open={openCollapsibles.has(item.title)}
                    onOpenChange={(open) => {
                      if (open) {
                        setOpenCollapsibles(prev => new Set([...prev, item.title]));
                      } else {
                        setOpenCollapsibles(prev => {
                          const newSet = new Set(prev);
                          newSet.delete(item.title);
                          return newSet;
                        });
                      }
                    }}
                  >
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.title}
                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        isActive={hasActiveChild(item.items)}
                        onClick={(event) => handleItemClick(event, item.title, true)}
                      >
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                        <ChevronDown className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={isActive(subItem.url)}
                            >
                              <a href={subItem.url}>
                                <span>{subItem.title}</span>
                              </a>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </Collapsible>
                ) : (
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={isActive(item.url)}
                  >
                    <a 
                      href={item.url}
                      onClick={(event) => {
                        // Prevent any sidebar expansion for items without subitems
                        event.stopPropagation();
                      }}
                    >
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarMenu>
            {data.navAccount.map((item) => (
              <SidebarMenuItem key={item.title}>
                {item.items?.length ? (
                  <Collapsible 
                    className="group/collapsible" 
                    open={openCollapsibles.has(item.title)}
                    onOpenChange={(open) => {
                      if (open) {
                        setOpenCollapsibles(prev => new Set([...prev, item.title]));
                      } else {
                        setOpenCollapsibles(prev => {
                          const newSet = new Set(prev);
                          newSet.delete(item.title);
                          return newSet;
                        });
                      }
                    }}
                  >
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.title}
                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        isActive={hasActiveChild(item.items)}
                        onClick={(event) => handleItemClick(event, item.title, true)}
                      >
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                        <ChevronDown className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={isActive(subItem.url)}
                            >
                              <a href={subItem.url}>
                                <span>{subItem.title}</span>
                              </a>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </Collapsible>
                ) : (
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={isActive(item.url)}
                  >
                    <a 
                      href={item.url}
                      onClick={(event) => {
                        // Prevent any sidebar expansion for items without subitems
                        event.stopPropagation();
                      }}
                    >
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="flex items-center">
        <SidebarMenu className={!isOpen ? 'items-center' : ''}>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a 
                href="/profile"
                onClick={(event) => {
                  // Prevent any sidebar expansion for profile link
                  event.stopPropagation();
                }}
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-accent text-sidebar-accent-foreground">
                  <User className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">John Doe</span>
                  <span className="truncate text-xs">john@tasker.dev</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarTrigger className="self-end gap-0" />
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
