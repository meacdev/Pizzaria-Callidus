export interface ItemResumoPedido {
  readonly id: string;
  readonly nome: string;
  readonly precoUnitario: number;
  readonly quantidade: number;
}

interface ResumoPedidoProps {
  readonly itens: readonly ItemResumoPedido[];
  readonly total: number;
}

function formatarPreco(preco: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(preco);
}

export function ResumoPedido({ itens, total }: ResumoPedidoProps) {
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
      <div className="resumo-pedido-total">
        <span>Total</span>
        <strong>{formatarPreco(total)}</strong>
      </div>
    </aside>
  );
}
