import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';

// Universal click reload animation for all buttons across the entire frontend
if (typeof window !== "undefined") {
  document.addEventListener("click", (e) => {
    const button = e.target.closest("button, [role='button']");
    if (!button || button.disabled) return;

    // Trigger reload active pulse animation
    button.classList.remove("btn-reload-active");
    void button.offsetWidth; // Force reflow
    button.classList.add("btn-reload-active");

    // Add radiating reload ripple wave originating from click position
    const rect = button.getBoundingClientRect();
    const ripple = document.createElement("span");
    ripple.className = "btn-reload-ripple";
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

    button.appendChild(ripple);
    setTimeout(() => {
      ripple.remove();
    }, 600);
  });
}

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

