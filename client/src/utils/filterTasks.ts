import { Task, TaskStatus, CompletedTask, ActiveTask } from '../types';


export function getCompletedTasks(tasks: Task[]): CompletedTask[] {
  return tasks.filter(task => task.completed);
}

export function getActiveTasks(tasks: Task[]): ActiveTask[] {
  return tasks.filter(task => !task.completed);
}

export function filterTasks(tasks: Task[], filter: { kind: 'status'; status: TaskStatus }): Task[] {
  if (filter.status === 'all') {
    return tasks;
  } else if (filter.status === 'active') {
    return getActiveTasks(tasks); 
  } else {
    return getCompletedTasks(tasks);
  }
}