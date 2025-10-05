'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateTaskMutation, CreateTaskDto } from '@/hooks/use-task';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { taskSchema } from '@/lib/schemas';

type TaskForm = z.infer<typeof taskSchema>;

interface CreateTaskModalProps {
  groupId: string;
  boardId: string;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}

export function CreateTaskModal({
  groupId,
  boardId,
  isOpen,
  setOpen,
}: CreateTaskModalProps) {
  const getDefaultStatus = (): 'todo' | 'in_progress' | 'review' | 'done' | 'blocked' | 'cancelled' => {
    return 'todo';
  };

  const getDefaultPriority = (): 'low' | 'medium' | 'high' | 'urgent' => {
    return 'medium';
  };

  const form = useForm<TaskForm>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      name: '',
      description: '',
      status: getDefaultStatus(),
      priority: getDefaultPriority(),
    },
  });
  const { mutate: createTask, isPending } = useCreateTaskMutation(
    groupId || '',
    boardId
  );

  const onSubmit = (data: TaskForm) => {
    if (!groupId) {
      toast.error('No group selected');
      return;
    }

    if (!boardId) {
      toast.error('No board selected');
      return;
    }

    const createTaskData: CreateTaskDto = {
      ...data,
      groupId,
      boardId,
    };

    createTask(createTaskData, {
      onSuccess: () => {
        form.reset();
        setOpen(false);
        toast.success('Task created successfully');
      },
      onError: (error: unknown) => {
        let errorMessage = 'Failed to create task';
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === 'object' && error !== null) {
          const apiError = error as {
            response?: { data?: { message?: string } };
          };
          errorMessage = apiError.response?.data?.message || errorMessage;
        }
        toast.error(errorMessage);
        console.error(error);
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter task name..." {...field} />
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
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter task description..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="todo">To Do</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="review">Review</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                        <SelectItem value="blocked">Blocked</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Creating...' : 'Create Task'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
