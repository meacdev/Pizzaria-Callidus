/**
 * @file funcionario.ts
 * @brief Tipos de dados de funcionário compartilhados entre as páginas e serviços da área de painel.
 *
 * @details
 * Espelha o que o back-end (server/) devolve — a regra de negócio de
 * cadastro/login/permissões vive lá, este arquivo só descreve o formato.
 */

/** @brief Cargos possíveis de um funcionário. */
export type Profissao = 'cozinheiro' | 'garcom' | 'entregador' | 'gerente';

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

/** @brief Dados enviados ao cadastrar um novo funcionário. */
export interface FuncionarioCadastroInput {
    nome: string;
    idade: number;
    tempoExperiencia: number;
    login: string;
    senha: string;
    profissao: Profissao;
}

/** Edição do próprio cadastro: tudo opcional, senha só entra se for trocada. */
export interface FuncionarioEdicaoInput {
    nome?: string;
    idade?: number;
    tempoExperiencia?: number;
    login?: string;
    senha?: string;
}

/** @brief Credenciais enviadas ao efetuar login de funcionário. */
export interface LoginInput {
    login: string;
    senha: string;
}

/** @brief Resposta do login: funcionário autenticado e a rota do painel correspondente ao seu cargo. */
export interface LoginResponse {
    funcionario: Funcionario;
    rota: string;
}

/** @brief Rótulo em português exibido para cada cargo. */
export const PROFISSAO_LABEL: Record<Profissao, string> = {
    cozinheiro: 'Cozinheiro(a)',
    garcom: 'Garçom / Garçonete',
    entregador: 'Entregador(a)',
    gerente: 'Gerente',
};

/** @brief Rota do painel para onde cada cargo é redirecionado após o login. */
export const PROFISSAO_ROTA: Record<Profissao, string> = {
    cozinheiro: '/admin/cozinha',
    garcom: '/admin/balcao',
    entregador: '/admin/entrega',
    gerente: '/admin/gerente',
};
