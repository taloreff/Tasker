'use client';
import { useState } from 'react';
import { Loader } from '@/components/loader';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useGetWorkspacesQuery } from '@/hooks/use-workspace';
import type { Workspace } from '@/types';
import { PlusCircle, Users } from 'lucide-react';
import { format } from 'date-fns';
import { NoDataFound } from '@/components/no-data-found';
import { CreateWorkspaceModal } from './create-workspace-modal';
import { WorkspaceAvatar } from '@/components/workspace/workspace-avatar';
import { useRouter } from 'next/navigation';

const Workspaces = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: workspaces, isLoading } = useGetWorkspacesQuery() as {
    data: Workspace[];
    isLoading: boolean;
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-3xl font-bold">Workspaces</h2>

          <Button onClick={() => setIsOpen(true)}>
            <PlusCircle className="size-4 mr-2" />
            New Workspace
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((ws) => (
            <WorkspaceCard key={ws.id} workspace={ws} />
          ))}

          {workspaces.length === 0 && (
            <NoDataFound
              title="No workspaces found"
              description="Create a new workspace to get started"
              buttonText="Create Workspace"
              buttonAction={() => setIsOpen(true)}
            />
          )}
        </div>
      </div>

      <CreateWorkspaceModal isOpen={isOpen} setOpen={setIsOpen} />
    </>
  );
};

const WorkspaceCard = ({ workspace }: { workspace: Workspace }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/workspaces/${workspace.id}`);
  };

  return (
    <Card
      className="transition-all hover:shadow-md hover:-translate-y-1 cursor-pointer"
      onClick={handleClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <WorkspaceAvatar name={workspace.name} color={workspace.color} />

            <div>
              <CardTitle>{workspace.name}</CardTitle>
              <span className="text-xs text-muted-foreground">
                Created at {format(workspace.createdAt, 'MMM d, yyyy h:mm a')}
              </span>
            </div>
          </div>

          <div className="flex items-center text-muted-foreground">
            <Users className="size-4 mr-1" />
            <span className="text-xs">{workspace?.members?.length}</span>
          </div>
        </div>

        <CardDescription>
          {workspace.description || 'No description'}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="text-sm text-muted-foreground">
          View workspace details and projects
        </div>
      </CardContent>
    </Card>
  );
};

export default Workspaces;
