
// Import the React library.
import React from 'react';
// Import the ReactDOM library for rendering the app in the DOM.
import ReactDOM from 'react-dom/client';
// Import the main App component.
import App from './App';
// Import the main CSS file, which includes Tailwind CSS directives.
import './index.css';

// Get the HTML element with the ID 'root' from the document.
const rootElement = document.getElementById('root');
// Check if the root element exists.
if (!rootElement) {
  // If not, throw an error to stop the app from crashing silently.
  throw new Error("Could not find root element to mount to");
}

// Create a React root attached to the specified DOM element.
const root = ReactDOM.createRoot(rootElement);
// Render the application into the root.
root.render(
  // React.StrictMode helps find potential problems in the application during development.
  <React.StrictMode>
    {/* Render the root App component. */}
    <App />
  </React.StrictMode>
);
