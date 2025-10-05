'use client';

import * as React from 'react';
import { Bell, Settings, User, ChevronDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/providers/auth-provider';
import { useGetWorkspacesQuery } from '@/hooks/use-workspace';
import { Workspace } from '@/types';
import { useState } from 'react';
import { CreateWorkspaceModal } from '@/app/workspaces/create-workspace-modal';
import { useRouter } from 'next/navigation';

interface WorkspaceSelectorProps {
  onWorkspaceSelected: (workspace: Workspace) => void;
  selectedWorkspace: Workspace | null;
  onCreateWorkspace: () => void;
}

function WorkspaceSelector({
  onWorkspaceSelected,
  selectedWorkspace,
  onCreateWorkspace,
}: WorkspaceSelectorProps) {
  const { data: workspaces } = useGetWorkspacesQuery() as {
    data: Workspace[];
  };

  const handleCreateWorkspace = () => {
    onCreateWorkspace();
  };

  const handleSelectWorkspace = (workspace: Workspace) => {
    onWorkspaceSelected(workspace);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-2 px-3 ">
          <span className="font-medium">
            {selectedWorkspace?.name || 'Select Workspace'}
          </span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64 border-neutral-200">
        <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {workspaces && workspaces.length > 0 ? (
          <>
            {workspaces.map((workspace) => (
              <DropdownMenuItem
                key={workspace.id}
                onClick={() => handleSelectWorkspace(workspace)}
                className={
                  selectedWorkspace?.id === workspace.id ? 'bg-muted' : ''
                }
              >
                <span>{workspace.name}</span>
                {selectedWorkspace?.id === workspace.id && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    Current
                  </span>
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
          </>
        ) : null}
        <DropdownMenuItem onClick={handleCreateWorkspace}>
          <Plus className="mr-2 h-4 w-4" />
          <span>Create Workspace</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function TopNavbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(
    null
  );
  const [isCreating, setIsCreating] = useState(false);

  const handleWorkspaceSelected = (workspace: Workspace) => {
    setCurrentWorkspace(workspace);
    router.push(`/workspaces/${workspace.id}`);
  };

  return (
    <header className="bg-background sticky top-0 z-50 shadow-md">
      <div className="flex h-16 items-center px-4 gap-4">
        <WorkspaceSelector
          onWorkspaceSelected={handleWorkspaceSelected}
          selectedWorkspace={currentWorkspace}
          onCreateWorkspace={() => setIsCreating(true)}
        />
        <div className="flex-1" />

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-600"></span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={user?.avatar}
                    alt={`${user?.firstName} ${user?.lastName}`}
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user?.firstName?.[0]}
                    {user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 border-neutral-200"
              align="end"
              forceMount
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={logout}
                className="text-red-600 focus:bg-red-50 focus:text-red-600"
              >
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <CreateWorkspaceModal isOpen={isCreating} setOpen={setIsCreating} />
    </header>
  );
}
