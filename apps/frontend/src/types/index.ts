export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  owner: User | string;
  color: string;
  members: {
    user: User;
    role: 'admin' | 'member' | 'owner' | 'viewer';
    joinedAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  workspaceId: string;
  memberCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTeamData {
  name: string;
  description?: string;
}

export interface Board {
  id: string;
  name: string;
  description?: string;
  color: string;
  taskCount: number;
  workspaceId: string;
  ownerId: string;
  assignedTeamId?: string;
  createdAt: string;
  updatedAt: string;
}

export type GroupType = 'status' | 'priority' | 'category' | 'custom';

export interface Group {
  id: string;
  name: string;
  description?: string;
  groupType: GroupType;
  color?: string;
  boardId: string;
  position: number;
  isCollapsed: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus =
  | 'todo'
  | 'in_progress'
  | 'review'
  | 'done'
  | 'blocked'
  | 'cancelled';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Subtask {
  id: string;
  name: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  name: string;
  description?: string;

  status: TaskStatus;
  priority: TaskPriority;

  boardId: string;

  groupId?: string | null;

  assigneeId?: string;
  createdById: string;

  position: number;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;

  assignee?: User;
  createdBy?: User;
  subtasks?: Subtask[];
}

export interface CommentReaction {
  emoji: string;
  user: User;
}

export interface Comment {
  id: string;
  author: User;
  text: string;
  createdAt: Date;
  reactions?: CommentReaction[];
  attachments?: {
    fileName: string;
    fileUrl: string;
    fileType?: string;
    fileSize?: number;
  }[];
}

export type ResourceType = 'Task' | 'Board' | 'Workspace' | 'Comment' | 'User';

export type ActionType =
  | 'created_task'
  | 'updated_task'
  | 'moved_task'
  | 'completed_task'
  | 'created_board'
  | 'updated_board'
  | 'created_workspace'
  | 'updated_workspace'
  | 'added_comment'
  | 'assigned_user';

export interface ActivityLog {
  id: string;
  user: User;
  action: ActionType;
  resourceType: ResourceType;
  resourceId: string;
  details: any;
  createdAt: Date;
}

export interface Label {
  id: string;
  name: string;
  color: string;
  description?: string;
  workspaceId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface StatsCardProps {
  totalBoards: number;
  totalTasks: number;
  totalInProgress: number;
  totalDone: number;
  totalTodo: number;
}

export interface TaskTrendsData {
  name: string;
  completed: number;
  inProgress: number;
  todo: number;
}

export interface TaskPriorityData {
  name: string;
  value: number;
  color: string;
}

export interface WorkspaceProductivityData {
  name: string;
  completed: number;
  total: number;
}
