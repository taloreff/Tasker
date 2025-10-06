import { AlertCircle, CheckCircle2, Clock, Pause, Play, XCircle } from "lucide-react";

export const 
REACT_QUERY_KEYS = {
    WORKSPACES: 'workspaces',
    BOARDS: 'boards',
    GROUPS: 'groups',
    TASKS: 'tasks',
    PROJECTS: 'projects',
    TEAMS: 'teams',
    USERS: 'users',
};

export const colorOptions = [
  "#FF5733",
  "#33C1FF",
  "#28A745",
  "#FFC300",
  "#8E44AD",
  "#E67E22",
  "#2ECC71",
  "#34495E",
];

export const statusIcons = {
  todo: Clock,
  in_progress: Play,
  review: Pause,
  done: CheckCircle2,
  blocked: AlertCircle,
  cancelled: XCircle,
};

export const statusColors = {
  todo: 'bg-gray-100 text-gray-700 border-gray-300',
  in_progress: 'bg-blue-100 text-blue-700 border-blue-300',
  review: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  done: 'bg-green-100 text-green-700 border-green-300',
  blocked: 'bg-red-100 text-red-700 border-red-300',
  cancelled: 'bg-gray-100 text-gray-500 border-gray-300',
};

export const priorityColors = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};