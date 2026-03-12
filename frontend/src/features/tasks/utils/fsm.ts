import { TASK_STATUSES } from '@/utils/constants';
import type { TaskStatus } from '@/api/types/task.types';

// FSM transition table - mirrors backend logic
export const ALLOWED_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  [TASK_STATUSES.BACKLOG]: [TASK_STATUSES.TODO, TASK_STATUSES.CANCELLED],
  [TASK_STATUSES.TODO]: [TASK_STATUSES.IN_PROGRESS, TASK_STATUSES.CANCELLED],
  [TASK_STATUSES.IN_PROGRESS]: [
    TASK_STATUSES.IN_REVIEW,
    TASK_STATUSES.DONE,
    TASK_STATUSES.CANCELLED,
  ],
  [TASK_STATUSES.IN_REVIEW]: [
    TASK_STATUSES.IN_PROGRESS,
    TASK_STATUSES.DONE,
    TASK_STATUSES.CANCELLED,
  ],
  [TASK_STATUSES.DONE]: [],
  [TASK_STATUSES.CANCELLED]: [],
};

export const TERMINAL_STATUSES: TaskStatus[] = [
  TASK_STATUSES.DONE,
  TASK_STATUSES.CANCELLED,
];

/**
 * Get valid next statuses for a task
 */
export const getValidTransitions = (currentStatus: TaskStatus): TaskStatus[] => {
  return ALLOWED_TRANSITIONS[currentStatus] || [];
};

/**
 * Check if a transition is valid
 */
export const canTransition = (from: TaskStatus, to: TaskStatus): boolean => {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
};

/**
 * Check if a status is terminal (no further transitions allowed)
 */
export const isTerminalStatus = (status: TaskStatus): boolean => {
  return TERMINAL_STATUSES.includes(status);
};
