'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { useGetBoardByIdQuery } from '@/hooks/use-board';
import { useGetGroupedTasksByBoardQuery } from '@/hooks/use-grouped-tasks';
import {
  useUpdateTaskStatus,
  useUpdateTaskPriority,
  useMoveTaskPosition,
} from '@/hooks/use-task-operations';
import { Loader } from '@/components/loader';
import { Button } from '@/components/ui/button';
import { Plus, Settings, Filter, ArrowUpDown, Users } from 'lucide-react';
import { KanbanTask } from '@/components/board/kanban-task';
import { CreateGroupModal } from '@/components/board/create-group-modal';
import { CreateTaskModal } from '@/components/board/create-task-modal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Task } from '@/types';

const DroppableColumn = React.memo(function DroppableColumn({
  columnValue,
  children,
}: {
  columnValue: string;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${columnValue}`,
  });

  return (
    <div
      ref={setNodeRef}
      className={`h-full flex flex-col transition-all duration-150 ${
        isOver
          ? 'bg-primary/5 border border-primary/20 rounded-lg shadow-inner'
          : ''
      }`}
    >
      {children}
    </div>
  );
});

export default function BoardDetailPage() {
  const params = useParams();

  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [groupBy, setGroupBy] = useState<'status' | 'priority'>('status');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedTaskData, setDraggedTaskData] = useState<Task | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const overIdRef = useRef<string | null>(null);

  const { data: boardData, isLoading: isBoardLoading } = useGetBoardByIdQuery(
    params.boardId as string
  );
  const { data: groupedTasksData, isLoading: isTasksLoading } =
    useGetGroupedTasksByBoardQuery(params.boardId as string, groupBy);

  const updateTaskStatus = useUpdateTaskStatus();
  const updateTaskPriority = useUpdateTaskPriority();
  const moveTaskPosition = useMoveTaskPosition();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const board = boardData;

  const getColumnValues = useCallback(() => {
    if (!groupedTasksData || typeof groupedTasksData !== 'object') return [];
    return Object.keys(groupedTasksData);
  }, [groupedTasksData]);

  const getTasksByColumn = useCallback(
    (columnValue: string) => {
      if (!groupedTasksData || typeof groupedTasksData !== 'object') return [];
      const tasks = groupedTasksData[columnValue];
      return Array.isArray(tasks) ? tasks : [];
    },
    [groupedTasksData]
  );

  const getAllTasks = useCallback(() => {
    if (!groupedTasksData || typeof groupedTasksData !== 'object') return [];
    const allTasks: Task[] = [];
    Object.values(groupedTasksData).forEach((tasks) => {
      if (Array.isArray(tasks)) allTasks.push(...tasks);
    });
    return allTasks;
  }, [groupedTasksData]);

  const handleCreateTask = (columnValue: string) => {
    setSelectedGroupId(columnValue);
    setIsCreateTaskModalOpen(true);
  };

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      setActiveId(active.id as string);
      const allTasks = getAllTasks();
      const draggedTask = allTasks.find((task) => task.id === active.id);
      setDraggedTaskData(draggedTask || null);
    },
    [getAllTasks]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);
      setDraggedTaskData(null);

      if (!over || !active) return;

      const allTasks = getAllTasks();
      const activeTaskId = active.id as string;
      const activeTask = allTasks.find((task) => task.id === activeTaskId);
      if (!activeTask) return;

      if (over.id.toString().startsWith('column-')) {
        const newColumnValue = over.id.toString().replace('column-', '');
        const currentColumnValue =
          groupBy === 'status' ? activeTask.status : activeTask.priority;

        if (newColumnValue !== currentColumnValue) {
          if (groupBy === 'status') {
            updateTaskStatus.mutate({
              taskId: activeTaskId,
              status: newColumnValue,
              boardId: params.boardId as string,
            });
          } else {
            updateTaskPriority.mutate({
              taskId: activeTaskId,
              priority: newColumnValue,
              boardId: params.boardId as string,
            });
          }
        }
        return;
      }

      const overTaskId = over.id as string;
      const overTask = allTasks.find((task) => task.id === overTaskId);
      if (!overTask || activeTask.id === overTask.id) return;

      const activeColumnValue =
        groupBy === 'status' ? activeTask.status : activeTask.priority;
      const overColumnValue =
        groupBy === 'status' ? overTask.status : overTask.priority;

      if (activeColumnValue !== overColumnValue) {
        if (groupBy === 'status') {
          updateTaskStatus.mutate({
            taskId: activeTaskId,
            status: overColumnValue,
            boardId: params.boardId as string,
          });
        } else {
          updateTaskPriority.mutate({
            taskId: activeTaskId,
            priority: overColumnValue,
            boardId: params.boardId as string,
          });
        }
        return;
      }

      const columnTasks = getTasksByColumn(activeColumnValue);
      const sortedColumnTasks = [...columnTasks].sort((a, b) => {
        if (a.position !== b.position) return a.position - b.position;
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });

      const activeIndex = sortedColumnTasks.findIndex(
        (task) => task.id === activeTask.id
      );
      const overIndex = sortedColumnTasks.findIndex(
        (task) => task.id === overTask.id
      );

      if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex)
        return;

      let newPosition: number;
      if (activeIndex < overIndex) {
        if (overIndex === sortedColumnTasks.length - 1) {
          newPosition = sortedColumnTasks[overIndex].position + 1;
        } else {
          const nextTask = sortedColumnTasks[overIndex + 1];
          newPosition =
            (sortedColumnTasks[overIndex].position + nextTask.position) / 2;
        }
      } else {
        if (overIndex === 0) {
          newPosition = Math.max(0, sortedColumnTasks[0].position - 1);
        } else {
          const prevTask = sortedColumnTasks[overIndex - 1];
          newPosition =
            (prevTask.position + sortedColumnTasks[overIndex].position) / 2;
        }
      }

      moveTaskPosition.mutate({
        taskId: activeTaskId,
        newPosition,
        boardId: params.boardId as string,
      });
    },
    [
      getAllTasks,
      getTasksByColumn,
      groupBy,
      moveTaskPosition,
      updateTaskStatus,
      updateTaskPriority,
      params.boardId,
    ]
  );

  const handleDragOver = useCallback((event: any) => {
    const newId = event.over?.id ? String(event.over.id) : null;
    if (overIdRef.current !== newId) {
      overIdRef.current = newId;
      setOverId(newId);
    }
  }, []);

  const columnValues = getColumnValues();

  if (isBoardLoading || isTasksLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!boardData) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Board not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full overflow-x-clip overflow-y-hidden">
      {/* Header */}
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

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Group By */}
        <div className="border-b p-4 bg-background/95 backdrop-blur flex-shrink-0">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium">Group by:</span>
            <Select
              value={groupBy}
              onValueChange={(value: 'status' | 'priority') => setGroupBy(value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
          >
            <div className="w-full h-full overflow-x-auto overflow-y-hidden overscroll-x-contain">
              <div className="flex min-w-max gap-6 p-6">
                {columnValues.map((columnValue) => {
                  const columnTasks = getTasksByColumn(columnValue);
                  return (
                    <DroppableColumn
                      key={columnValue}
                      columnValue={columnValue}
                    >
                      <div className="flex-shrink-0 w-80 h-full">
                        <Card className="h-full flex flex-col">
                          <CardHeader className="pb-3 flex-shrink-0">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-sm font-semibold capitalize">
                                {columnValue.replace('_', ' ')}
                              </CardTitle>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                                  {columnTasks.length}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCreateTask(columnValue)}
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="flex-1 overflow-y-auto">
                            <SortableContext
                              items={columnTasks.map((task) => task.id)}
                              strategy={verticalListSortingStrategy}
                            >
                              <div className="space-y-2 relative">
                                {columnTasks.map((task) => (
                                  <KanbanTask
                                    key={task.id}
                                    task={task}
                                    isDragged={activeId === task.id}
                                  />
                                ))}
                                {activeId &&
                                  overId === `column-${columnValue}` && (
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
                            </SortableContext>
                          </CardContent>
                        </Card>
                      </div>
                    </DroppableColumn>
                  );
                })}
              </div>
            </div>

            <DragOverlay>
              {activeId && draggedTaskData && (
                <motion.div
                  layout
                  initial={{ scale: 0.95, rotate: 0 }}
                  animate={{ scale: 1.05, rotate: 3 }}
                  exit={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <KanbanTask task={draggedTaskData} isDragged />
                </motion.div>
              )}
            </DragOverlay>
          </DndContext>
        </div>
      </div>

      {/* Modals */}
      <CreateGroupModal
        boardId={params.boardId as string}
        isOpen={isCreateGroupModalOpen}
        setOpen={setIsCreateGroupModalOpen}
      />
      <CreateTaskModal
        groupId={selectedGroupId || ''}
        boardId={params.boardId as string}
        isOpen={isCreateTaskModalOpen}
        setOpen={setIsCreateTaskModalOpen}
      />
    </div>
  );
}
