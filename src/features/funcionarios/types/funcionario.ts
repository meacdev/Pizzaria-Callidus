export type Profissao = 'cozinheiro' | 'garcom' | 'entregador';

/**
 * Espelha (no front-end) a classe Funcionario e as suas 3 subclasses do
 * back-end (server/models.py). Aqui é apenas o formato de dados que a API
 * devolve — quem manda na regra de negócio (cadastro, login, herança) é o
 * back-end.
 */
export interface Funcionario {
    id: number;
    nome: string;
    idade: number;
    tempoExperiencia: number;
    login: string;
    profissao: Profissao;
}

export interface FuncionarioCadastroInput {
    nome: string;
    idade: number;
    tempoExperiencia: number;
    login: string;
    senha: string;
    profissao: Profissao;
}

export interface LoginInput {
    login: string;
    senha: string;
}

export interface LoginResponse {
    funcionario: Funcionario;
    rota: string;
}

export const PROFISSAO_LABEL: Record<Profissao, string> = {
    cozinheiro: 'Cozinheiro(a)',
    garcom: 'Garçom / Garçonete',
    entregador: 'Entregador(a)',
};

export const PROFISSAO_ROTA: Record<Profissao, string> = {
    cozinheiro: '/admin/cozinha',
    garcom: '/admin/balcao',
    entregador: '/admin/entrega',
};
