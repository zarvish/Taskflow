// Task status constants
export const TASK_STATUSES = {
  BACKLOG: 'backlog',
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  IN_REVIEW: 'in_review',
  DONE: 'done',
  CANCELLED: 'cancelled',
} as const;

export type TaskStatus = typeof TASK_STATUSES[keyof typeof TASK_STATUSES];

// Priority constants
export const PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

export type Priority = typeof PRIORITIES[keyof typeof PRIORITIES];

// Status labels for display
export const STATUS_LABELS: Record<TaskStatus, string> = {
  [TASK_STATUSES.BACKLOG]: 'Backlog',
  [TASK_STATUSES.TODO]: 'To Do',
  [TASK_STATUSES.IN_PROGRESS]: 'In Progress',
  [TASK_STATUSES.IN_REVIEW]: 'In Review',
  [TASK_STATUSES.DONE]: 'Done',
  [TASK_STATUSES.CANCELLED]: 'Cancelled',
};

// Priority labels for display
export const PRIORITY_LABELS: Record<Priority, string> = {
  [PRIORITIES.LOW]: 'Low',
  [PRIORITIES.MEDIUM]: 'Medium',
  [PRIORITIES.HIGH]: 'High',
  [PRIORITIES.URGENT]: 'Urgent',
};

// Priority colors
export const PRIORITY_COLORS: Record<Priority, string> = {
  [PRIORITIES.LOW]: 'bg-gray-100 text-gray-700 border-gray-300',
  [PRIORITIES.MEDIUM]: 'bg-blue-100 text-blue-700 border-blue-300',
  [PRIORITIES.HIGH]: 'bg-orange-100 text-orange-700 border-orange-300',
  [PRIORITIES.URGENT]: 'bg-red-100 text-red-700 border-red-300',
};

// Status colors
export const STATUS_COLORS: Record<TaskStatus, string> = {
  [TASK_STATUSES.BACKLOG]: 'bg-slate-100 text-slate-700',
  [TASK_STATUSES.TODO]: 'bg-blue-100 text-blue-700',
  [TASK_STATUSES.IN_PROGRESS]: 'bg-purple-100 text-purple-700',
  [TASK_STATUSES.IN_REVIEW]: 'bg-yellow-100 text-yellow-700',
  [TASK_STATUSES.DONE]: 'bg-green-100 text-green-700',
  [TASK_STATUSES.CANCELLED]: 'bg-gray-100 text-gray-700',
};

// Project status
export const PROJECT_STATUSES = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
} as const;

export type ProjectStatus = typeof PROJECT_STATUSES[keyof typeof PROJECT_STATUSES];
