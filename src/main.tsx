import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { HealingDeskPrototype } from './demo/HealingDeskPrototype';
import './styles/tokens.css';
import './styles/paper-skin.css';
import './styles/transitions.css';
import './index.css';
import { initPerfMode } from './lib/perf-detector';
import { initThemeFromStorage, runStorageMigration } from './lib/storage-keys';

runStorageMigration();
initThemeFromStorage();
initPerfMode();

const showDeskPrototype =
  import.meta.env.DEV &&
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).get('deskPrototype') === '1';

createRoot(document.getElementById('root')!).render(
  <StrictMode>{showDeskPrototype ? <HealingDeskPrototype /> : <App />}</StrictMode>,
);