import { TeamForm } from '@/components/team/create-team-modal';
import { REACT_QUERY_KEYS } from '@/lib/consts';
import { apiClient } from '@/services/api';
import { Team } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useGetTeamsByWorkspaceQuery = (workspaceId: string) => {
  return useQuery({
    queryKey: [
      REACT_QUERY_KEYS.TEAMS,
      REACT_QUERY_KEYS.WORKSPACES,
      workspaceId,
    ],
    queryFn: async () =>
      apiClient.get<Team[]>(`/workspaces/${workspaceId}/teams`),
    enabled: !!workspaceId,
  });
};

export const useCreateTeamMutation = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [
      REACT_QUERY_KEYS.TEAMS,
      REACT_QUERY_KEYS.WORKSPACES,
      workspaceId,
    ],
    mutationFn: async (data: TeamForm) => {
      return apiClient.post<Team>(`/workspaces/${workspaceId}/teams`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          REACT_QUERY_KEYS.TEAMS,
          REACT_QUERY_KEYS.WORKSPACES,
          workspaceId,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.WORKSPACES, workspaceId],
      });
    },
  });
};

export const useDeleteTeamMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [REACT_QUERY_KEYS.TEAMS],
    mutationFn: async (teamId: string) => {
      return apiClient.delete(`/teams/${teamId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.TEAMS],
      });
      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.WORKSPACES],
      });
    },
  });
};
