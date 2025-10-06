import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { REACT_QUERY_KEYS } from '@/lib/consts';
import { Task } from '@/types';

type GroupedTasks = Record<string, Task[]>;

export const useGetGroupedTasksByBoardQuery = (boardId: string, groupBy: 'status' | 'priority' = 'status') => {
  return useQuery({
    queryKey: [REACT_QUERY_KEYS.TASKS, 'grouped', boardId],
    queryFn: async (): Promise<GroupedTasks> => {
      return apiClient.get<GroupedTasks>(`/tasks?boardId=${boardId}&groupBy=${groupBy}`);
    },
    enabled: !!boardId,
  });
};