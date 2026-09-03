import { Navigate } from 'react-router';
import { useFuncionarioAuth } from '../context/FuncionarioAuthContext';
import type { Profissao } from '../types/funcionario';

/**
 * Protege uma rota do painel para que só o funcionário do cargo (profissão)
 * correto acesse — ex: /admin/cozinha só pode ser aberta por quem logou
 * como Cozinheiro.
 */
export function RoleRoute({
    cargo,
    children,
}: Readonly<{ cargo: Profissao; children: React.ReactNode }>) {
    const { funcionario, autenticado } = useFuncionarioAuth();

    if (!autenticado || !funcionario) {
        return <Navigate to="/admin" replace />;
    }

    if (funcionario.profissao !== cargo) {
        return <Navigate to="/admin" replace />;
    }

    return children;
}
