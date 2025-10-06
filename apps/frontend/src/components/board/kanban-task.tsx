'use client';

import { useSortable, defaultAnimateLayoutChanges } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { priorityColors, statusColors, statusIcons } from '@/lib/consts';
import { Task } from '@/types';
import { GroupBy } from '@/hooks/use-kanban-dnd';

interface KanbanTaskProps {
  task: Task;
  isDragged?: boolean;
  groupBy: GroupBy;
}

function animateLayoutChanges(args: any) {
  const { isSorting, wasDragging } = args;
  if (isSorting || wasDragging) return defaultAnimateLayoutChanges(args);
  return true;
}

export function KanbanTask({
  task,
  isDragged = false,
  groupBy,
}: KanbanTaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    animateLayoutChanges,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? 'transform 200ms ease-in-out',
    opacity: isDragging ? 0.5 : 1,
  };

  const StatusIcon = statusIcons[task.status];
  const priorityClass =
    priorityColors[task.priority as keyof typeof priorityColors] ||
    'bg-gray-200 text-gray-800';

  const statusClass =
    statusColors[task.status as keyof typeof statusColors] ||
    'bg-gray-200 text-gray-800';

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'cursor-grab active:cursor-grabbing select-none hover:shadow-md transition-all duration-200 border bg-card',
        isDragging && 'z-50 rotate-[2deg] scale-[1.03] shadow-xl',
        isDragged && 'opacity-80 rotate-[1.5deg] scale-[1.02]'
      )}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-medium text-sm leading-tight flex-1 pr-2">
            {task.name}
          </h4>
        </div>

        {task.description && (
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* --- Assignee --- */}
        {task.assignee && (
          <div className="flex items-center justify-start mb-2">
            <Avatar className="w-5 h-5">
              <AvatarImage
                src={`https://avatar.vercel.sh/${task.assignee.email}`}
              />
              <AvatarFallback className="text-xs">
                {task.assignee.firstName[0]}
                {task.assignee.lastName[0]}
              </AvatarFallback>
            </Avatar>
          </div>
        )}

        {/* --- Badge Section --- */}
        <div className="mt-2 pt-2 border-t">
          {groupBy === 'status' && (
            <Badge
              className={cn(
                'text-xs font-medium capitalize rounded-full px-2.5 py-0.5',
                priorityClass
              )}
            >
              {task.priority}
            </Badge>
          )}

          {groupBy === 'priority' && (
            <Badge
              className={cn(
                'text-xs font-medium capitalize rounded-full px-2.5 py-0.5',
                statusClass
              )}
            >
              {task.status.replace('_', ' ')}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
