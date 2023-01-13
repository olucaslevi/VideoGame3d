import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import React  from 'react';

import App from './App';

// 👇️ passed wrong ID to getElementById() method
const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
    <App/>
);