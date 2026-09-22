/**
 * @file cliente.ts
 * @brief Tipos do cliente cadastrado (programa de fidelidade) e dos payloads de cadastro, edição e login.
 */

/**
 * @brief Cliente cadastrado da loja (programa de fidelidade). Espelha (no
 * front-end) o modelo Cliente do back-end (server/models.py) — totalmente
 * separado do Funcionario: um cliente nunca acessa as rotas /admin, só a
 * área /usuario e o checkout do site.
 */
export interface Cliente {
    id: number;
    nome: string;
    email: string;
    telefone: string;
    cpf: string | null;
    login: string;
    pontosFidelidade: number;
}

/** @brief Dados necessários para cadastrar um novo cliente. */
export interface ClienteCadastroInput {
    nome: string;
    email: string;
    telefone: string;
    cpf?: string;
    login: string;
    senha: string;
}

/** @brief Edição do próprio cadastro: tudo opcional, senha só entra se for trocada. */
export interface ClienteEdicaoInput {
    nome?: string;
    email?: string;
    telefone?: string;
    cpf?: string;
    senha?: string;
}

/** @brief Credenciais de login do cliente. */
export interface LoginClienteInput {
    login: string;
    senha: string;
}

/** @brief Resposta da autenticação do cliente. */
export interface LoginClienteResponse {
    cliente: Cliente;
}
