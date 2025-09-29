'use client';

import { useParams } from 'next/navigation';
import { useGetWorkspaceByIdQuery } from '@/hooks/use-workspace';
import { useGetTeamsByWorkspaceQuery } from '@/hooks/use-team';
import { Loader } from '@/components/loader';
import { TeamList } from '@/components/team/team-list';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Settings, 
  Users, 
  FolderOpen, 
  Plus 
} from 'lucide-react';

export default function WorkspaceDetailsPage() {
  const params = useParams();
  const workspaceId = params.id as string;
  
  const { data: workspace, isLoading, error } = useGetWorkspaceByIdQuery(workspaceId);
  const { data: teams, isLoading: teamsLoading, refetch: refetchTeams } = useGetTeamsByWorkspaceQuery(workspaceId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader />
      </div>
    );
  }

  if (error || !workspace) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <h2 className="text-2xl font-semibold">Workspace not found</h2>
        <p className="text-muted-foreground">
          The workspace you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-semibold text-lg"
            style={{ backgroundColor: workspace.color }}
          >
            {workspace.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{workspace.name}</h1>
            {workspace.description && (
              <p className="text-muted-foreground">{workspace.description}</p>
            )}
          </div>
        </div>
        <Button variant="outline">
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teams</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teams?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active teams in this workspace
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Active projects
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Total tasks
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Teams Section */}
        <TeamList
          workspaceId={workspaceId}
          teams={teams}
          isLoading={teamsLoading}
          onRefresh={refetchTeams}
        />

        {/* Projects Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Projects</CardTitle>
                <CardDescription>
                  Recent projects in this workspace
                </CardDescription>
              </div>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No projects yet</p>
              <p className="text-sm">Create your first project to organize your work</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}