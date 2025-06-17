
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.log('تطبيق منصة امتحانات بريد الجزائر يتم تحميله...');

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('Service Worker مسجل بنجاح: ', registration);
      })
      .catch((registrationError) => {
        console.log('فشل تسجيل Service Worker: ', registrationError);
      });
  });
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("عنصر root غير موجود في HTML");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);

console.log('تم تحميل التطبيق بنجاح');
