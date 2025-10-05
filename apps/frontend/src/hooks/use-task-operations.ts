import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Task } from '@/types';
import { apiClient } from '@/services/api';
import { REACT_QUERY_KEYS } from '@/lib/consts';

interface UpdateTaskStatusData {
  taskId: string;
  status: string;
  boardId: string;
}

interface UpdateTaskPriorityData {
  taskId: string;
  priority: string;
  boardId: string;
}

interface MoveTaskPositionData {
  taskId: string;
  newPosition: number;
  boardId: string;
  groupId?: string;
}

export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, status }: UpdateTaskStatusData) => {
      return apiClient.patch<Task>(`/tasks/${taskId}`, { status });
    },
    onSuccess: (_, { boardId }) => {
      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.TASKS, 'board', boardId],
      });
      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.TASKS, 'group', boardId],
      });
      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.TASKS, 'grouped', boardId],
      });
    },
  });
};

export const useUpdateTaskPriority = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, priority }: UpdateTaskPriorityData) => {
      return apiClient.patch<Task>(`/tasks/${taskId}`, { priority });
    },
    onSuccess: (_, { boardId }) => {
      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.TASKS, 'board', boardId],
      });
      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.TASKS, 'group', boardId],
      });
      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.TASKS, 'grouped', boardId],
      });
    },
  });
};

export const useMoveTaskPosition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      newPosition,
      groupId,
    }: MoveTaskPositionData) => {
      return apiClient.post<Task>(`/tasks/${taskId}/move`, {
        position: newPosition,
        groupId,
      });
    },
    onSuccess: (_, { boardId }) => {
      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.TASKS, 'board', boardId],
      });
      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.TASKS, 'grouped', boardId],
      });
    },
  });
};
