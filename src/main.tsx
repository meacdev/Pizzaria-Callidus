import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router/dom';
import { AuthProvider } from './features/admin/hooks/AuthContext';
import { FuncionarioAuthProvider } from './features/funcionarios/context/FuncionarioAuthContext';
import { AppProviders } from './app/providers';
import { router } from './app/router';

import './index.css';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <AppProviders>
            <AuthProvider>
                <FuncionarioAuthProvider>
                    <RouterProvider router={router} />
                </FuncionarioAuthProvider>
            </AuthProvider>
        </AppProviders>
    </StrictMode>,
);