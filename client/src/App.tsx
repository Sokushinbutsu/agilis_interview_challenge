import { useState, useEffect } from 'react';
import { Task, TaskStatus } from './types';
import { TaskList } from './components/TaskList';
import { AddTaskForm } from './components/AddTaskForm';
import { TaskFilter } from './components/TaskFilter';
import { filterTasks } from './utils/filterTasks';
import './App.css';

// Bug 1: This will crash on startup because API_URL is required but not defined
const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<TaskStatus>('all');
  const [loading, setLoading] = useState(true);
  const [undoHistory, setUndoHistory] = useState<Task[][]>([]);

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [undoHistory]);

  const captureSnapshot = () => {
    setUndoHistory(prev => [...prev.slice(-9), [...tasks]]);
  };

  const undo = () => {
    if (undoHistory.length === 0) return;
    
    const lastSnapshot = undoHistory[undoHistory.length - 1];
    setTasks(lastSnapshot);
    setUndoHistory(prev => prev.slice(0, -1));
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API_URL}/tasks`);
      const data = await response.json();
      setTasks(data);
      console.log(data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (title: string) => {
    captureSnapshot();
    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      
      const newTask = await response.json();
      // Bug 3: This will add the task to UI but it's not saved on server
      setTasks([...tasks, newTask]);
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  };

  const toggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    captureSnapshot();
    try {
      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !task.completed }),
      });
      
      const updatedTask = await response.json();
      setTasks(tasks.map(t => t.id === id ? updatedTask : t));
    } catch (error) {
      console.error('Failed to toggle task:', error);
    }
  };

  const deleteTask = async (id: string) => {
    captureSnapshot();
    try {
      await fetch(`${API_URL}/tasks/${id}`, {
        method: 'DELETE',
      });
      
      setTasks(tasks.filter(t => t.id !== id));
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  // Bug 2: This uses the problematic filter system
  const filteredTasks = filterTasks(tasks, { kind: 'status', status: filter });

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Task Manager</h1>
        {undoHistory.length > 0 && (
          <div className="undo-indicator">
            <small>Press Ctrl+Z to undo</small>
          </div>
        )}
      </header>
      
      <main className="app-main">
        <AddTaskForm onAdd={addTask} />
        <TaskFilter currentFilter={filter} onFilterChange={setFilter} />
        <TaskList
          tasks={filteredTasks}
          onToggle={toggleTask}
          onDelete={deleteTask}
        />
      </main>
    </div>
  );
}

export default App;