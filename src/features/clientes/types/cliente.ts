/**
 * Cliente cadastrado da loja (programa de fidelidade). Espelha (no
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

export interface ClienteCadastroInput {
    nome: string;
    email: string;
    telefone: string;
    cpf?: string;
    login: string;
    senha: string;
}

/** Edição do próprio cadastro: tudo opcional, senha só entra se for trocada. */
export interface ClienteEdicaoInput {
    nome?: string;
    email?: string;
    telefone?: string;
    cpf?: string;
    senha?: string;
}

export interface LoginClienteInput {
    login: string;
    senha: string;
}

export interface LoginClienteResponse {
    cliente: Cliente;
}
