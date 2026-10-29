import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import {setupDefaultConsentMode} from './utils/analytics';

// Inicializa estado padrão do Google Consent Mode v2 antes da montagem dos componentes
setupDefaultConsentMode();

createRoot(document.getElementById('root')!).render(<App />);
