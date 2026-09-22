/**
 * @file cliente.service.ts
 * @brief Cliente HTTP das rotas de cliente (/api/clientes, /api/auth/login-cliente): login, cadastro, edição e histórico de compras.
 *
 * @details
 * Espelha, no front-end, as rotas do back-end para o modelo Cliente
 * (@see cliente.ts). Usado por @see ClienteAuthContext e pelas páginas da
 * área do cliente (usuário, compras, reserva de mesa).
 */
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
 * @brief Autentica um cliente com login e senha.
 * @param dados Login e senha do cliente.
 * @return Os dados do cliente autenticado.
 */
export async function autenticarCliente(dados: LoginClienteInput): Promise<LoginClienteResponse> {
    const resposta = await fetch(`${BASE_URL}/auth/login-cliente`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
    });

    return tratarResposta<LoginClienteResponse>(resposta);
}

/**
 * @brief Cadastra um novo cliente no programa de fidelidade.
 * @param dados Dados do novo cliente.
 * @return O cliente recém-criado.
 */
export async function cadastrarCliente(dados: ClienteCadastroInput): Promise<Cliente> {
    const resposta = await fetch(`${BASE_URL}/clientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
    });

    return tratarResposta<Cliente>(resposta);
}

/**
 * @brief Atualiza o cadastro de um cliente existente.
 * @param id Id do cliente.
 * @param dados Campos a alterar (todos opcionais).
 * @return O cliente com os dados atualizados.
 */
export async function atualizarCliente(id: number, dados: ClienteEdicaoInput): Promise<Cliente> {
    const resposta = await fetch(`${BASE_URL}/clientes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
    });

    return tratarResposta<Cliente>(resposta);
}

/**
 * @brief Lista o histórico de pedidos (compras) de um cliente.
 * @param id Id do cliente.
 * @return Os pedidos do cliente.
 */
export async function listarComprasCliente(id: number): Promise<PedidoApi[]> {
    const resposta = await fetch(`${BASE_URL}/clientes/${id}/pedidos`);
    return tratarResposta<PedidoApi[]>(resposta);
}
