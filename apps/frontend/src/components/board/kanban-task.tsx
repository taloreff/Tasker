'use client';

import { useSortable, defaultAnimateLayoutChanges } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Flag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { priorityColors, statusColors, statusIcons } from '@/lib/consts';
import { Task } from '@/types';

interface KanbanTaskProps {
  task: Task;
  isDragged?: boolean;
}

function animateLayoutChanges(args: any) {
  const { isSorting, wasDragging } = args;
  if (isSorting || wasDragging) return defaultAnimateLayoutChanges(args);
  return true;
}

export function KanbanTask({ task, isDragged = false }: KanbanTaskProps) {
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
          {task.priority !== 'medium' && (
            <Flag
              className={cn(
                'w-3 h-3 flex-shrink-0',
                priorityColors[task.priority]
              )}
            />
          )}
        </div>

        {task.description && (
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <Badge
            variant="outline"
            className={cn('text-xs', statusColors[task.status])}
          >
            <StatusIcon className="w-3 h-3 mr-1" />
            {task.status.replace('_', ' ')}
          </Badge>

          {task.assignee && (
            <Avatar className="w-5 h-5">
              <AvatarImage
                src={`https://avatar.vercel.sh/${task.assignee.email}`}
              />
              <AvatarFallback className="text-xs">
                {task.assignee.firstName[0]}
                {task.assignee.lastName[0]}
              </AvatarFallback>
            </Avatar>
          )}
        </div>

        {task.priority === 'urgent' && (
          <div className="mt-2 pt-2 border-t">
            <Badge variant="destructive" className="text-xs">
              Urgent
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
