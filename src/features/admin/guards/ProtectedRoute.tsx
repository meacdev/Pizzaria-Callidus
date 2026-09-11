/**
 * @file ProtectedRoute.tsx
 * @brief Guarda de rota do painel administrativo: só renderiza os filhos se houver sessão de admin autenticada.
 *
 * @details
 * Depende de @see useAuth (AuthContext.tsx); quando não autenticado,
 * redireciona para /admin (tela de login).
 */
import { Navigate } from 'react-router';
import { useAuth } from '../hooks/AuthContext';

/** @brief Renderiza `children` apenas se o admin estiver autenticado; caso contrário redireciona para /admin. */
export function ProtectedRoute({ children }: Readonly<{ children: React.ReactNode }>) {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) return <Navigate to="/admin" replace />;
    return children;
}