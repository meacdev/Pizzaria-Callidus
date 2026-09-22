/**
 * @file ResumoPedido.tsx
 * @brief Resumo lateral de um pedido: lista de itens, taxa de entrega, gorjeta e total.
 */

/** @brief Item exibido no resumo do pedido (versão simplificada de um item do carrinho). */
export interface ItemResumoPedido {
  readonly id: string;
  readonly nome: string;
  readonly precoUnitario: number;
  readonly quantidade: number;
}

interface ResumoPedidoProps {
  readonly itens: readonly ItemResumoPedido[];
  readonly total: number;
  readonly taxaEntrega?: number; // novo
  readonly gorjeta?: number;
}

/** @brief Formata um valor numérico em reais (BRL). */
function formatarPreco(preco: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(preco);
}


/** @brief Painel lateral com o resumo do pedido: itens, taxa de entrega (opcional), gorjeta (opcional) e total. */
export function ResumoPedido({ itens, total, taxaEntrega = 0, gorjeta = 0 }: ResumoPedidoProps) {
  return (
    <aside className="resumo-pedido">
      <h2>Resumo do pedido</h2>
      <ul className="resumo-pedido-itens">
        {itens.map((item) => (
          <li key={item.id}>
            <span className="resumo-pedido-item-nome">{item.quantidade}x {item.nome}</span>
            <span>{formatarPreco(item.precoUnitario * item.quantidade)}</span>
          </li>
        ))}
      </ul>
      {taxaEntrega > 0 && (
        <div className="resumo-pedido-taxa">
          <span>Taxa de entrega</span>
          <span>{formatarPreco(taxaEntrega)}</span>
        </div>
      )}
      {gorjeta > 0 && (
        <div className="resumo-pedido-taxa">
          <span>Gorjeta </span>
          <span>{formatarPreco(gorjeta)}</span>
        </div>
      )}
      <div className="resumo-pedido-total">
        <span>Total</span>
        <strong>{formatarPreco(total)}</strong>
      </div>
    </aside>
  );
}