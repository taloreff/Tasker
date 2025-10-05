import { REACT_QUERY_KEYS } from '@/lib/consts';
import { apiClient } from '@/services/api';
import { Board } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';



export interface CreateBoardDto {
  name: string;
  description?: string;
  color?: string;
  workspaceId: string;
}

export interface UpdateBoardDto {
  name?: string;
  description?: string;
  color?: string;
}

export const useGetBoardsByWorkspaceQuery = (workspaceId: string) => {
  return useQuery({
    queryKey: [REACT_QUERY_KEYS.BOARDS, REACT_QUERY_KEYS.WORKSPACES, workspaceId],
    queryFn: async () => apiClient.get<Board[]>(`/boards?workspaceId=${workspaceId}`),
    enabled: !!workspaceId,
  });
};

export const useGetBoardByIdQuery = (boardId: string) => {
  return useQuery({
    queryKey: [REACT_QUERY_KEYS.BOARDS, boardId],
    queryFn: async () => apiClient.get<Board>(`/boards/${boardId}`),
    enabled: !!boardId,
  });
};

export const useCreateBoardMutation = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [REACT_QUERY_KEYS.BOARDS, REACT_QUERY_KEYS.WORKSPACES, workspaceId],
    mutationFn: async (data: CreateBoardDto) => {
      return apiClient.post<Board>('/boards', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.BOARDS, REACT_QUERY_KEYS.WORKSPACES, workspaceId],
      });
    },
  });
};

export const useUpdateBoardMutation = (boardId: string, workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [REACT_QUERY_KEYS.BOARDS, boardId],
    mutationFn: async (data: UpdateBoardDto) => {
      return apiClient.patch<Board>(`/boards/${boardId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.BOARDS, boardId],
      });
      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.BOARDS, REACT_QUERY_KEYS.WORKSPACES, workspaceId],
      });
    },
  });
};

export const useDeleteBoardMutation = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [REACT_QUERY_KEYS.BOARDS],
    mutationFn: async (boardId: string) => {
      return apiClient.delete(`/boards/${boardId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.BOARDS, REACT_QUERY_KEYS.WORKSPACES, workspaceId],
      });
    },
  });
};