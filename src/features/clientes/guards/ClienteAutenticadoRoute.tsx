/**
 * @file ClienteAutenticadoRoute.tsx
 * @brief Guarda de rota que exige um cliente logado (@see ClienteAuthContext).
 */
import { Navigate } from 'react-router';
import { useClienteAuth } from '../context/ClienteAuthContext';

/**
 * @brief Protege uma rota que só o cliente logado pode acessar (ex: histórico de
 * compras, reserva de mesa) — se não estiver logado, manda para /usuario
 * para ele entrar ou se cadastrar.
 * @param children Conteúdo a exibir quando o cliente estiver autenticado.
 * @return O conteúdo protegido, ou um redirecionamento para /usuario.
 */
export function ClienteAutenticadoRoute({ children }: Readonly<{ children: React.ReactNode }>) {
    const { autenticado } = useClienteAuth();

    if (!autenticado) {
        return <Navigate to="/usuario" replace />;
    }

    return children;
}
