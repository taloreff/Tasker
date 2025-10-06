'use client';

import { useCallback, useRef, useState } from 'react';
import {
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { Task, Group, TaskPriority, TaskStatus } from '@/types';
import { GroupedTasksResponse } from './use-grouped-tasks';

export type GroupBy = 'status' | 'priority' | 'group';

type UpdateTaskStatusMut = {
  mutate: (vars: {
    taskId: string;
    status: TaskStatus | string;
    boardId: string;
  }) => void;
};

type UpdateTaskPriorityMut = {
  mutate: (vars: {
    taskId: string;
    priority: TaskPriority | string;
    boardId: string;
  }) => void;
};

type MoveTaskPositionMut = {
  mutate: (vars: {
    taskId: string;
    newPosition: number;
    boardId: string;
    groupId?: string;
  }) => void;
};

interface UseKanbanDnDArgs {
  boardId: string;
  groupBy: GroupBy;
  groupedTasksData: GroupedTasksResponse;
  groups?: Group[];
  flatTasks: Task[];
  updateTaskStatus: UpdateTaskStatusMut;
  updateTaskPriority: UpdateTaskPriorityMut;
  moveTaskPosition: MoveTaskPositionMut;
}

export function useKanbanDnD({
  boardId,
  groupBy,
  groupedTasksData,
  groups = [],
  flatTasks,
  updateTaskStatus,
  updateTaskPriority,
  moveTaskPosition,
}: UseKanbanDnDArgs) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const overIdRef = useRef<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const getColumnValues = useCallback(() => {
    if (groupBy === 'group') {
      return groups.map((g) => `group-${g.id}`);
    }
    return Object.keys(groupedTasksData);
  }, [groupBy, groups, groupedTasksData]);

  const getTasksByColumn = useCallback(
    (columnKey: string) => {
      if (groupBy !== 'group') {
        return groupedTasksData[columnKey]?.tasks ?? [];
      }
      const isGroupKey = columnKey.startsWith('group-');
      if (!isGroupKey) return [];
      const groupId = columnKey.slice('group-'.length);
      return flatTasks.filter((t) => t.groupId === groupId);
    },
    [groupBy, groupedTasksData, flatTasks]
  );

  const getAllTasks = useCallback(() => {
    if (groupBy === 'group') {
      return flatTasks;
    }
    const all: Task[] = [];
    Object.values(groupedTasksData).forEach((group) =>
      all.push(...(group?.tasks ?? []))
    );
    return all;
  }, [groupBy, groupedTasksData, flatTasks]);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      setActiveId(String(active.id));
      const all = getAllTasks();
      const t = all.find((x) => x.id === active.id);
      setDraggedTask(t || null);
    },
    [getAllTasks]
  );

  const handleDragOver = useCallback((event: any) => {
    const newId = event.over?.id ? String(event.over.id) : null;
    if (overIdRef.current !== newId) {
      overIdRef.current = newId;
      setOverId(newId);
    }
  }, []);

  const computeSorted = useCallback((tasks: Task[]) => {
    const sorted = [...tasks].sort((a, b) => {
      if (a.position !== b.position) return a.position - b.position;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
    return sorted;
  }, []);

  const lastPositionPlusOne = useCallback(
    (tasks: Task[]) => {
      const sorted = computeSorted(tasks);
      if (sorted.length === 0) return 0;
      return sorted[sorted.length - 1].position + 1;
    },
    [computeSorted]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);
      setDraggedTask(null);

      if (!over || !active) return;

      const all = getAllTasks();
      const activeTaskId = String(active.id);
      const activeTask = all.find((t) => t.id === activeTaskId);
      if (!activeTask) return;

      if (groupBy === 'group') {
        if (String(over.id).startsWith('column-group-')) {
          const targetGroupId = String(over.id).replace('column-group-', '');
          if (targetGroupId !== (activeTask.groupId ?? undefined)) {
            const targetTasks = flatTasks.filter(
              (t) => t.groupId === targetGroupId
            );
            const newPosition = lastPositionPlusOne(targetTasks);
            moveTaskPosition.mutate({
              taskId: activeTaskId,
              newPosition,
              boardId,
              groupId: targetGroupId,
            });
          }
          return;
        }

        const overTaskId = String(over.id);
        const overTask = all.find((t) => t.id === overTaskId);
        if (!overTask || activeTask.id === overTask.id) return;

        const fromGroupId = activeTask.groupId ?? null;
        const toGroupId = overTask.groupId ?? null;

        if (fromGroupId !== toGroupId) {
          const targetTasks = flatTasks.filter((t) => t.groupId === toGroupId);
          const sortedTarget = computeSorted(targetTasks);
          const overIndex = sortedTarget.findIndex((t) => t.id === overTask.id);

          let newPosition: number;
          if (overIndex === -1) {
            newPosition = lastPositionPlusOne(sortedTarget);
          } else if (overIndex === sortedTarget.length - 1) {
            newPosition = sortedTarget[overIndex].position + 1;
          } else {
            const next = sortedTarget[overIndex + 1];
            newPosition =
              (sortedTarget[overIndex].position + next.position) / 2;
          }

          moveTaskPosition.mutate({
            taskId: activeTaskId,
            newPosition,
            boardId,
            groupId: toGroupId || undefined,
          });
          return;
        }

        const columnKey = `group-${fromGroupId ?? ''}`;
        const columnTasks = getTasksByColumn(columnKey);
        const sorted = computeSorted(columnTasks);
        const activeIndex = sorted.findIndex((t) => t.id === activeTask.id);
        const overIndex = sorted.findIndex((t) => t.id === overTask.id);
        if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex)
          return;

        let newPosition: number;
        if (activeIndex < overIndex) {
          if (overIndex === sorted.length - 1) {
            newPosition = sorted[overIndex].position + 1;
          } else {
            const next = sorted[overIndex + 1];
            newPosition = (sorted[overIndex].position + next.position) / 2;
          }
        } else {
          if (overIndex === 0) {
            newPosition = Math.max(0, sorted[0].position - 1);
          } else {
            const prev = sorted[overIndex - 1];
            newPosition = (prev.position + sorted[overIndex].position) / 2;
          }
        }

        moveTaskPosition.mutate({
          taskId: activeTaskId,
          newPosition,
          boardId,
          groupId: fromGroupId || undefined,
        });
        return;
      }

      if (String(over.id).startsWith('column-')) {
        const newColumnValue = String(over.id).replace('column-', '');
        const currentColumnValue =
          groupBy === 'status' ? activeTask.status : activeTask.priority;

        if (newColumnValue !== currentColumnValue) {
          if (groupBy === 'status') {
            updateTaskStatus.mutate({
              taskId: activeTaskId,
              status: newColumnValue,
              boardId,
            });
          } else {
            updateTaskPriority.mutate({
              taskId: activeTaskId,
              priority: newColumnValue,
              boardId,
            });
          }
        }
        return;
      }

      const overTaskId = String(over.id);
      const overTask = all.find((t) => t.id === overTaskId);
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
            boardId,
          });
        } else {
          updateTaskPriority.mutate({
            taskId: activeTaskId,
            priority: overColumnValue,
            boardId,
          });
        }
        return;
      }

      const columnTasks = getTasksByColumn(activeColumnValue);
      const sorted = computeSorted(columnTasks);

      const activeIndex = sorted.findIndex((t) => t.id === activeTask.id);
      const overIndex = sorted.findIndex((t) => t.id === overTask.id);
      if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex)
        return;

      let newPosition: number;
      if (activeIndex < overIndex) {
        if (overIndex === sorted.length - 1) {
          newPosition = sorted[overIndex].position + 1;
        } else {
          const next = sorted[overIndex + 1];
          newPosition = (sorted[overIndex].position + next.position) / 2;
        }
      } else {
        if (overIndex === 0) {
          newPosition = Math.max(0, sorted[0].position - 1);
        } else {
          const prev = sorted[overIndex - 1];
          newPosition = (prev.position + sorted[overIndex].position) / 2;
        }
      }

      moveTaskPosition.mutate({
        taskId: activeTaskId,
        newPosition,
        boardId,
      });
    },
    [
      boardId,
      groupBy,
      getAllTasks,
      getTasksByColumn,
      computeSorted,
      lastPositionPlusOne,
      flatTasks,
      moveTaskPosition,
      updateTaskPriority,
      updateTaskStatus,
    ]
  );

  const getColumnLabel = useCallback(
    (key: string) => {
      if (groupBy === 'group') {
        const isGroupKey = key.startsWith('group-');
        if (!isGroupKey) return key;
        const gid = key.slice('group-'.length);
        const g = groups.find((x) => x.id === gid);
        return g?.name ?? 'Unassigned';
      }
      return key.replace('_', ' ');
    },
    [groupBy, groups]
  );

  return {
    sensors,
    activeId,
    draggedTask,
    overId,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    getColumnValues,
    getTasksByColumn,
    getColumnLabel,
  };
}
