import type { PedidoApi } from '../api/pedido.service';

/** Uma mesa pode ter várias comandas abertas ao mesmo tempo — uma por
 * cliente/grupo — cada uma paga separadamente. O caixa só libera a mesa
 * quando todas as comandas vinculadas a ela estiverem pagas. */
export type StatusComanda = 'aberta' | 'paga' | 'encerrada';

export interface ComandaApi {
    readonly id: string;
    readonly mesa: number;
    readonly status: StatusComanda;
    readonly formaPagamento: string | null;
    readonly abertaEm: string;
    readonly pagaEm: string | null;
    readonly total: number;
    readonly quantidadePedidos: number;
    readonly pedidos: readonly PedidoApi[];
}
