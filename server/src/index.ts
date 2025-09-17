import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

const DB_FILE = path.join(process.cwd(), 'data', 'tasks.json');

const defaultTasks: Task[] = [
  {
    id: '1',
    title: 'Complete project documentation',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Review pull requests',
    completed: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Update dependencies',
    completed: false,
    createdAt: new Date().toISOString(),
  },
];

// Database functions
const loadTasks = async (): Promise<Task[]> => {
  try {
    const data = await fs.readFile(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    // File doesn't exist, create it with default data
    await saveTasks(defaultTasks);
    return defaultTasks;
  }
};

const saveTasks = async (tasks: Task[]): Promise<void> => {
  await fs.mkdir(path.dirname(DB_FILE), { recursive: true });
  await fs.writeFile(DB_FILE, JSON.stringify(tasks, null, 2));
};

// Get all tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await loadTasks();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load tasks' });
  }
});

// Get single task
app.get('/api/tasks/:id', async (req, res) => {
  try {
    const tasks = await loadTasks();
    const task = tasks.find(t => t.id === req.params.id);
    if (task) {
      res.json(task);
    } else {
      res.status(404).json({ error: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to load tasks' });
  }
});

// Create new task - Bug 3: Silent failure
app.post('/api/tasks', async (req, res) => {
  const { title } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  
  try {
    // Bug 3: Return success response but don't actually save the task
    const newTask = {
      id: Date.now().toString(),
      title,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    
    // Note: NOT saving to file - this is the bug!
    // const tasks = await loadTasks();
    // tasks.push(newTask);
    // await saveTasks(tasks);
    
    res.status(200).json(newTask);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update task
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const tasks = await loadTasks();
    const taskIndex = tasks.findIndex(t => t.id === req.params.id);
    
    if (taskIndex !== -1) {
      // Simulate async delay for Bug 4
      setTimeout(async () => {
        tasks[taskIndex] = { ...tasks[taskIndex], ...req.body };
        await saveTasks(tasks);
        res.json(tasks[taskIndex]);
      }, 100); // Small delay to create race condition
    } else {
      res.status(404).json({ error: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete task
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const tasks = await loadTasks();
    const taskIndex = tasks.findIndex(t => t.id === req.params.id);
    
    if (taskIndex !== -1) {
      tasks.splice(taskIndex, 1);
      await saveTasks(tasks);
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});