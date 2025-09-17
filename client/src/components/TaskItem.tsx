import { Task } from '../types';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  const handleToggle = () => {
    onToggle(task.id);
  };

  return (
    <li className="task-item">
      <label className="task-checkbox-label">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={handleToggle}
          className="task-checkbox"
        />
        <span className={task.completed ? 'task-title completed' : 'task-title'}>
          {task.title}
        </span>
      </label>
      <button
        onClick={() => onDelete(task.id)}
        className="delete-button"
        aria-label="Delete task"
      >
        ×
      </button>
    </li>
  );
}