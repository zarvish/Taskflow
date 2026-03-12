import { Outlet } from 'react-router-dom';
import WorkspaceSidebar from '@/features/workspaces/components/WorkspaceSidebar';

export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-background">
      <WorkspaceSidebar />
      <div className="flex-1 min-w-0 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}
