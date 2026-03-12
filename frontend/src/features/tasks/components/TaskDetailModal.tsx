import { useState } from 'react';
import { X, Clock, AlertCircle, ChevronRight, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTasks, useTaskTransition, useUpdateTask, useDeleteTask } from '@/features/tasks/hooks/useTasks';
import { activityApi } from '@/api/activity.api';
import { subtasksApi } from '@/api/subtasks.api';
import { dependenciesApi } from '@/api/dependencies.api';
import { formatDateTime } from '@/utils/date';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import {
  STATUS_LABELS,
  STATUS_COLORS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  TASK_STATUSES,
} from '@/utils/constants';
import type { Task, Priority } from '@/api/types/task.types';
import type { Subtask } from '@/api/types/subtask.types';
import type { ActivityLog } from '@/api/types/activity.types';
import type { DependencyEdge } from '@/api/types/dependency.types';
import { toast } from 'sonner';

// FSM transition map
const VALID_TRANSITIONS: Record<string, string[]> = {
  backlog: ['todo', 'cancelled'],
  todo: ['in_progress', 'cancelled'],
  in_progress: ['in_review', 'done', 'cancelled'],
  in_review: ['in_progress', 'done', 'cancelled'],
  done: [],
  cancelled: [],
};

// Short labels for transition buttons
const TRANSITION_LABELS: Record<string, string> = {
  todo: 'Move to To Do',
  in_progress: 'Start',
  in_review: 'Send to Review',
  done: 'Mark Done',
  cancelled: 'Cancel',
};

// Button variants for transitions
const TRANSITION_VARIANTS: Record<string, 'default' | 'outline' | 'destructive'> = {
  todo: 'outline',
  in_progress: 'default',
  in_review: 'outline',
  done: 'default',
  cancelled: 'destructive',
};

interface TaskDetailModalProps {
  task: Task;
  onClose: () => void;
}

type Tab = 'details' | 'subtasks' | 'dependencies' | 'activity';

export default function TaskDetailModal({ task, onClose }: TaskDetailModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('details');
  const [newSubtask, setNewSubtask] = useState('');
  const [newDependencyId, setNewDependencyId] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDesc, setEditDesc] = useState(task.description || '');
  const [editPriority, setEditPriority] = useState<Priority>(task.priority);
  const queryClient = useQueryClient();

  const transition = useTaskTransition();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  // Fetch activity
  const { data: activityData } = useQuery({
    queryKey: ['activity', task.id],
    queryFn: () => activityApi.list(task.id).then((r) => r.data.activity),
    enabled: activeTab === 'activity',
  });

  // Fetch subtasks
  const { data: subtasksData } = useQuery({
    queryKey: ['subtasks', task.id],
    queryFn: () => subtasksApi.list(task.id).then((r) => r.data.subtasks),
    enabled: activeTab === 'subtasks',
  });

  // Fetch dependencies
  const { data: dependenciesData } = useQuery({
    queryKey: ['dependencies', task.id],
    queryFn: () => dependenciesApi.list(task.id).then((r) => r.data),
    enabled: activeTab === 'dependencies',
  });

  // Fetch project tasks for dependencies
  const { data: projectTasks } = useTasks(task.project_id);
  const availableTasks = projectTasks?.filter(t => t.id !== task.id) || [];

  // Create dependency
  const createDependency = useMutation({
    mutationFn: (depTaskId: number) =>
      dependenciesApi.create(task.id, depTaskId).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dependencies', task.id] });
      setNewDependencyId('');
    },
    onError: (err: unknown) => {
      // @ts-expect-error - axios shape
       toast.error(err?.message, {
         description: "Failed to add dependency.",
       });
      
    }
  });

  // Remove dependency
  const removeDependency = useMutation({
    mutationFn: (depId: number) => dependenciesApi.delete(task.id, depId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dependencies', task.id] });
    },
  });

  // Create subtask
  const createSubtask = useMutation({
    mutationFn: () =>
      subtasksApi.create(task.id, { title: newSubtask }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subtasks', task.id] });
      queryClient.invalidateQueries({ queryKey: ['activity', task.id] });
      queryClient.invalidateQueries({ queryKey: ['tasks', task.project_id] });
      setNewSubtask('');
    },
  });

  // Update subtask
  const updateSubtask = useMutation({
    mutationFn: ({ subtaskId, status }: { subtaskId: number; status: string }) =>
      subtasksApi.update(task.id, subtaskId, { status }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subtasks', task.id] });
      queryClient.invalidateQueries({ queryKey: ['activity', task.id] });
    },
  });

  // Delete subtask
  const deleteSubtask = useMutation({
    mutationFn: (subtaskId: number) => subtasksApi.delete(task.id, subtaskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subtasks', task.id] });
      queryClient.invalidateQueries({ queryKey: ['activity', task.id] });
      queryClient.invalidateQueries({ queryKey: ['tasks', task.project_id] });
    },
  });

  const handleTransition = async (to: string) => {
    try {
      await transition.mutateAsync({ taskId: task.id, to });
      // Close and re-open with updated task handled by query invalidation
      onClose();
    } catch (err: unknown) {
      // @ts-expect-error - we know the shape of the error from axios
      const msg = err?.response?.data?.message || err?.message || 'Transition failed';
      toast.error(msg, {
        description: 'Failed to update task status.',
      });
    }
  };

  const handleSaveEdit = async () => {
    await updateTask.mutateAsync({
      id: task.id,
      data: {
        title: editTitle,
        description: editDesc || undefined,
        priority: editPriority,
      },
    });
    setIsEditing(false);
  };

  const handleDeleteTask = async () => {
    if (confirm('Are you confirm you want to delete this task?')) {
      await deleteTask.mutateAsync(task.id);
      onClose();
    }
  };

  const validNextStates = VALID_TRANSITIONS[task.status] || [];

  const tabs: { id: Tab; label: string }[] = [
    { id: 'details', label: 'Details' },
    { id: 'subtasks', label: 'Subtasks' },
    { id: 'dependencies', label: 'Dependencies' },
    { id: 'activity', label: 'Activity' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl bg-card border rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b gap-4">
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="text-lg font-semibold"
                autoFocus
              />
            ) : (
              <h2
                className="text-lg font-semibold cursor-pointer hover:text-primary transition-colors"
                onClick={() => setIsEditing(true)}
                title="Click to edit"
              >
                {task.title}
              </h2>
            )}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge className={STATUS_COLORS[task.status as keyof typeof STATUS_COLORS]}>
                {STATUS_LABELS[task.status as keyof typeof STATUS_LABELS]}
              </Badge>
              <Badge className={PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS]}>
                {PRIORITY_LABELS[task.priority as keyof typeof PRIORITY_LABELS]}
              </Badge>
              {task.is_overdue && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Overdue
                </Badge>
              )}
              {task.due_date && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(task.due_date).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-accent transition-colors shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* FSM Transition Buttons */}
        {validNextStates.length > 0 && (
          <div className="px-6 py-3 border-b bg-muted/30 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground mr-1">Transition:</span>
            {validNextStates.map((s) => (
              <Button
                key={s}
                size="sm"
                variant={TRANSITION_VARIANTS[s] || 'outline'}
                onClick={() => handleTransition(s)}
                disabled={transition.isPending}
                className="h-7 text-xs"
              >
                {TRANSITION_LABELS[s] || STATUS_LABELS[s as keyof typeof STATUS_LABELS]}
                <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`text-sm py-3 px-1 mr-5 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary font-medium'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-5">
              {isEditing ? (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Description</label>
                    <textarea
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      rows={4}
                      placeholder="Task description..."
                      className="w-full px-3 py-2 text-sm rounded-md border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Priority</label>
                    <select
                      value={editPriority}
                      onChange={(e) => setEditPriority(e.target.value as Priority)}
                      className="px-3 py-2 text-sm rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {(['low', 'medium', 'high', 'urgent'] as Priority[]).map((p) => (
                        <option key={p} value={p}>
                          {PRIORITY_LABELS[p]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveEdit} disabled={updateTask.isPending} size="sm">
                      {updateTask.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h3 className="text-sm font-medium mb-1 text-muted-foreground">Description</h3>
                    {task.description ? (
                      <p className="text-sm whitespace-pre-wrap">{task.description}</p>
                    ) : (
                      <p
                        className="text-sm text-muted-foreground italic cursor-pointer hover:text-foreground"
                        onClick={() => setIsEditing(true)}
                      >
                        No description — click to add one
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground font-medium mb-1">Status</p>
                      <Badge className={STATUS_COLORS[task.status as keyof typeof STATUS_COLORS]}>
                        {STATUS_LABELS[task.status as keyof typeof STATUS_LABELS]}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-muted-foreground font-medium mb-1">Priority</p>
                      <Badge className={PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS]}>
                        {PRIORITY_LABELS[task.priority as keyof typeof PRIORITY_LABELS]}
                      </Badge>
                    </div>
                    {task.due_date && (
                      <div>
                        <p className="text-muted-foreground font-medium mb-1">Due Date</p>
                        <p className={task.is_overdue ? 'text-destructive font-medium' : ''}>
                          {new Date(task.due_date).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {task.created_at && (
                      <div>
                        <p className="text-muted-foreground font-medium mb-1">Created</p>
                        <p>{new Date(task.created_at).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 mt-6 border-t pt-4">
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                      Edit Task
                    </Button>
                    <Button variant="destructive" size="sm" onClick={handleDeleteTask} disabled={deleteTask.isPending}>
                      {deleteTask.isPending ? 'Deleting...' : 'Delete Task'}
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Subtasks Tab */}
          {activeTab === 'subtasks' && (
            <div className="space-y-4">
              {/* Add subtask */}
              <form
                onSubmit={(e) => { e.preventDefault(); if (newSubtask.trim()) createSubtask.mutate(); }}
                className="flex gap-2"
              >
                <Input
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  placeholder="New subtask title..."
                  className="flex-1"
                />
                <Button type="submit" size="sm" disabled={createSubtask.isPending || !newSubtask.trim()}>
                  Add
                </Button>
              </form>

              {/* Subtask list */}
              {subtasksData && subtasksData.length > 0 ? (
                <div className="space-y-2">
                  {subtasksData.map((st: Subtask) => (
                    <div
                      key={st.id}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-muted/20"
                    >
                      <button
                        className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${
                          st.status === TASK_STATUSES.DONE 
                            ? 'bg-green-500 border-green-500' 
                            : 'border-muted-foreground hover:border-primary'
                        }`}
                        onClick={() => updateSubtask.mutate({ 
                          subtaskId: st.id, 
                          status: st.status === TASK_STATUSES.DONE ? TASK_STATUSES.TODO : TASK_STATUSES.DONE 
                        })}
                        disabled={updateSubtask.isPending}
                        title={st.status === TASK_STATUSES.DONE ? "Mark uncompleted" : "Mark completed"}
                      >
                        {st.status === TASK_STATUSES.DONE && <X className="w-2.5 h-2.5 text-white stroke-[3] scale-[0.8] invert" />}
                      </button>
                      <span className={`text-sm flex-1 ${st.status === TASK_STATUSES.DONE ? 'line-through text-muted-foreground' : ''}`}>
                        {st.title}
                      </span>
                      <Badge className={`text-xs ${STATUS_COLORS[st.status as keyof typeof STATUS_COLORS]}`}>
                        {STATUS_LABELS[st.status as keyof typeof STATUS_LABELS]}
                      </Badge>
                      <button
                        className="ml-auto w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors shrink-0"
                        onClick={() => deleteSubtask.mutate(st.id)}
                        disabled={deleteSubtask.isPending}
                        title="Delete subtask"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">No subtasks yet</p>
              )}
            </div>
          )}

          {/* Dependencies Tab */}
          {activeTab === 'dependencies' && (
            <div className="space-y-6">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const depId = parseInt(newDependencyId, 10);
                  if (depId && !isNaN(depId)) {
                    createDependency.mutate(depId);
                  }
                }}
                className="flex gap-2"
              >
                <select
                  value={newDependencyId}
                  onChange={(e) => setNewDependencyId(e.target.value)}
                  className="w-full flex-1 px-3 py-2 text-sm rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select a task to depend on...</option>
                  {availableTasks.map(t => (
                    <option key={t.id} value={t.id}>#{t.id} - {t.title}</option>
                  ))}
                </select>
                <Button type="submit" size="sm" disabled={createDependency.isPending || !newDependencyId}>
                  Add Dependency
                </Button>
              </form>

              <div>
                <h3 className="text-sm font-semibold mb-3">Tasks blocking this one</h3>
                {dependenciesData?.blocked_by && dependenciesData.blocked_by.length > 0 ? (
                  <div className="space-y-2">
                    {dependenciesData.blocked_by.map((d: DependencyEdge) => {
                      const depTask = projectTasks?.find(t => t.id === d.depends_on_task_id);
                      return (
                        <div key={d.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/10">
                          <span className="text-sm font-medium">#{d.depends_on_task_id} {depTask?.title}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive"
                            onClick={() => removeDependency.mutate(d.id)}
                            disabled={removeDependency.isPending}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic mb-2">No blocking tasks.</p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-3">Tasks blocked by this one</h3>
                {dependenciesData?.blocking && dependenciesData.blocking.length > 0 ? (
                  <div className="space-y-2">
                    {dependenciesData.blocking.map((d: DependencyEdge) => {
                      const depTask = projectTasks?.find(t => t.id === d.task_id);
                      return (
                        <div key={d.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/10">
                          <span className="text-sm font-medium">#{d.task_id} {depTask?.title}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive"
                            onClick={() => removeDependency.mutate(d.id)}
                            disabled={removeDependency.isPending}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No tasks blocked.</p>
                )}
              </div>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="space-y-2">
              {activityData && activityData.length > 0 ? (
                activityData.map((a: ActivityLog) => (
                  <div key={a.id} className="flex items-start gap-3 py-3 text-sm border-b last:border-0">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div>
                        {a.actor_id && <span className="font-semibold text-primary/80 mr-1">{a.actor_id}</span>}
                        <span className="text-muted-foreground">
                          {a.field_name === 'created' ? 'created the task' : `updated ${a.field_name}`}
                        </span>
                      </div>
                      {a.field_name !== 'created' && (
                        <div className="mt-1 bg-muted/30 p-2 rounded text-xs flex items-center gap-2">
                          <span className={`${a.old_value ? 'line-through text-muted-foreground' : 'text-muted-foreground italic'}`}>
                            {a.old_value || '(empty)'}
                          </span>
                          <span className="text-muted-foreground">→</span>
                          <span className="font-medium text-foreground">{a.new_value || '(empty)'}</span>
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0 mt-1 whitespace-nowrap">
                      {formatDateTime(a.created_at)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">No activity recorded yet</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
