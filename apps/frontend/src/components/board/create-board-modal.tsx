'use client';

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
import { useCreateBoardMutation } from '@/hooks/use-board';
import { colorOptions } from '@/lib/consts';
import { boardSchema } from '@/lib/schemas';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { DialogTitle } from '@radix-ui/react-dialog';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

interface CreateBoardModalProps {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  workspaceId: string;
}

export type BoardForm = z.infer<typeof boardSchema>;

export const CreateBoardModal = ({
  isOpen,
  setOpen,
  workspaceId,
}: CreateBoardModalProps) => {
  const form = useForm<BoardForm>({
    defaultValues: {
      name: '',
      color: colorOptions[0],
      description: '',
    },
    resolver: zodResolver(boardSchema),
  });

  const { mutate, isPending } = useCreateBoardMutation(workspaceId);

  const onSubmit = (data: BoardForm) => {
    const createBoardData = {
      ...data,
      workspaceId,
    };

    mutate(createBoardData, {
      onSuccess: () => {
        form.reset();
        setOpen(false);
        toast.success('Board created successfully');
      },
      onError: (error: unknown) => {
        let errorMessage = 'Failed to create board';
        
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === 'object' && error !== null) {
          const apiError = error as { response?: { data?: { message?: string } } };
          errorMessage = apiError.response?.data?.message || errorMessage;
        }
        
        toast.error(errorMessage);
        console.error(error);
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen} modal>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Board</DialogTitle>
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
                      <div className="flex gap-3 flex-wrap">
                        {colorOptions.map((color) => (
                          <div
                            key={color}
                            onClick={() => field.onChange(color)}
                            className={cn(
                              'size-6 rounded-full cursor-pointer hover:opacity-80 transition-all duration-300',
                              field.value === color &&
                                'ring-2 ring-offset-2 ring-blue-500'
                            )}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Creating...' : 'Create Board'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};