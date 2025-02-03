import React from 'react';
import { format } from 'date-fns';
import { CheckCircle, Circle, Edit2, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import type { Task } from '@/types/database';

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onToggleComplete,
  onEdit,
  onDelete
}) => {
  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div
          key={task.id}
          className={`bg-white rounded-lg shadow-sm border p-4 ${
            task.completed ? 'border-green-200 bg-green-50' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => onToggleComplete(task)}
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  task.completed ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {task.completed ? <CheckCircle size={24} /> : <Circle size={24} />}
              </button>
              <div>
                <p className={`font-medium ${
                  task.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                }`}>
                  {task.title}
                </p>
                {task.description && (
                  <p className="text-sm text-gray-500">{task.description}</p>
                )}
                <div className="flex items-center space-x-2 text-xs text-gray-400 mt-1">
                  <span>Échéance: {format(new Date(task.due_date), 'PP')}</span>
                  <span>•</span>
                  <span>Priorité: {task.priority}</span>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(task)}
              >
                <Edit2 size={16} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(task)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
