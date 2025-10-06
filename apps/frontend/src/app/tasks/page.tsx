'use client';

import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Tasks</h1>
          <p className="text-muted-foreground">
            Manage your personal tasks and assignments
          </p>
        </div>
        <Button>
          <PlusCircle className="size-4 mr-2" />
          New Task
        </Button>
      </div>
      
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <PlusCircle className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No tasks found</h3>
          <p className="mb-4 mt-2 text-sm text-muted-foreground">
            Create your first task to get started with task management.
          </p>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Task
          </Button>
        </div>
      </div>
    </div>
  );
}