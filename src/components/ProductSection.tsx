import "./ProductSection.css";

import {
  ProductCard,
  type Produto,
} from "./ProductCard";

interface ProductSectionProps {
  titulo: string;
  produtos: Produto[];
}

export function ProductSection({
  titulo,
  produtos,
}: ProductSectionProps) {
  return (
    <section className="product-section">

      <h2>{titulo}</h2>

      <div className="product-grid">
        {produtos.map((produto) => (
          <ProductCard
            key={produto.id}
            produto={produto}
          />
        ))}
      </div>

    </section>
  );
}