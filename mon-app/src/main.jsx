import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { store } from './store';
import './index.css';
import './registerSW';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#141414',
              color: '#fff',
              border: '1px solid rgba(245,197,24,0.3)',
              fontFamily: 'Inter, sans-serif',
            },
            success: { iconTheme: { primary: '#F5C518', secondary: '#0a0a0a' } },
          }}
        />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
