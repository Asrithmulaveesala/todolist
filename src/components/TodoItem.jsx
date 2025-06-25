import React, { useEffect, useState } from 'react';
import './TodoItem.css';

const TodoItem = ({ todo, onToggle, onDelete, onEdit, now }) => {
  const timeLeft = todo.deadline ? todo.deadline - now : null;

  const formatTime = ms => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <li className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <div className="todo-left">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
        />
        <span>{todo.text}</span>
        {!todo.completed && timeLeft !== null && (
          <span className="countdown">⏳ {formatTime(timeLeft)}</span>
        )}
      </div>
      <div className="todo-right">
        <button onClick={() => onEdit(todo)} className="icon-btn">✏️</button>
        <button onClick={() => onDelete(todo.id)} className="icon-btn">🗑️</button>
      </div>
    </li>
  );
};

export default TodoItem;
