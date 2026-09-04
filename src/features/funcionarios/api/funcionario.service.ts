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

async function tratarResposta<T>(resposta: Response): Promise<T> {
    const dados = await resposta.json().catch(() => null);

    if (!resposta.ok) {
        const mensagem = (dados as ErroApi | null)?.erro ?? 'Não foi possível completar a operação.';
        throw new Error(mensagem);
    }

    return dados as T;
}

export async function autenticarFuncionario(dados: LoginInput): Promise<LoginResponse> {
    const resposta = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
    });

    return tratarResposta<LoginResponse>(resposta);
}

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
