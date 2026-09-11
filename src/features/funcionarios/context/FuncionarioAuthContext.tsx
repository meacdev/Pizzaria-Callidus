/**
 * @file FuncionarioAuthContext.tsx
 * @brief Contexto de autenticação de funcionário (sessão no navegador — cozinheiro, garçom, entregador ou gerente).
 *
 * @details
 * Guarda apenas a "sessão" de quem está logado (persistida em
 * localStorage, para sobreviver a um F5). O cadastro dos funcionários em
 * si não fica aqui: é mantido pelo back-end (server/) em SQLite. Usado
 * pelos guards de rota (@see FuncionarioAutenticadoRoute, @see RoleRoute)
 * e por @see PainelLayout.tsx para saber quem está logado e deslogar.
 */
import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Funcionario } from '../types/funcionario';

/** @brief Formato do contexto de autenticação de funcionário. */
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

/** @brief Lê a sessão de funcionário salva em localStorage, se houver e for válida. */
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

/** @brief Provedor do contexto de autenticação de funcionário; restaura a sessão salva ao montar. */
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

/** @brief Hook de acesso ao contexto de autenticação de funcionário. @return Estado e ações de sessão. */
export function useFuncionarioAuth() {
    const contexto = useContext(FuncionarioAuthContext);
    if (!contexto) {
        throw new Error('useFuncionarioAuth precisa estar dentro de um FuncionarioAuthProvider');
    }
    return contexto;
}
