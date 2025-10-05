'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useCreateTeamMutation } from '@/hooks/use-team';
import { teamSchema } from '@/lib/schemas';
import { Team } from '@/types';



export type TeamForm = z.infer<typeof teamSchema>;

interface CreateTeamModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  onTeamCreated?: (team: Team) => void;
}

export function CreateTeamModal({
  open,
  onOpenChange,
  workspaceId,
  onTeamCreated,
}: CreateTeamModalProps) {
  const createTeamMutation = useCreateTeamMutation(workspaceId);

  const form = useForm<TeamForm>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const onSubmit = async (values: TeamForm) => {
    try {
      const team = await createTeamMutation.mutateAsync(values);

      form.reset();
      onOpenChange(false);

      onTeamCreated?.(team);
    } catch (error) {
      console.error('Error creating team:', error);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !createTeamMutation.isPending) {
      form.reset();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Team</DialogTitle>
          <DialogDescription>
            Create a new team to organize your workspace members and projects.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Development Team"
                      {...field}
                      disabled={createTeamMutation.isPending}
                    />
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
                      placeholder="Describe what this team does..."
                      className="resize-none"
                      rows={3}
                      {...field}
                      disabled={createTeamMutation.isPending}
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
                onClick={() => handleOpenChange(false)}
                disabled={createTeamMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createTeamMutation.isPending}>
                {createTeamMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Team'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
