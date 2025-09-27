'use client';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

const Workspaces = () => {
  const handleCreateWorkspace = () => {
    // TODO: Implement workspace creation
    console.log('Create workspace clicked');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Workspaces</h1>
          <p className="text-muted-foreground">
            Manage and organize your workspaces
          </p>
        </div>
        <Button onClick={handleCreateWorkspace}>
          <PlusCircle className="size-4 mr-2" />
          New Workspace
        </Button>
      </div>
      
      {/* Empty state */}
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <PlusCircle className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No workspaces found</h3>
          <p className="mb-4 mt-2 text-sm text-muted-foreground">
            Create a new workspace to get started with organizing your projects and teams.
          </p>
          <Button onClick={handleCreateWorkspace}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Workspace
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Workspaces;
