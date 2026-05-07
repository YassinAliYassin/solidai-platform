import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

window.addEventListener('error', function(e) {
  console.log('ERROR:', e.message, e.filename, e.lineno);
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = 'color:red; padding:20px; background:#fee;';
  errorDiv.innerHTML = `<h2>JavaScript Error</h2><pre>${e.message}\n${e.filename}:${e.lineno}</pre>`;
  document.body.appendChild(errorDiv);
});

function renderApp() {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error('Root element not found!');
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = 'color:red; padding:20px; background:#fee;';
    errorDiv.innerHTML = '<h2>Error: Root element not found</h2>';
    document.body.appendChild(errorDiv);
    return;
  }
  try {
    createRoot(rootElement).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  } catch(e) {
    console.error('React render error:', e);
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = 'color:red; padding:20px; background:#fee;';
    errorDiv.innerHTML = `<h2>React Render Error</h2><pre>${e.message}</pre>`;
    document.body.appendChild(errorDiv);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderApp);
} else {
  renderApp();
}
