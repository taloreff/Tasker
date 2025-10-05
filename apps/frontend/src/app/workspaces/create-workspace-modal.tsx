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
import { useCreateWorkspace } from '@/hooks/use-workspace';
import { ColorPicker } from '@/components/ui/color-picker';
import { colorOptions } from '@/lib/consts';
import { workspaceSchema } from '@/lib/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { DialogTitle } from '@radix-ui/react-dialog';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}

export type WorkspaceForm = z.infer<typeof workspaceSchema>;

export const CreateWorkspaceModal = ({
  isOpen,
  setOpen,
}: CreateWorkspaceModalProps) => {
  const form = useForm<WorkspaceForm>({
    defaultValues: {
      name: '',
      color: colorOptions[0],
      description: '',
    },
    resolver: zodResolver(workspaceSchema),
  });

  const router = useRouter();
  const { mutate, isPending } = useCreateWorkspace();

  const onSubmit = (data: WorkspaceForm) => {
    mutate(data, {
      onSuccess: (data) => {
        form.reset();
        setOpen(false);
        toast.success('Workspace created successfully');
        router.replace(`/workspaces/${data.id}`);
      },
      onError: (error: unknown) => {
        let errorMessage = 'Failed to create workspace';
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === 'object' && error !== null) {
          const apiError = error as { response?: { data?: { message?: string } } };
          errorMessage = apiError.response?.data?.message || errorMessage;
        }
        toast.error(errorMessage);
        console.log(error);
      },
    });
  };
  return (
    <Dialog open={isOpen} onOpenChange={setOpen} modal>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Workspace</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Workspace Name" />
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
                        placeholder="Workspace Description"
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
                    <FormLabel>Workspace Color</FormLabel>
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
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
