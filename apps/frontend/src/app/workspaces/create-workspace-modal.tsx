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
import { colorOptions } from '@/lib/consts';
import { workspaceSchema } from '@/lib/schemas';
import { cn } from '@/lib/utils';
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
      onError: (error: any) => {
        const errorMessage = error.response.data.message;
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
                          ></div>
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
                {isPending ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
