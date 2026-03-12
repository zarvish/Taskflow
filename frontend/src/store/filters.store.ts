import { create } from 'zustand';
import type { TaskStatus, Priority } from '@/api/types/task.types';

interface FiltersState {
  // Current project
  currentProjectId: number | null;
  setCurrentProjectId: (id: number | null) => void;

  // Current workspace
  currentWorkspaceId: number | null;
  setCurrentWorkspaceId: (id: number | null) => void;

  // Task filters
  statusFilter: TaskStatus | 'all';
  setStatusFilter: (status: TaskStatus | 'all') => void;

  priorityFilter: Priority | 'all';
  setPriorityFilter: (priority: Priority | 'all') => void;

  searchQuery: string;
  setSearchQuery: (query: string) => void;

  showOverdueOnly: boolean;
  setShowOverdueOnly: (show: boolean) => void;

  // Reset filters
  resetFilters: () => void;
}

export const useFiltersStore = create<FiltersState>((set) => ({
  // Project/Workspace
  currentProjectId: null,
  setCurrentProjectId: (id) => set({ currentProjectId: id }),

  currentWorkspaceId: null,
  setCurrentWorkspaceId: (id) => set({ currentWorkspaceId: id }),

  // Filters
  statusFilter: 'all',
  setStatusFilter: (status) => set({ statusFilter: status }),

  priorityFilter: 'all',
  setPriorityFilter: (priority) => set({ priorityFilter: priority }),

  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  showOverdueOnly: false,
  setShowOverdueOnly: (show) => set({ showOverdueOnly: show }),

  // Reset
  resetFilters: () =>
    set({
      statusFilter: 'all',
      priorityFilter: 'all',
      searchQuery: '',
      showOverdueOnly: false,
    }),
}));
