'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { REACT_QUERY_KEYS } from '@/lib/consts';
import { Group } from '@/types';

export const useGetGroupsByBoardQuery = (boardId: string) => {
  return useQuery({
    queryKey: [REACT_QUERY_KEYS.GROUPS, boardId],
    queryFn: async () => apiClient.get<Group[]>(`/groups?boardId=${boardId}`),
    enabled: !!boardId,
  });
};

export const useGetGroupByIdQuery = (groupId: string) => {
  return useQuery({
    queryKey: [REACT_QUERY_KEYS.GROUPS, groupId],
    queryFn: async () => apiClient.get<Group>(`/groups/${groupId}`),
    enabled: !!groupId,
  });
};

export interface CreateGroupDto {
  name: string;
  description?: string;
  groupType?: 'status' | 'priority' | 'category' | 'custom';
  color?: string;
  boardId: string;
  position?: number;
}

export const useCreateGroupMutation = (boardId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [REACT_QUERY_KEYS.GROUPS, boardId],
    mutationFn: async (data: CreateGroupDto) =>
      apiClient.post<Group>('/groups', data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.GROUPS, boardId],
      });
    },
  });
};

export interface UpdateGroupDto {
  name?: string;
  description?: string;
  groupType?: 'status' | 'priority' | 'category' | 'custom';
  color?: string;
  position?: number;
  isCollapsed?: boolean;
}

export const useUpdateGroupMutation = (groupId: string, boardId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [REACT_QUERY_KEYS.GROUPS, groupId],
    mutationFn: async (data: UpdateGroupDto) =>
      apiClient.patch<Group>(`/groups/${groupId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.GROUPS, boardId],
      });
      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.GROUPS, groupId],
      });
    },
  });
};

export const useDeleteGroupMutation = (boardId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [REACT_QUERY_KEYS.GROUPS],
    mutationFn: async (groupId: string) =>
      apiClient.delete(`/groups/${groupId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.GROUPS, boardId],
      });
    },
  });
};

export interface ReorderGroupsDto {
  groups: Array<{
    id: string;
    position: number;
  }>;
}

export const useReorderGroupsMutation = (boardId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [REACT_QUERY_KEYS.GROUPS, boardId, 'reorder'],
    mutationFn: async (data: ReorderGroupsDto) =>
      apiClient.post<Group[]>(`/groups/reorder?boardId=${boardId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.GROUPS, boardId],
      });
    },
  });
};

export const useCreateDefaultGroupsMutation = (boardId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [REACT_QUERY_KEYS.GROUPS, boardId, 'default'],
    mutationFn: async () =>
      apiClient.post<Group[]>(`/groups/default?boardId=${boardId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.GROUPS, boardId],
      });
    },
  });
};
