import React, { useEffect, useState } from 'react';
import { ListTodo } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { getTasks, createTask, updateTask, deleteTask } from '@/lib/tasks';
import { TaskList } from './TaskList';
import { TaskForm } from './TaskForm';
import { Modal } from '../Modal';
import { Button } from '../ui/Button';
import type { Task } from '@/types/database';

export const TaskCenter: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    if (!user) return;

    getTasks(user.id).then(data => {
      setTasks(data);
    });
  }, [user]);

  const handleCreateTask = async (data: Omit<Task, 'id' | 'created_at'>) => {
    if (!user) return;

    const task = await createTask({
      ...data,
      user_id: user.id
    });

    setTasks(prev => [task, ...prev]);
    setIsModalOpen(false);
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    const task = await updateTask(taskId, updates);
    setTasks(prev =>
      prev.map(t => t.id === task.id ? task : t)
    );
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleDeleteTask = async (task: Task) => {
    await deleteTask(task.id);
    setTasks(prev => prev.filter(t => t.id !== task.id));
  };

  const handleToggleComplete = async (task: Task) => {
    await handleUpdateTask(task.id, { completed: !task.completed });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
      >
        <ListTodo size={20} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <h3 className="font-medium text-gray-900">Tâches</h3>
            <Button
              size="sm"
              onClick={() => setIsModalOpen(true)}
            >
              Nouvelle Tâche
            </Button>
          </div>
          <div className="max-h-96 overflow-y-auto p-4">
            <TaskList
              tasks={tasks}
              onToggleComplete={handleToggleComplete}
              onEdit={(task) => {
                setEditingTask(task);
                setIsModalOpen(true);
              }}
              onDelete={handleDeleteTask}
            />
          </div>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        title={editingTask ? "Modifier la Tâche" : "Nouvelle Tâche"}
      >
        <TaskForm
          task={editingTask}
          onSubmit={(data) => {
            if (editingTask) {
              handleUpdateTask(editingTask.id, data);
            } else {
              handleCreateTask(data);
            }
          }}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingTask(null);
          }}
        />
      </Modal>
    </div>
  );
};