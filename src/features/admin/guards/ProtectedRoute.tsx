import { Navigate } from 'react-router';
import { useAuth } from '../hooks/AuthContext';

export function ProtectedRoute({ children }: Readonly<{ children: React.ReactNode }>) {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) return <Navigate to="/admin" replace />;
    return children;
}