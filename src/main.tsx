import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import '@fontsource/inter/latin-400.css';import '@fontsource/inter/latin-500.css';import '@fontsource/inter/latin-600.css';
import '@fontsource/cormorant-garamond/latin-500.css';import '@fontsource/noto-sans-devanagari/latin-400.css';import '@fontsource/noto-sans-devanagari/latin-500.css';
import '@fontsource/noto-sans-devanagari/devanagari-400.css';import '@fontsource/noto-sans-devanagari/devanagari-500.css';
import App from './App';import './styles.css';
createRoot(document.getElementById('root')!).render(<StrictMode><App/></StrictMode>);
