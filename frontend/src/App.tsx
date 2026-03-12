import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useUIStore } from '@/store/ui.store';
import { useEffect } from 'react';

import AppLayout from '@/components/layout/AppLayout';
import ProjectsPage from '@/features/projects/pages/ProjectsPage';
import ProjectDetailPage from '@/features/projects/pages/ProjectDetailPage';
import { Toaster } from 'sonner';

function App() {
  const theme = useUIStore((state) => state.theme);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/projects" replace />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
