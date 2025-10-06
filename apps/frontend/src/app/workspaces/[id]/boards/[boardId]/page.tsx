'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { motion } from 'framer-motion';

import { useGetBoardByIdQuery } from '@/hooks/use-board';
import { useGetGroupedTasksByBoardQuery } from '@/hooks/use-grouped-tasks';
import { useGetGroupsByBoardQuery } from '@/hooks/use-group';
import {
  useMoveTaskPosition,
  useUpdateTaskPriority,
  useUpdateTaskStatus,
} from '@/hooks/use-task-operations';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader } from '@/components/loader';
import { Plus, Settings, Filter, ArrowUpDown, Users } from 'lucide-react';

import { CreateGroupModal } from '@/components/board/create-group-modal';
import { CreateTaskModal } from '@/components/board/create-task-modal';
import { KanbanTask } from '@/components/board/kanban-task';
import { useKanbanDnD, GroupBy } from '@/hooks/use-kanban-dnd';
import { DroppableColumn } from '@/components/board/kanban-droppable-column';
import { Task } from '@/types';

export default function BoardDetailPage() {
  const params = useParams();
  const boardId = params.boardId as string;

  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [groupBy, setGroupBy] = useState<GroupBy>('status');

  const { data: board, isLoading: isBoardLoading } =
    useGetBoardByIdQuery(boardId);

  const { data: groupedTasksData, isLoading: isTasksLoadingGrouped } =
    useGetGroupedTasksByBoardQuery(
      boardId,
      groupBy === 'group' ? 'status' : groupBy
    );

  const { data: groups = [] } = useGetGroupsByBoardQuery(
    groupBy === 'group' ? boardId : ''
  );

  const updateTaskStatus = useUpdateTaskStatus();
  const updateTaskPriority = useUpdateTaskPriority();
  const moveTaskPosition = useMoveTaskPosition();

  const flatTasks: Task[] = useMemo(() => {
    const data = groupedTasksData ?? {};
    return Object.values(data).flat() as Task[];
  }, [groupedTasksData]);

  const {
    sensors,
    draggedTask,
    overId,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    getColumnValues,
    getTasksByColumn,
    getColumnLabel,
  } = useKanbanDnD({
    boardId,
    groupBy,
    groupedTasksData: groupedTasksData ?? {},
    groups,
    flatTasks,
    updateTaskStatus,
    updateTaskPriority,
    moveTaskPosition,
  });

  const columnValues = useMemo(() => getColumnValues(), [getColumnValues]);

  const handleCreateTask = useCallback(
    (columnKey: string) => {
      if (groupBy === 'group') {
        const groupId = columnKey.replace('group-', '');
        setSelectedGroupId(groupId);
      } else {
        setSelectedGroupId(columnKey);
      }
      setIsCreateTaskModalOpen(true);
    },
    [groupBy]
  );

  if (isBoardLoading || isTasksLoadingGrouped) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!board) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Board not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full overflow-x-clip overflow-y-hidden">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-shrink-0">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div
                className="w-6 h-6 rounded-md"
                style={{ backgroundColor: board?.color }}
              />
              <h1 className="text-2xl font-bold">{board?.name}</h1>
            </div>
            {board?.description && (
              <p className="text-muted-foreground">{board?.description}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" /> Filter
            </Button>
            <Button variant="outline" size="sm">
              <ArrowUpDown className="w-4 h-4 mr-2" /> Sort
            </Button>
            <Button variant="outline" size="sm">
              <Users className="w-4 h-4 mr-2" /> Share
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" /> Settings
            </Button>
            <Button onClick={() => setIsCreateGroupModalOpen(true)} size="sm">
              <Plus className="w-4 h-4 mr-2" /> Add Group
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b p-4 bg-background/95 backdrop-blur flex-shrink-0">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium">Group by:</span>
            <Select
              value={groupBy}
              onValueChange={(v: GroupBy) => setGroupBy(v)}
            >
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="group">Groups (custom)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="w-full h-full overflow-x-auto overflow-y-hidden overscroll-x-contain">
              <div className="flex min-w-max gap-6 p-6">
                {columnValues.map((columnKey) => {
                  const columnTasks = getTasksByColumn(columnKey);
                  return (
                    <DroppableColumn key={columnKey} columnValue={columnKey}>
                      <div className="flex-shrink-0 w-80 h-full">
                        <Card className="h-full flex flex-col">
                          <CardHeader className="pb-3 flex-shrink-0">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-sm font-semibold capitalize">
                                {getColumnLabel(columnKey)}
                              </CardTitle>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                                  {columnTasks.length}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCreateTask(columnKey)}
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>

                          <CardContent className="px-2 pb-3 flex-1 relative">
                            <div className="max-h-[calc(100vh-320px)] overflow-y-auto pr-1 pb-8 custom-scrollbar scroll-smooth">
                              <div className="space-y-2 relative min-h-[60px]">
                                {columnTasks.map((task) => (
                                  <KanbanTask
                                    key={task.id}
                                    task={task}
                                    isDragged={draggedTask?.id === task.id}
                                  />
                                ))}

                                {draggedTask &&
                                  overId === `column-${columnKey}` && (
                                    <motion.div
                                      layout
                                      initial={{ opacity: 0, scale: 0.95 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      exit={{ opacity: 0, scale: 0.95 }}
                                      transition={{ duration: 0.15 }}
                                      className="border-2 border-dashed border-primary/40 rounded-md py-4 text-center text-xs text-muted-foreground"
                                    >
                                      Drop here
                                    </motion.div>
                                  )}
                              </div>
                            </div>

                            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-background to-transparent" />
                          </CardContent>
                        </Card>
                      </div>
                    </DroppableColumn>
                  );
                })}
              </div>
            </div>

            <DragOverlay>
              {draggedTask && (
                <motion.div
                  layout
                  initial={{ scale: 0.95, rotate: 0 }}
                  animate={{ scale: 1.05, rotate: 3 }}
                  exit={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <KanbanTask task={draggedTask} isDragged />
                </motion.div>
              )}
            </DragOverlay>
          </DndContext>
        </div>
      </div>

      <CreateGroupModal
        boardId={boardId}
        isOpen={isCreateGroupModalOpen}
        setOpen={setIsCreateGroupModalOpen}
      />
      <CreateTaskModal
        groupId={selectedGroupId || ''}
        boardId={boardId}
        isOpen={isCreateTaskModalOpen}
        setOpen={setIsCreateTaskModalOpen}
      />
    </div>
  );
}
