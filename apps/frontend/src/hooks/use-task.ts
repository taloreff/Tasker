'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { REACT_QUERY_KEYS } from '@/lib/consts';
import { Task } from '@/types';

export interface CreateTaskDto {
  name: string;
  description?: string;
  status?: 'todo' | 'in_progress' | 'review' | 'done' | 'blocked' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  groupId: string;
  boardId: string;
  assigneeId?: string;
  position?: number;
}

export interface UpdateTaskDto {
  name?: string;
  description?: string;
  status?: 'todo' | 'in_progress' | 'review' | 'done' | 'blocked' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assigneeId?: string;
  position?: number;
}

export interface MoveTaskDto {
  groupId: string;
  position: number;
}

export const useGetTasksByBoardQuery = (boardId: string) => {
  return useQuery({
    queryKey: [REACT_QUERY_KEYS.TASKS, 'board', boardId],
    queryFn: async () => apiClient.get<Task[]>(`/tasks?boardId=${boardId}`),
    enabled: !!boardId,
  });
};

export const useGetTasksByGroupQuery = (groupId: string) => {
  return useQuery({
    queryKey: [REACT_QUERY_KEYS.TASKS, 'group', groupId],
    queryFn: async () => apiClient.get<Task[]>(`/tasks?columnId=${groupId}`),
    enabled: !!groupId,
  });
};

export const useGetTaskByIdQuery = (taskId: string) => {
  return useQuery({
    queryKey: [REACT_QUERY_KEYS.TASKS, taskId],
    queryFn: async () => apiClient.get<Task>(`/tasks/${taskId}`),
    enabled: !!taskId,
  });
};

export const useCreateTaskMutation = (groupId: string, boardId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [REACT_QUERY_KEYS.TASKS, groupId],
    mutationFn: async (data: CreateTaskDto) => {
      return apiClient.post<Task>('/tasks', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.TASKS, 'group', groupId],
      });
      if (boardId) {
        queryClient.invalidateQueries({
          queryKey: [REACT_QUERY_KEYS.TASKS, 'board', boardId],
        });
        queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.TASKS, 'grouped', boardId],
      });
      }
    },
  });
};

export const useUpdateTaskMutation = (taskId: string, groupId: string, boardId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [REACT_QUERY_KEYS.TASKS, taskId],
    mutationFn: async (data: UpdateTaskDto) => {
      return apiClient.patch<Task>(`/tasks/${taskId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.TASKS, taskId],
      });
      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.TASKS, 'group', groupId],
      });
      if (boardId) {
        queryClient.invalidateQueries({
          queryKey: [REACT_QUERY_KEYS.TASKS, 'board', boardId],
        });
      }
    },
  });
};

export const useMoveTaskMutation = (taskId: string, fromGroupId: string, boardId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [REACT_QUERY_KEYS.TASKS, taskId, 'move'],
    mutationFn: async (data: MoveTaskDto) => {
      return apiClient.patch<Task>(`/tasks/${taskId}/move`, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.TASKS, 'group', fromGroupId],
      });
      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.TASKS, 'group', variables.groupId],
      });
      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.TASKS, taskId],
      });
      if (boardId) {
        queryClient.invalidateQueries({
          queryKey: [REACT_QUERY_KEYS.TASKS, 'board', boardId],
        });
      }
    },
  });
};

export const useDeleteTaskMutation = (groupId: string, boardId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [REACT_QUERY_KEYS.TASKS],
    mutationFn: async (taskId: string) => {
      return apiClient.delete(`/tasks/${taskId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.TASKS, 'group', groupId],
      });
      if (boardId) {
        queryClient.invalidateQueries({
          queryKey: [REACT_QUERY_KEYS.TASKS, 'board', boardId],
        });
      }
    },
  });
};