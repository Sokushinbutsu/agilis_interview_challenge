// Base task interface
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export type TaskStatus = 'all' | 'active' | 'completed';

export type CompletedTask = Task & {
  completed: true;
}

export interface ActiveTask extends Task {
  completed: false;
}