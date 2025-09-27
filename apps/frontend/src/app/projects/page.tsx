'use client';

import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-muted-foreground">
            Organize and manage your projects and deliverables
          </p>
        </div>
        <Button>
          <PlusCircle className="size-4 mr-2" />
          New Project
        </Button>
      </div>
      
      {/* Empty state */}
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <PlusCircle className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No projects found</h3>
          <p className="mb-4 mt-2 text-sm text-muted-foreground">
            Create your first project to start organizing your work and deliverables.
          </p>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Project
          </Button>
        </div>
      </div>
    </div>
  );
}