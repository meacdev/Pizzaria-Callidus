import { useMemo } from 'react';
import { usePedidoStore, type StatusPedido } from '../../../store/pedido.store';

export function usePedidosAdmin() {
    const pedidos = usePedidoStore((state) => state.pedidos);
    const atualizarStatusPedido = usePedidoStore((state) => state.atualizarStatusPedido);

    const pedidosRecebidos = useMemo(
        () =>
            [...pedidos].sort(
                (a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime(),
            ),
        [pedidos],
    );

    const atualizarStatus = (id: string, status: StatusPedido) => {
        atualizarStatusPedido(id, status);
    };

    return { pedidos: pedidosRecebidos, atualizarStatus };
}
