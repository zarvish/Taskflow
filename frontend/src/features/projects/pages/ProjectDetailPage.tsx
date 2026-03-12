import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Clock, MessageSquare, ListTodo, Activity, Trash2 } from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { useDroppable } from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useProject, useDeleteProject } from '../hooks/useProjects';
import { useTasks, useTaskTransition } from '@/features/tasks/hooks/useTasks';
import type { Task } from '@/api/types/task.types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { TASK_STATUSES, STATUS_LABELS, STATUS_COLORS, PRIORITY_COLORS, PRIORITY_LABELS } from '@/utils/constants';
import { toast } from 'sonner';

import CreateTaskModal from '@/features/tasks/components/CreateTaskModal';
import TaskDetailModal from '@/features/tasks/components/TaskDetailModal';

export default function ProjectDetailPage() {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project, isLoading: projectLoading } = useProject(Number(projectId));
  const { data: tasks, isLoading: tasksLoading } = useTasks(Number(projectId));
  const transition = useTaskTransition();
  const deleteProject = useDeleteProject();

  const [showCreateTask, setShowCreateTask] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [activeDragTask, setActiveDragTask] = useState<Task | null>(null);

  const selectedTask = selectedTaskId ? tasks?.find(t => t.id === selectedTaskId) || null : null;

  // Set up DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px movement required before drag starts
      },
    }),
    useSensor(KeyboardSensor)
  );

  const isLoading = projectLoading || tasksLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-lg font-medium">Project not found</p>
          <Link to="/projects">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="w-4 h-4" />
              Back to Projects
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Group tasks by status
  const tasksByStatus: Record<string, Task[]> = {
    [TASK_STATUSES.BACKLOG]: [],
    [TASK_STATUSES.TODO]: [],
    [TASK_STATUSES.IN_PROGRESS]: [],
    [TASK_STATUSES.IN_REVIEW]: [],
    [TASK_STATUSES.DONE]: [],
  };

  tasks?.forEach((task) => {
    if (task.status !== TASK_STATUSES.CANCELLED && tasksByStatus[task.status]) {
      tasksByStatus[task.status].push(task);
    }
  });

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks?.find((t) => t.id === active.id);
    if (task) {
      setActiveDragTask(task);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveDragTask(null);
    const { active, over } = event;
    
    if (!over) return;

    const taskId = active.id as number;
    const newStatus = over.id as string;
    
    const task = tasks?.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    // Trigger state transition via mutation
    try {
      await transition.mutateAsync({ taskId, to: newStatus });
    } catch (err: unknown) {
      // @ts-expect-error - axios shape
      const msg = err?.response?.data?.message || err?.message || 'Transition failed';
      toast.error(msg, { description: 'Failed to update task status.' });
    }
  };

  const handleDeleteProject = async () => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await deleteProject.mutateAsync(Number(projectId));
      navigate('/projects');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="border-b bg-background px-6 py-4 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/projects">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            {project.icon && <span className="text-xl">{project.icon}</span>}
            <h1 className="text-xl font-bold">{project.name}</h1>
            <Badge variant={project.status === 'active' ? 'default' : 'secondary'} className="h-5 text-[10px]">
              {project.status}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleDeleteProject} className="text-muted-foreground hover:text-destructive border-none shadow-none">
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button onClick={() => setShowCreateTask(true)}>
            <Plus className="w-4 h-4 mr-2 ml-[-4px]" />
            New Task
          </Button>
        </div>
      </header>

      {/* Kanban Board Container */}
      <main className="flex-1 overflow-auto p-6 bg-muted/10">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 h-full min-h-[500px] overflow-x-auto pb-4">
            {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
              <DroppableColumn key={status} status={status} tasks={statusTasks} onSelectTask={(task) => setSelectedTaskId(task.id)} />
            ))}
          </div>
          
          <DragOverlay>
            {activeDragTask ? (
              <div className="opacity-80 rotate-3 scale-105 cursor-grabbing">
                 <DraggableTaskCard task={activeDragTask} isOverlay />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </main>

      {/* Modals */}
      {showCreateTask && (
        <CreateTaskModal
          projectId={Number(projectId)}
          onClose={() => setShowCreateTask(false)}
        />
      )}

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTaskId(null)}
        />
      )}
    </div>
  );
}

// Subcomponents for DnD
function DroppableColumn({ status, tasks, onSelectTask }: { status: string; tasks: Task[]; onSelectTask: (t: Task) => void }) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <div ref={setNodeRef} className="flex-shrink-0 w-80 flex flex-col max-h-full">
      <Card className={`flex flex-col max-h-full border shadow-none transition-colors ${isOver ? 'bg-primary/5 border-primary/30' : 'bg-muted/30'}`}>
        <CardHeader className="p-3 border-b bg-card rounded-t-lg shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Badge className={`${STATUS_COLORS[status as keyof typeof STATUS_COLORS]} bg-opacity-10 shadow-none hover:bg-opacity-20`}>
                {STATUS_LABELS[status as keyof typeof STATUS_LABELS]}
              </Badge>
              <span className="text-muted-foreground text-xs">({tasks.length})</span>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-2 scrollbar-hide">
          <div className="space-y-2">
            {tasks.length === 0 ? (
              <div className="text-center py-6 text-xs text-muted-foreground border-2 border-dashed rounded-lg border-muted">
                Drop tasks here
              </div>
            ) : (
              tasks.map((task) => (
                <DraggableTaskCard key={task.id} task={task} onClick={() => onSelectTask(task)} />
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DraggableTaskCard({ task, onClick, isOverlay = false }: { task: Task; onClick?: () => void; isOverlay?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: task,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };
  
  // Hide the original card when dragging over so it doesn't double-render
  if (isDragging && !isOverlay) {
    return (
      <Card className="p-3 shadow-sm border-dashed border-2 bg-muted/50 h-[100px] opacity-30" />
    );
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`p-3 shadow-sm hover:shadow-md hover:border-primary/40 transition-all cursor-grab active:cursor-grabbing group ${isOverlay ? 'shadow-xl border-primary' : ''}`}
      onClick={(e) => {
        // Prevent click if we were dragging
        if (isDragging) e.preventDefault();
        else if (onClick) onClick();
      }}
    >
      <div className="space-y-2 pointer-events-none">
        <h3 className="font-medium text-sm leading-tight group-hover:text-primary transition-colors">
          {task.title}
        </h3>
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge
            variant="outline"
            className={`px-1.5 py-0 text-[10px] h-4 ${
              PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS]
            } border-none bg-opacity-20 hover:bg-opacity-30`}
          >
            {PRIORITY_LABELS[task.priority as keyof typeof PRIORITY_LABELS]}
          </Badge>
          {task.due_date && (
            <span className={`text-[10px] flex items-center gap-1 ${task.is_overdue ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
              <Clock className="w-3 h-3" />
              {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
        
        {/* Badges row for comments/subtasks hint - nice UI touch */}
        <div className="flex items-center gap-3 pt-1 text-muted-foreground">
           <div className="flex items-center gap-1 hover:text-foreground transition-colors" title="Subtasks">
             <ListTodo className="w-3.5 h-3.5" />
           </div>
           <div className="flex items-center gap-1 hover:text-foreground transition-colors" title="Comments">
             <MessageSquare className="w-3.5 h-3.5" />
           </div>
           <div className="flex items-center gap-1 hover:text-foreground transition-colors ml-auto" title="Activity logs">
             <Activity className="w-3.5 h-3.5" />
           </div>
        </div>
      </div>
    </Card>
  );
}
