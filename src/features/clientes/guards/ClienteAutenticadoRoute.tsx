import { Navigate } from 'react-router';
import { useClienteAuth } from '../context/ClienteAuthContext';

/**
 * Protege uma rota que só o cliente logado pode acessar (ex: histórico de
 * compras, reserva de mesa) — se não estiver logado, manda para /usuario
 * para ele entrar ou se cadastrar.
 */
export function ClienteAutenticadoRoute({ children }: Readonly<{ children: React.ReactNode }>) {
    const { autenticado } = useClienteAuth();

    if (!autenticado) {
        return <Navigate to="/usuario" replace />;
    }

    return children;
}
