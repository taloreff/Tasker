'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useGetWorkspaceByIdQuery } from '@/hooks/use-workspace';
import {
  useGetBoardsByWorkspaceQuery,
  useDeleteBoardMutation,
} from '@/hooks/use-board';
import { useGetTeamsByWorkspaceQuery } from '@/hooks/use-team';
import { Loader } from '@/components/loader';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Grid3X3,
  Plus,
  Users,
  Calendar,
  TrendingUp,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react';
import { CreateBoardModal } from '@/components/board/create-board-modal';
import { Board } from '@/types';
import { toast } from 'sonner';
import { ConfirmDeleteBoardModal } from '@/components/board/confirm-delete-board-modal';

export default function WorkspaceDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.id as string;
  const [isCreateBoardModalOpen, setIsCreateBoardModalOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState<Board | null>(null);

  const {
    data: workspace,
    isLoading: workspaceLoading,
    error,
  } = useGetWorkspaceByIdQuery(workspaceId);
  const { data: boards, isLoading: boardsLoading } =
    useGetBoardsByWorkspaceQuery(workspaceId);
  const { data: teams, isLoading: teamsLoading } =
    useGetTeamsByWorkspaceQuery(workspaceId);

  const deleteBoardMutation = useDeleteBoardMutation(workspaceId);

  const handleEditBoard = (board: Board) => {
    setEditingBoard(board);
    setIsCreateBoardModalOpen(true);
  };

  const handleDeleteBoard = (boardId: string) => {
    deleteBoardMutation.mutate(boardId, {
      onSuccess: () => toast.success('Board deleted successfully'),
      onError: () => toast.error('Failed to delete board'),
    });
  };

  if (workspaceLoading) {
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
          The workspace you are looking for does not exist or you do not have
          access to it.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{workspace.name}</h1>
          {workspace.description && (
            <p className="text-muted-foreground mt-1">
              {workspace.description}
            </p>
          )}
        </div>
        <Button onClick={() => setIsCreateBoardModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Board
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Boards</CardTitle>
            <Grid3X3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {boardsLoading ? '-' : boards?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Active boards</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Items</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Coming soon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teamsLoading ? '-' : teams?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Active teams</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completion Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Coming soon</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Boards</h2>
          {boards && boards.length > 3 && (
            <Button variant="outline" size="sm">
              View All
            </Button>
          )}
        </div>

        {boardsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader />
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {boards?.map((board) => (
              <Card
                key={board.id}
                className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-l-4 min-h-[160px]"
                style={{ borderLeftColor: board.color }}
                onClick={() =>
                  router.push(`/workspaces/${workspaceId}/boards/${board.id}`)
                }
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div
                        className="w-4 h-4 rounded-md flex-shrink-0 shadow-sm"
                        style={{ backgroundColor: board.color }}
                      />
                      <CardTitle className="text-lg font-semibold truncate group-hover:text-primary transition-colors">
                        {board.name}
                      </CardTitle>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-auto"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditBoard(board);
                          }}
                        >
                          <Pencil className="w-4 h-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            setBoardToDelete(board);
                            setIsDeleteModalOpen(true);
                          }}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {board.description && (
                    <CardDescription className="text-sm text-muted-foreground line-clamp-2 ml-7 leading-relaxed">
                      {board.description}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-xs text-muted-foreground ml-7">
                    <span className="font-medium">
                      {board.taskCount ?? 0} items
                    </span>
                    <span>
                      Updated {new Date(board.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card
              className="hover:bg-muted/10 transition-all duration-200 cursor-pointer min-h-[160px]"
              onClick={() => setIsCreateBoardModalOpen(true)}
            >
              <CardContent className="flex flex-col items-center justify-center h-full space-y-4 p-6">
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center group-hover:bg-blue-400 transition-colors">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-foreground">
                    Create new board
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Start organizing your work
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <CreateBoardModal
        workspaceId={workspaceId}
        isOpen={isCreateBoardModalOpen}
        setOpen={setIsCreateBoardModalOpen}
        boardToEdit={editingBoard}
      />
      <ConfirmDeleteBoardModal
        isOpen={isDeleteModalOpen}
        setOpen={setIsDeleteModalOpen}
        workspaceId={workspaceId}
        boardId={boardToDelete?.id ?? null}
        boardName={boardToDelete?.name}
      />
    </div>
  );
}
