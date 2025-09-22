import { Workspace } from '../entities/workspace.entity';

export function workspaceFactory(overrides: Partial<Workspace> = {}): Workspace {
  const workspace = new Workspace();
  workspace.name = 'Test Workspace';
  workspace.ownerId = 'test-user-id';
  Object.assign(workspace, overrides);
  return workspace;
}
