'use client';

import { useParams } from 'next/navigation';
import { useGetWorkspaceByIdQuery } from '@/hooks/use-workspace';
import { useGetTeamsByWorkspaceQuery } from '@/hooks/use-team';
import { Loader } from '@/components/loader';
import { TeamList } from '@/components/team/team-list';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function WorkspaceTeamsPage() {
  const params = useParams();
  const workspaceId = params.id as string;
  
  const { data: workspace, isLoading: workspaceLoading } = useGetWorkspaceByIdQuery(workspaceId);
  const { data: teams, isLoading: teamsLoading, refetch: refetchTeams } = useGetTeamsByWorkspaceQuery(workspaceId);

  if (workspaceLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader />
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <h2 className="text-2xl font-semibold">Workspace not found</h2>
        <p className="text-muted-foreground">
          The workspace you are looking for does not exist or you do not have access to it.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Teams</h1>
          <p className="text-muted-foreground mt-1">
            Manage teams in {workspace.name}
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Team
        </Button>
      </div>

      <TeamList
        workspaceId={workspaceId}
        teams={teams}
        isLoading={teamsLoading}
        onRefresh={refetchTeams}
      />
    </div>
  );
}