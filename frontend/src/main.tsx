import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { CategoryProvider } from "./context/CategoryContext";
import "./styles.css";
import { resolveUploadsUrls } from "./lib/api/axios";
import { BACKEND_ORIGIN } from "./config";

// Global fetch interceptor to automatically rewrite relative /uploads paths to absolute backend URLs
const originalFetch = window.fetch;
window.fetch = async function (...args) {
  const response = await originalFetch(...args);
  
  return new Proxy(response, {
    get(target: Response, prop: string | symbol, receiver) {
      if (prop === 'json') {
        return async function() {
          const data = await target.json();
          return resolveUploadsUrls(data, BACKEND_ORIGIN);
        };
      }
      if (prop === 'clone') {
        return function() {
          const clonedResponse = target.clone();
          return new Proxy(clonedResponse, {
            get(cTarget: Response, cProp: string | symbol) {
              if (cProp === 'json') {
                return async function() {
                  const data = await cTarget.json();
                  return resolveUploadsUrls(data, BACKEND_ORIGIN);
                };
              }
              const value = Reflect.get(cTarget, cProp);
              return typeof value === 'function' ? value.bind(cTarget) : value;
            }
          });
        };
      }
      const value = Reflect.get(target, prop);
      return typeof value === 'function' ? value.bind(target) : value;
    }
  });
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CategoryProvider>
      <App />
    </CategoryProvider>
  </StrictMode>,
);
