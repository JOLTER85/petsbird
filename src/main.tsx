import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log("App booting...");

window.addEventListener('error', (event) => {
  console.error("Global Error Caught:", event.error);
  // Optionally show a basic fallback if root is empty
  const root = document.getElementById('root');
  if (root && root.innerHTML === '') {
    root.innerHTML = `<div style="padding: 20px; text-align: center; font-family: sans-serif;">
      <h2>حدث خطأ أثناء تحميل التطبيق</h2>
      <p>${event.error?.message || 'خطأ غير معروف'}</p>
      <button onclick="window.location.reload()">إعادة التحميل</button>
    </div>`;
  }
});

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
