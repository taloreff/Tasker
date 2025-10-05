'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, MoreHorizontal, ChevronDown, ChevronRight } from 'lucide-react';
import { KanbanTask } from '@/components/board/kanban-task';
import { Task } from '@/types';

interface KanbanColumnProps {
  columnKey: string;
  tasks: Task[];
  onCreateTask: () => void;
  color?: string;
}

export function KanbanColumn({
  columnKey,
  tasks,
  onCreateTask,
  color = '#E5E7EB',
}: KanbanColumnProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: columnKey });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const sortedTasks = [...tasks].sort((a, b) => a.position - b.position);

  const displayName = columnKey.replace('_', ' ');

  return (
    <div ref={setNodeRef} style={style} className="flex-shrink-0 w-80">
      <Card className="h-fit max-h-[calc(100vh-200px)] flex flex-col">
        <CardHeader
          className="p-4 border-b cursor-pointer select-none"
          {...attributes}
          {...listeners}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="p-0 h-6 w-6"
              >
                {isCollapsed ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>

              <div className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <h3 className="font-semibold text-sm capitalize">
                  {displayName}
                </h3>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  {tasks.length}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                className="p-0 h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateTask();
                }}
              >
                <Plus className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="p-0 h-6 w-6"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isCollapsed && (
          <CardContent className="p-2 flex-1 overflow-auto">
            <SortableContext
              items={sortedTasks.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {sortedTasks.map((task) => (
                  <KanbanTask key={task.id} task={task} />
                ))}

                {sortedTasks.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      No tasks yet
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onCreateTask}
                      className="text-xs"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add task
                    </Button>
                  </div>
                )}
              </div>
            </SortableContext>

            {sortedTasks.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-2 justify-start text-muted-foreground hover:text-foreground"
                onClick={onCreateTask}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add task
              </Button>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
