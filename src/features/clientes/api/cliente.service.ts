import type {
    Cliente,
    ClienteCadastroInput,
    ClienteEdicaoInput,
    LoginClienteInput,
    LoginClienteResponse,
} from '../types/cliente';
import type { PedidoApi } from '../../pizzaria/api/pedido.service';

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

export async function autenticarCliente(dados: LoginClienteInput): Promise<LoginClienteResponse> {
    const resposta = await fetch(`${BASE_URL}/auth/login-cliente`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
    });

    return tratarResposta<LoginClienteResponse>(resposta);
}

export async function cadastrarCliente(dados: ClienteCadastroInput): Promise<Cliente> {
    const resposta = await fetch(`${BASE_URL}/clientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
    });

    return tratarResposta<Cliente>(resposta);
}

export async function atualizarCliente(id: number, dados: ClienteEdicaoInput): Promise<Cliente> {
    const resposta = await fetch(`${BASE_URL}/clientes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
    });

    return tratarResposta<Cliente>(resposta);
}

export async function listarComprasCliente(id: number): Promise<PedidoApi[]> {
    const resposta = await fetch(`${BASE_URL}/clientes/${id}/pedidos`);
    return tratarResposta<PedidoApi[]>(resposta);
}
