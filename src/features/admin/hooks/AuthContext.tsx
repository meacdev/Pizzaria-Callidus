/**
 * @file AuthContext.tsx
 * @brief Contexto de autenticação do painel administrativo (token salvo em `localStorage`).
 *
 * @details
 * Usado por @see ProtectedRoute (guards/ProtectedRoute.tsx) para bloquear
 * o acesso às telas de admin sem login.
 */
import { createContext, useContext, useState, type ReactNode } from 'react';

/** @brief Formato do contexto de autenticação de admin: estado de login, token e ações de login/logout. */
interface AuthContextType {
    isAuthenticated: boolean;
    token: string | null;
    login: (token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

/** @brief Provedor de autenticação de admin: persiste o token em `localStorage` e expõe `login`/`logout`. */
export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(
        () => localStorage.getItem('admin_token')
    );

    const login = (newToken: string) => {
        localStorage.setItem('admin_token', newToken);
        setToken(newToken);
    };

    const logout = () => {
        localStorage.removeItem('admin_token');
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated: !!token, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * @brief Acessa o contexto de autenticação de admin.
 * @return O contexto `AuthContextType` atual.
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth precisa estar dentro de um AuthProvider');
    return context;
}