import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskItem } from '../TaskItem';
import { Task } from '../../types';

describe('TaskItem', () => {
  const mockTask: Task = {
    id: '1',
    title: 'Test task',
    completed: false,
    createdAt: new Date().toISOString(),
  };

  const mockOnToggle = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders task correctly', () => {
    render(
      <TaskItem
        task={mockTask}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Test task')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('calls onToggle when checkbox is clicked', () => {
    render(
      <TaskItem
        task={mockTask}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(mockOnToggle).toHaveBeenCalledWith('1');
  });

  // This test passes because it's testing the simple case
  it('handles single toggle correctly', async () => {
    render(
      <TaskItem
        task={mockTask}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    await userEvent.click(checkbox);

    expect(mockOnToggle).toHaveBeenCalledTimes(1);
    expect(mockOnToggle).toHaveBeenCalledWith('1');
  });

  it('prevents rapid clicks during async operation', async () => {
    const slowToggle = jest.fn().mockImplementation(() => {
      return new Promise(resolve => setTimeout(resolve, 100));
    });

    render(
      <TaskItem
        task={mockTask}
        onToggle={slowToggle}
        onDelete={mockOnDelete}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    
    // Rapidly click 5 times
    await userEvent.tripleClick(checkbox);
    await userEvent.dblClick(checkbox);

    // Wait for any pending operations
    await waitFor(() => {
      expect(slowToggle).toHaveBeenCalledTimes(1);
    }, { timeout: 1000 });
  });

  // Another failing test that shows the UI state issue
  it('disables checkbox while toggle is in progress', async () => {
    let resolveToggle: () => void;
    const pendingToggle = jest.fn().mockImplementation(() => {
      return new Promise<void>(resolve => {
        resolveToggle = resolve;
      });
    });

    render(
      <TaskItem
        task={mockTask}
        onToggle={pendingToggle}
        onDelete={mockOnDelete}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    
    // Start toggle operation
    fireEvent.click(checkbox);

    expect(checkbox).toBeDisabled();

    // Resolve the promise
    resolveToggle!();
    await waitFor(() => {
      expect(checkbox).not.toBeDisabled();
    });
  });
});