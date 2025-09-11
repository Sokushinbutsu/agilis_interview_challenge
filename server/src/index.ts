import express from 'express';
import cors from 'cors';

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

let tasks: Task[] = [
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

// Get all tasks
app.get('/api/tasks', (req, res) => {
  res.json(tasks);
});

// Get single task
app.get('/api/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === req.params.id);
  if (task) {
    res.json(task);
  } else {
    res.status(404).json({ error: 'Task not found' });
  }
});

// add a single task
app.post('/api/tasks', (req, res) => {
  const { title } = req.body;
  
  if (!title) {
    return;
  }
  
  res.status(200).json({
    id: Date.now().toString(),
    title,
    completed: false,
    createdAt: new Date().toISOString(),
  });
});

// Update task
app.put('/api/tasks/:id', (req, res) => {
  const taskIndex = tasks.findIndex(t => t.id === req.params.id);
  
  if (taskIndex !== -1) {
    // Simulate async delay for Bug 4
    setTimeout(() => {
      tasks[taskIndex] = { ...tasks[taskIndex], ...req.body };
      res.json(tasks[taskIndex]);
    }, 100); // Small delay to create race condition
  } else {
    res.status(404).json({ error: 'Task not found' });
  }
});

// Delete task
app.delete('/api/tasks/:id', (req, res) => {
  const taskIndex = tasks.findIndex(t => t.id === req.params.id);
  
  if (taskIndex !== -1) {
    tasks.splice(taskIndex, 1);
    res.status(204).send();
  } else {
    res.status(404).json({ error: 'Task not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});