'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  useCreateBoardMutation,
  useUpdateBoardMutation,
} from '@/hooks/use-board';
import { ColorPicker } from '@/components/ui/color-picker';
import { colorOptions } from '@/lib/consts';
import { boardSchema } from '@/lib/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { DialogTitle } from '@radix-ui/react-dialog';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';
import { Board } from '@/types';

interface CreateBoardModalProps {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  workspaceId: string;
  boardToEdit?: Board | null;
}

export type BoardForm = z.infer<typeof boardSchema>;

export const CreateBoardModal = ({
  isOpen,
  setOpen,
  workspaceId,
  boardToEdit,
}: CreateBoardModalProps) => {
  const isEditing = !!boardToEdit;

  const form = useForm<BoardForm>({
    defaultValues: {
      name: '',
      color: colorOptions[0],
      description: '',
    },
    resolver: zodResolver(boardSchema),
  });

  const createMutation = useCreateBoardMutation(workspaceId);
  const updateMutation = useUpdateBoardMutation(boardToEdit?.id ?? '', workspaceId);

  useEffect(() => {
    if (boardToEdit) {
      form.reset({
        name: boardToEdit.name || '',
        color: boardToEdit.color || colorOptions[0],
        description: boardToEdit.description || '',
      });
    } else {
      form.reset({
        name: '',
        color: colorOptions[0],
        description: '',
      });
    }
  }, [boardToEdit, form]);

  const onSubmit = (data: BoardForm) => {
    const payload = { ...data, workspaceId };

    if (isEditing && boardToEdit?.id) {
      updateMutation.mutate(payload, {
        onSuccess: () => {
          toast.success('Board updated successfully');
          setOpen(false);
        },
        onError: () => toast.error('Failed to update board'),
      });
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success('Board created successfully');
          setOpen(false);
        },
        onError: () => toast.error('Failed to create board'),
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen} modal>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Board' : 'Create Board'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Board Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter board name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Describe what this board is for"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Board Color</FormLabel>
                    <FormControl>
                      <ColorPicker
                        value={field.value}
                        onChange={field.onChange}
                        size="sm"
                        variant="ring"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {isEditing
                  ? updateMutation.isPending
                    ? 'Updating...'
                    : 'Update Board'
                  : createMutation.isPending
                  ? 'Creating...'
                  : 'Create Board'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
