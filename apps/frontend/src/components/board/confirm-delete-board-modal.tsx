'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useDeleteBoardMutation } from '@/hooks/use-board';
import { toast } from 'sonner';
import { Loader2, Trash2 } from 'lucide-react';

interface ConfirmDeleteBoardModalProps {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  workspaceId: string;
  boardId: string | null;
  boardName?: string;
}

export const ConfirmDeleteBoardModal = ({
  isOpen,
  setOpen,
  workspaceId,
  boardId,
  boardName,
}: ConfirmDeleteBoardModalProps) => {
  const deleteMutation = useDeleteBoardMutation(workspaceId);

  const handleDelete = () => {
    if (!boardId) return;
    deleteMutation.mutate(boardId, {
      onSuccess: () => {
        toast.success(`Board "${boardName || ''}" deleted successfully`);
        setOpen(false);
      },
      onError: () => toast.error('Failed to delete board'),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="max-w-sm rounded-xl p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="flex items-center text-lg font-semibold text-foreground">
            <Trash2 className="w-5 h-5 text-destructive mr-2" />
            Delete Board
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-2">
            Are you sure you want to delete{' '}
            <span className="font-medium text-foreground">
              {boardName || 'this board'}
            </span>
            ? <br />
            This action is{' '}
            <span className="text-destructive font-semibold">irreversible</span>.
          </DialogDescription>
        </DialogHeader>

        <Separator />

        <DialogFooter className="flex justify-end gap-3 px-6 py-4 bg-muted/30">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={deleteMutation.isPending}
            className="w-24"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="w-28"
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
