/**
 * @file main.tsx
 * @brief Ponto de entrada da aplicação React (loja + painéis administrativos).
 *
 * @details
 * Monta a árvore de contextos globais (tema claro/escuro, idioma da área
 * do cliente, autenticação legada, autenticação de funcionários e de
 * clientes) e o roteador da aplicação. O botão flutuante de tema (@see
 * ThemeToggleButton) é renderizado aqui, fora do `RouterProvider`, para
 * aparecer em toda página independente da rota atual.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router/dom';
import { AuthProvider } from './features/admin/hooks/AuthContext';
import { FuncionarioAuthProvider } from './features/funcionarios/context/FuncionarioAuthContext';
import { ClienteAuthProvider } from './features/clientes/context/ClienteAuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LocaleProvider } from './i18n/LocaleContext';
import { ThemeToggleButton } from './component/ThemeToggleButton';
import { AppProviders } from './app/providers';
import { router } from './app/router';

import './index.css';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ThemeProvider>
            <LocaleProvider>
                <AppProviders>
                    <AuthProvider>
                        <FuncionarioAuthProvider>
                            <ClienteAuthProvider>
                                <RouterProvider router={router} />
                                <ThemeToggleButton />
                            </ClienteAuthProvider>
                        </FuncionarioAuthProvider>
                    </AuthProvider>
                </AppProviders>
            </LocaleProvider>
        </ThemeProvider>
    </StrictMode>,
);
