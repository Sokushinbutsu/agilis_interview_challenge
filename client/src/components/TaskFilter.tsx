import { TaskStatus } from '../types';

interface TaskFilterProps {
  currentFilter: TaskStatus;
  onFilterChange: (filter: TaskStatus) => void;
}

export function TaskFilter({ currentFilter, onFilterChange }: TaskFilterProps) {
  const filters: TaskStatus[] = ['all', 'active', 'completed'];

  return (
    <div className="task-filter">
      {filters.map(filter => (
        <button
          key={filter}
          className={currentFilter === filter ? 'filter-button active' : 'filter-button'}
          onClick={() => onFilterChange(filter)}
        >
          {filter.charAt(0).toUpperCase() + filter.slice(1)}
        </button>
      ))}
    </div>
  );
}