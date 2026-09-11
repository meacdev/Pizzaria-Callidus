/**
 * @file funcionario.service.ts
 * @brief Cliente HTTP das rotas de funcionário (/api/funcionarios, /api/auth/login): login, cadastro e edição.
 *
 * @details
 * Mesma estrutura de @see cliente.service.ts, mas para o modelo
 * Funcionario. Usado por @see FuncionarioAuthContext e pelas páginas de
 * login/cadastro/edição de funcionário.
 */
import type {
    Funcionario,
    FuncionarioCadastroInput,
    FuncionarioEdicaoInput,
    LoginInput,
    LoginResponse,
} from '../types/funcionario';

const BASE_URL = '/api';

interface ErroApi {
    erro?: string;
}

/** @brief Converte a resposta de um `fetch` em JSON tipado, lançando um erro com a mensagem da API quando a resposta não é `ok`. */
async function tratarResposta<T>(resposta: Response): Promise<T> {
    const dados = await resposta.json().catch(() => null);

    if (!resposta.ok) {
        const mensagem = (dados as ErroApi | null)?.erro ?? 'Não foi possível completar a operação.';
        throw new Error(mensagem);
    }

    return dados as T;
}

/**
 * @brief Autentica um funcionário com login e senha.
 * @param dados Login e senha do funcionário.
 * @return O funcionário autenticado e a rota do seu cargo.
 */
export async function autenticarFuncionario(dados: LoginInput): Promise<LoginResponse> {
    const resposta = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
    });

    return tratarResposta<LoginResponse>(resposta);
}

/**
 * @brief Cadastra um novo funcionário.
 * @param dados Dados do novo funcionário.
 * @return O funcionário recém-criado.
 */
export async function cadastrarFuncionario(
    dados: FuncionarioCadastroInput,
): Promise<Funcionario> {
    const resposta = await fetch(`${BASE_URL}/funcionarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
    });

    return tratarResposta<Funcionario>(resposta);
}

/**
 * @brief Atualiza o cadastro de um funcionário existente.
 * @param id Id do funcionário.
 * @param dados Campos a alterar.
 * @return O funcionário com os dados atualizados.
 */
export async function atualizarFuncionario(
    id: number,
    dados: FuncionarioEdicaoInput,
): Promise<Funcionario> {
    const resposta = await fetch(`${BASE_URL}/funcionarios/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
    });

    return tratarResposta<Funcionario>(resposta);
}
