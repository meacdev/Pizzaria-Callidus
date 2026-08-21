export interface Produto {
  id: number;
  nome: string;
  preco: string;
  imagem?: string;
}

interface ProductCardProps {
  produto: Produto;
}

export function ProductCard({ produto }: ProductCardProps) {
  return (
    <article className="produto-card">

      <div className="produto-imagem">
        {produto.imagem && (
          <img
            src={produto.imagem}
            alt={produto.nome}
          />
        )}
      </div>

      <div className="produto-info">
        <h3>{produto.nome}</h3>

        <p>{produto.preco}</p>
      </div>

    </article>
  );
}