'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Users,
  Plus,
  MoreHorizontal,
  Settings,
  UserPlus,
  Trash2,
} from 'lucide-react';
import { CreateTeamModal } from './create-team-modal';

interface Team {
  id: string;
  name: string;
  description?: string;
  workspaceId: string;
  memberCount?: number;
  createdAt: string;
  updatedAt: string;
}

interface TeamListProps {
  workspaceId: string;
  teams?: Team[];
  isLoading?: boolean;
  onTeamCreated?: (team: Team) => void;
  onRefresh?: () => void;
}

export function TeamList({
  workspaceId,
  teams = [],
  isLoading = false,
  onTeamCreated,
  onRefresh,
}: TeamListProps) {
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const handleTeamCreated = (team: Team) => {
    onTeamCreated?.(team);
    onRefresh?.();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const EmptyState = () => (
    <div className="text-center py-12">
      <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
      <h3 className="text-lg font-semibold mb-2">No teams yet</h3>
      <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
        Create your first team to organize workspace members and collaborate on projects.
      </p>
      <Button onClick={() => setCreateModalOpen(true)}>
        <Plus className="w-4 h-4 mr-2" />
        Create Your First Team
      </Button>
    </div>
  );

  const TeamTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Members</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="w-[70px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {teams.map((team) => (
          <TableRow key={team.id}>
            <TableCell>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="font-medium">{team.name}</div>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div className="max-w-[200px] truncate text-muted-foreground">
                {team.description || 'No description'}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="secondary">
                {team.memberCount || 0} members
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatDate(team.createdAt)}
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Members
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Team
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Teams</CardTitle>
              <CardDescription>
                Manage teams within this workspace
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Loading teams...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Teams</CardTitle>
              <CardDescription>
                Manage teams within this workspace
              </CardDescription>
            </div>
            {teams.length > 0 && (
              <Button onClick={() => setCreateModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Team
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {teams.length === 0 ? <EmptyState /> : <TeamTable />}
        </CardContent>
      </Card>

      <CreateTeamModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        workspaceId={workspaceId}
        onTeamCreated={handleTeamCreated}
      />
    </>
  );
}