import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { StoreProvider } from './data/store';
import { SessionProvider } from './lib/session';
import { I18nProvider } from './i18n';
import './index.css';
import { initPointerGlow } from './lib/pointerGlow';

initPointerGlow();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <I18nProvider>
      <StoreProvider>
        <SessionProvider>
          {/* Сайт живёт не в корне домена, а по адресу /<репозиторий>/. Без
              basename роутер считал бы «/uniwer/login» отдельным адресом, не
              находил бы маршрут и уходил на catch-all: страница сваливалась в
              корень домена, а обновление внутренней страницы ломалось.
              BASE_URL подставляет Vite — в разработке это «/». */}
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <App />
          </BrowserRouter>
        </SessionProvider>
      </StoreProvider>
    </I18nProvider>
  </React.StrictMode>
);
