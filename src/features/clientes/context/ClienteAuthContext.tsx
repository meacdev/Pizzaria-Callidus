/**
 * @file ClienteAuthContext.tsx
 * @brief Contexto de autenticação do cliente: guarda a sessão do cliente logado e expõe entrar/atualizar/sair.
 *
 * @details
 * Mesma lógica do FuncionarioAuthContext (@see
 * src/features/funcionarios/context), só que para a conta do cliente:
 * guarda apenas a "sessão" no navegador (`localStorage`), para não
 * deslogar ao dar F5 — o cadastro em si fica no back-end (@see
 * cliente.service).
 */
import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Cliente } from '../types/cliente';

interface ClienteAuthContextType {
    cliente: Cliente | null;
    autenticado: boolean;
    entrar: (cliente: Cliente) => void;
    atualizar: (cliente: Cliente) => void;
    sair: () => void;
}

// Mesma lógica do FuncionarioAuthContext (src/features/funcionarios/context),
// só que para a conta do cliente: guarda apenas a "sessão" no navegador
// (para não deslogar ao dar F5). O cadastro em si fica no back-end.
const CHAVE_SESSAO = 'cliente_sessao';

const ClienteAuthContext = createContext<ClienteAuthContextType | null>(null);

/** @brief Lê a sessão do cliente salva no `localStorage`, descartando-a se estiver corrompida. */
function lerSessaoSalva(): Cliente | null {
    const bruto = localStorage.getItem(CHAVE_SESSAO);
    if (!bruto) return null;

    try {
        return JSON.parse(bruto) as Cliente;
    } catch {
        localStorage.removeItem(CHAVE_SESSAO);
        return null;
    }
}

/** @brief Provedor do contexto de autenticação do cliente; deve envolver as rotas que usam `useClienteAuth`. */
export function ClienteAuthProvider({ children }: { children: ReactNode }) {
    const [cliente, setCliente] = useState<Cliente | null>(lerSessaoSalva);

    const entrar = (novoCliente: Cliente) => {
        localStorage.setItem(CHAVE_SESSAO, JSON.stringify(novoCliente));
        setCliente(novoCliente);
    };

    const sair = () => {
        localStorage.removeItem(CHAVE_SESSAO);
        setCliente(null);
    };

    const atualizar = (clienteAtualizado: Cliente) => {
        localStorage.setItem(CHAVE_SESSAO, JSON.stringify(clienteAtualizado));
        setCliente(clienteAtualizado);
    };

    return (
        <ClienteAuthContext.Provider value={{ cliente, autenticado: !!cliente, entrar, atualizar, sair }}>
            {children}
        </ClienteAuthContext.Provider>
    );
}

/**
 * @brief Hook para acessar o cliente autenticado e as ações de sessão (entrar/atualizar/sair).
 * @return O contexto de autenticação do cliente.
 */
export function useClienteAuth() {
    const contexto = useContext(ClienteAuthContext);
    if (!contexto) {
        throw new Error('useClienteAuth precisa estar dentro de um ClienteAuthProvider');
    }
    return contexto;
}
