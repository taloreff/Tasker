'use client';

import { useParams } from 'next/navigation';
import { useGetWorkspaceByIdQuery } from '@/hooks/use-workspace';
import { Loader } from '@/components/loader';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  Settings,
  Users,
  Trash2,
  Save
} from 'lucide-react';

export default function WorkspaceSettingsPage() {
  const params = useParams();
  const workspaceId = params.id as string;
  
  const { data: workspace, isLoading, error } = useGetWorkspaceByIdQuery(workspaceId);

  if (isLoading) {
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
          The workspace you are looking for does not exist or you do not have access to it.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage settings for {workspace.name}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Settings */}
        <div className="md:col-span-2 space-y-6">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                General
              </CardTitle>
              <CardDescription>
                Basic workspace information and settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Workspace Name</Label>
                <Input 
                  id="name" 
                  defaultValue={workspace.name}
                  placeholder="Enter workspace name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description"
                  defaultValue={workspace.description || ''}
                  placeholder="Describe your workspace"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="color">Workspace Color</Label>
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-8 h-8 rounded border"
                    style={{ backgroundColor: workspace.color }}
                  />
                  <Input 
                    id="color"
                    type="color"
                    defaultValue={workspace.color}
                    className="w-20"
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="flex justify-end">
                <Button>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Members */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Members
              </CardTitle>
              <CardDescription>
                Manage who has access to this workspace
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Invite members</p>
                    <p className="text-sm text-muted-foreground">
                      Add new team members to your workspace
                    </p>
                  </div>
                  <Button>
                    <Users className="w-4 h-4 mr-2" />
                    Invite
                  </Button>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <p className="font-medium">Current members (3)</p>
                  {[
                    { name: "John Doe", email: "john@example.com", role: "Owner" },
                    { name: "Jane Smith", email: "jane@example.com", role: "Admin" },
                    { name: "Mike Johnson", email: "mike@example.com", role: "Member" },
                  ].map((member, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">{member.role}</span>
                        {member.role !== "Owner" && (
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible and destructive actions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Delete Workspace</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Once you delete a workspace, there is no going back. 
                  Please be certain.
                </p>
                <Button variant="destructive" size="sm">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Workspace
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Workspace Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Created</span>
                <span className="text-sm font-medium">
                  {new Date(workspace.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Boards</span>
                <span className="text-sm font-medium">3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Members</span>
                <span className="text-sm font-medium">3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Items</span>
                <span className="text-sm font-medium">124</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}