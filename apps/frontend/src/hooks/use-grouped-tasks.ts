import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { REACT_QUERY_KEYS } from '@/lib/consts';
import { Task } from '@/types';

export interface GroupedTasksResponseEntry {
  color: string;
  tasks: Task[];
}

export type GroupedTasksResponse = Record<string, GroupedTasksResponseEntry>;

export const useGetGroupedTasksByBoardQuery = (
  boardId: string,
  groupBy: 'status' | 'priority' = 'status'
) => {
  return useQuery<GroupedTasksResponse>({
    queryKey: [REACT_QUERY_KEYS.TASKS, 'grouped', boardId, groupBy],
    queryFn: async (): Promise<GroupedTasksResponse> => {
      return await apiClient.get<GroupedTasksResponse>(
        `/tasks?boardId=${boardId}&groupBy=${groupBy}`
      );
    },
    enabled: !!boardId,
  });
};
