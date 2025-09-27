import { WorkspaceForm } from "@/app/workspaces/create-workspace-modal"
import { REACT_QUERY_KEYS } from "@/lib/consts"
import { apiClient } from "@/services/api"
import { Workspace } from "@/types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export const useGetWorkspacesQuery = () => {
    return useQuery({
        queryKey: [REACT_QUERY_KEYS.WORKSPACES],
        queryFn: async () => apiClient.get<Workspace[]>("/workspaces")
    })
}

export const useGetWorkspaceByIdQuery = (id: string) => {
    return useQuery({
        queryKey: [REACT_QUERY_KEYS.WORKSPACES, id],
        queryFn: async () => apiClient.get<Workspace>(`/workspaces/${id}`),
        enabled: !!id
    })
}

export const useCreateWorkspace = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: [REACT_QUERY_KEYS.WORKSPACES],
        mutationFn: async (data: WorkspaceForm) => {
            return apiClient.post<Workspace>("/workspaces", data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [REACT_QUERY_KEYS.WORKSPACES] })
        }
    })
}