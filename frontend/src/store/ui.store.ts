import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  // Sidebar state
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  // Task detail panel
  taskDetailId: number | null;
  openTaskDetail: (id: number) => void;
  closeTaskDetail: () => void;

  // View mode
  viewMode: 'kanban' | 'list';
  setViewMode: (mode: 'kanban' | 'list') => void;

  // Theme
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;

  // Modal states
  createProjectModalOpen: boolean;
  setCreateProjectModalOpen: (open: boolean) => void;
  createTaskModalOpen: boolean;
  setCreateTaskModalOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Sidebar
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      // Task detail
      taskDetailId: null,
      openTaskDetail: (id) => set({ taskDetailId: id }),
      closeTaskDetail: () => set({ taskDetailId: null }),

      // View mode
      viewMode: 'kanban',
      setViewMode: (mode) => set({ viewMode: mode }),

      // Theme
      theme: 'light',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),

      // Modals
      createProjectModalOpen: false,
      setCreateProjectModalOpen: (open) => set({ createProjectModalOpen: open }),
      createTaskModalOpen: false,
      setCreateTaskModalOpen: (open) => set({ createTaskModalOpen: open }),
    }),
    {
      name: 'taskflow-ui',
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        viewMode: state.viewMode,
        theme: state.theme,
      }),
    }
  )
);
