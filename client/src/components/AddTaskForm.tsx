import { useState, FormEvent, useEffect } from 'react';

interface AddTaskFormProps {
  onAdd: (title: string) => void;
}

export function AddTaskForm({ onAdd }: AddTaskFormProps) {
  const [title, setTitle] = useState('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    const savedDraft = localStorage.getItem('taskDraft');
    if (savedDraft) {
      setTitle(savedDraft);
    }
  }, []);

  useEffect(() => {
    const saveDraft = () => {
      if (title.trim()) {
        localStorage.setItem('taskDraft', title);
        setLastSaved(new Date());
      }
    };

    const timer = setInterval(saveDraft, 2000); 
    
    return () => clearInterval(timer);
  }, []); 


  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (title.trim()) {
      onAdd(title.trim());
      setTitle('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-task-form">
      <div className="form-row">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          className="task-input"
          maxLength={50}
        />
        <button type="submit" className="add-button">
          Add Task
        </button>
      </div>
      {lastSaved && (
        <small className="draft-status">
          Draft saved at {lastSaved.toLocaleTimeString()}
        </small>
      )}
    </form>
  );
}