import { useState } from 'react';
import { X } from 'lucide-react';
import { useCreateTask } from '@/features/tasks/hooks/useTasks';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Priority } from '@/api/types/task.types';
import { PRIORITIES, PRIORITY_LABELS } from '@/utils/constants';

interface CreateTaskModalProps {
  projectId: number;
  onClose: () => void;
}

export default function CreateTaskModal({ projectId, onClose }: CreateTaskModalProps) {
  const createTask = useCreateTask();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await createTask.mutateAsync({
        projectId,
        data: {
          title: title.trim(),
          description: description || undefined,
          priority,
          due_date: dueDate || undefined,
        },
      });
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg mx-4 bg-card border rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">New Task</h2>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-accent transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Title <span className="text-destructive">*</span>
            </label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              required
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              rows={3}
              className="w-full px-3 py-2 text-sm rounded-md border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Priority + Due Date row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 text-sm rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {Object.values(PRIORITIES).map((p) => (
                  <option key={p} value={p}>
                    {PRIORITY_LABELS[p]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Due Date</label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={createTask.isPending} className="flex-1">
              {createTask.isPending ? 'Creating...' : 'Create Task'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
