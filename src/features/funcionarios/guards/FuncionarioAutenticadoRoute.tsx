/**
 * @file FuncionarioAutenticadoRoute.tsx
 * @brief Guard de rota que exige apenas um funcionário autenticado, sem checar o cargo.
 *
 * @details
 * @see RoleRoute.tsx exige, além de estar autenticado, um cargo
 * específico — este guard é usado onde qualquer funcionário serve.
 */
import { Navigate } from 'react-router';
import { useFuncionarioAuth } from '../context/FuncionarioAuthContext';

/**
 * Protege uma rota que qualquer funcionário autenticado pode acessar,
 * independente do cargo (cozinheiro, garçom ou entregador) — diferente do
 * RoleRoute, que exige uma profissão específica.
 *
 * Usada pela área de customização da loja (login em /custom): por
 * enquanto qualquer funcionário da loja pode entrar lá, então basta estar
 * autenticado, sem checar profissão.
 */
export function FuncionarioAutenticadoRoute({ children }: Readonly<{ children: React.ReactNode }>) {
    const { autenticado } = useFuncionarioAuth();

    if (!autenticado) {
        return <Navigate to="/custom" replace />;
    }

    return children;
}
