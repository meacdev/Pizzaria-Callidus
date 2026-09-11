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

export function useClienteAuth() {
    const contexto = useContext(ClienteAuthContext);
    if (!contexto) {
        throw new Error('useClienteAuth precisa estar dentro de um ClienteAuthProvider');
    }
    return contexto;
}
