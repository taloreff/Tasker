import { Project } from '../entities/project.entity';

export function projectFactory(overrides: Partial<Project> = {}): Project {
  const project = new Project();
  project.name = 'Test Project';
  project.description = 'Test project description';
  project.workspaceId = 'test-workspace-id';
  project.ownerId = 'test-user-id';
  Object.assign(project, overrides);
  return project;
}