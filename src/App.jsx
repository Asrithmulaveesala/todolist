// App.jsx
import React, { useState, useEffect } from 'react';
import TodoList from './components/TodoList';
import './App.css';

const App = () => {
  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState('');
  const [deadline, setDeadline] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    setTodos(prevTodos =>
      prevTodos.map(todo => {
        if (todo.completed || !todo.deadline) return todo;

        const timeLeft = todo.deadline - now;
        let updatedTodo = { ...todo };

        try {
          if (!updatedTodo.warned5min && timeLeft <= 5 * 60 * 1000 && timeLeft > 0) {
            if (Notification.permission === 'granted') {
              new Notification(`⏰ Hurry up! "${todo.text}" is due in 5 minutes.`);
            }
            const audio = new Audio('/beep.mp3');
            audio.play().catch(err => console.log('Audio blocked by browser:', err));
            updatedTodo.warned5min = true;
          }

          if (!updatedTodo.warned0min && timeLeft <= 1000 && timeLeft > -10000) {
            if (Notification.permission === 'granted') {
              new Notification(`⚠️ "${todo.text}" is due now!`);
            }
            const audio = new Audio('/beep.mp3');
            audio.play().catch(err => console.log('Audio blocked by browser:', err));
            updatedTodo.warned0min = true;
          }

        } catch (error) {
          console.log('Notification or audio failed:', error);
        }

        return updatedTodo;
      })
    );
  }, [now]);

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
    document.body.style.background = darkMode
      ? 'linear-gradient(120deg, #2c3e50, #34495e)'
      : '#f5f7fa';
    document.body.style.color = darkMode ? '#ecf0f1' : '#2c3e50';
  }, [darkMode]);

  const addTodo = () => {
    if (task.trim() === '' || deadline.trim() === '') return;

    const newTodo = {
      id: Date.now(),
      text: task,
      deadline: new Date(deadline).getTime(),
      completed: false,
      warned5min: false,
      warned0min: false
    };

    setTodos([...todos, newTodo]);
    setTask('');
    setDeadline('');
    setShowNotification(true);

    // Show 5-minute notification immediately if deadline is within 5 minutes
    const timeLeft = newTodo.deadline - Date.now();
    if (timeLeft <= 5 * 60 * 1000 && timeLeft > 0) {
      if (Notification.permission === 'granted') {
        new Notification(`⏰ Hurry up! "${newTodo.text}" is due in less than 5 minutes.`);
      }
      const audio = new Audio('/beep.mp3');
      audio.play().catch(err => console.log('Audio blocked by browser:', err));
      newTodo.warned5min = true;
    }

    setTimeout(() => setShowNotification(false), 2000);
  };

  const toggleTodo = id => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = id => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const editTodo = (todoToEdit) => {
    const updatedText = prompt('Edit your task:', todoToEdit.text);
    const updatedDeadlineStr = prompt('Edit deadline (yyyy-mm-ddThh:mm):', new Date(todoToEdit.deadline).toISOString().slice(0, 16));

    if (
      updatedText !== null &&
      updatedText.trim() !== '' &&
      updatedDeadlineStr !== null &&
      updatedDeadlineStr.trim() !== ''
    ) {
      const updatedDeadline = new Date(updatedDeadlineStr).getTime();
      setTodos(todos.map(todo =>
        todo.id === todoToEdit.id
          ? { ...todo, text: updatedText, deadline: updatedDeadline, warned5min: false, warned0min: false }
          : todo
      ));
    }
  };

  return (
    <>
      <div style={{ position: 'fixed', top: 20, left: 20 }}>
        <label style={{ fontWeight: 'bold' }}>
          <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} /> Dark Mode
        </label>
      </div>

      {showNotification && <div className="notification">✅ Todo item created successfully.</div>}

      <div className="app-container" style={{ background: darkMode ? '#2d3436' : '#ffffff', color: darkMode ? '#ecf0f1' : '#2c3e50' }}>
        <h2 style={{ textAlign: 'center', marginTop: 0 }}>ToDo List 📝</h2>
        <div className="input-group">
          <input
            style={{ borderColor: '#ccc', backgroundColor: '#ffffff', color: '#111', padding: '10px', fontSize: '14px', appearance: 'none', WebkitTextFillColor: '#111' }}
            value={task}
            onChange={e => setTask(e.target.value)}
            placeholder="Add your task"
          />
          <input
            type="datetime-local"
            value={deadline}
            onChange={e => setDeadline(e.target.value)}
            className="time-input"
            style={{ borderColor: '#ccc', backgroundColor: '#ffffff', color: '#111', padding: '10px', fontSize: '14px', appearance: 'none', WebkitTextFillColor: '#111' }}
          />
          <button onClick={addTodo}>➕</button>
        </div>

        <TodoList todos={todos} onToggle={toggleTodo} onDelete={deleteTodo} onEdit={editTodo} now={now} />
      </div>

      <div className="triangle"></div>
      <div className="triangle"></div>
      <div className="triangle"></div>
    </>
  );
};

export default App;
