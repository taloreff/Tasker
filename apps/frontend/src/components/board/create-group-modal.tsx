'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateGroupMutation, CreateGroupDto } from '@/hooks/use-group';
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
import { ColorPicker } from '@/components/ui/color-picker';
import { colorOptions } from '@/lib/consts';
import { groupSchema } from '@/lib/schemas';

type GroupForm = z.infer<typeof groupSchema>;

interface CreateGroupModalProps {
  boardId: string;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}

export function CreateGroupModal({
  boardId,
  isOpen,
  setOpen,
}: CreateGroupModalProps) {
  const form = useForm<GroupForm>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: '',
      description: '',
      groupType: 'status' as const,
      color: colorOptions[0],
    },
  });

  const { mutate: createGroup, isPending } = useCreateGroupMutation(boardId);

  const onSubmit = (data: GroupForm) => {
    const createGroupData: CreateGroupDto = {
      ...data,
      boardId,
    };

    createGroup(createGroupData, {
      onSuccess: () => {
        form.reset();
        setOpen(false);
        toast.success('Group created successfully');
      },
      onError: (error: unknown) => {
        let errorMessage = 'Failed to create group';
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
          <DialogTitle>Create New Group</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter group name..." {...field} />
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
                      placeholder="Enter group description..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="groupType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select group type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="status">Status</SelectItem>
                      <SelectItem value="priority">Priority</SelectItem>
                      <SelectItem value="category">Category</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <ColorPicker 
                      value={field.value}
                      onChange={field.onChange}
                      size="md"
                      variant="border"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                {isPending ? 'Creating...' : 'Create Group'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
