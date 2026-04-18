import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log("App booting...");

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("Critical: Root element not found!");
} else {
  console.log("Root element found, rendering...");
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
