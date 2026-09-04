import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Funcionario } from '../types/funcionario';

interface FuncionarioAuthContextType {
    funcionario: Funcionario | null;
    autenticado: boolean;
    entrar: (funcionario: Funcionario) => void;
    atualizar: (funcionario: Funcionario) => void;
    sair: () => void;
}

// Guarda apenas a "sessão" de quem está logado no navegador (para não
// deslogar ao dar F5). O cadastro dos funcionários em si NÃO fica aqui:
// ele é persistido pelo back-end (server/) em SQLite.
const CHAVE_SESSAO = 'funcionario_sessao';

const FuncionarioAuthContext = createContext<FuncionarioAuthContextType | null>(null);

function lerSessaoSalva(): Funcionario | null {
    const bruto = localStorage.getItem(CHAVE_SESSAO);
    if (!bruto) return null;

    try {
        return JSON.parse(bruto) as Funcionario;
    } catch {
        localStorage.removeItem(CHAVE_SESSAO);
        return null;
    }
}

export function FuncionarioAuthProvider({ children }: { children: ReactNode }) {
    const [funcionario, setFuncionario] = useState<Funcionario | null>(lerSessaoSalva);

    const entrar = (novoFuncionario: Funcionario) => {
        localStorage.setItem(CHAVE_SESSAO, JSON.stringify(novoFuncionario));
        setFuncionario(novoFuncionario);
    };

    const sair = () => {
        localStorage.removeItem(CHAVE_SESSAO);
        setFuncionario(null);
    };

    // Usado depois de editar o próprio cadastro (nome, login, senha etc.):
    // atualiza a sessão guardada sem precisar logar de novo.
    const atualizar = (funcionarioAtualizado: Funcionario) => {
        localStorage.setItem(CHAVE_SESSAO, JSON.stringify(funcionarioAtualizado));
        setFuncionario(funcionarioAtualizado);
    };

    return (
        <FuncionarioAuthContext.Provider
            value={{ funcionario, autenticado: !!funcionario, entrar, atualizar, sair }}
        >
            {children}
        </FuncionarioAuthContext.Provider>
    );
}

export function useFuncionarioAuth() {
    const contexto = useContext(FuncionarioAuthContext);
    if (!contexto) {
        throw new Error('useFuncionarioAuth precisa estar dentro de um FuncionarioAuthProvider');
    }
    return contexto;
}
