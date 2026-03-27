import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import App from './App';
import { AuthProvider } from './context/AuthContext.jsx'; 
import { store } from './store/index.js'; 
import '.index.css'; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}> {/* 1. Redux Store */}
      <AuthProvider> {/* 2. Auth Context */}
        <BrowserRouter> {/* 3. Router */}
          <App />
        </BrowserRouter>
      </AuthProvider>
    </Provider>
  </React.StrictMode>,
);