/**
 * @file CarrosselCupons.tsx
 * @brief Carrossel horizontal de cupons de desconto ativos, exibido na home.
 *
 * @details
 * Lê os cupons da store (@see cupom.store), filtra os disponíveis agora
 * (@see cupomDisponivel) e não renderiza nada se não houver nenhum — a
 * loja pode simplesmente não ter cupons ativos no momento. A lista
 * completa (incluindo os fora de validade) fica na página @see CuponsPage,
 * acessível pelo link "Ver todos" e pela rota /cupons no cabeçalho.
 */
import { Link } from 'react-router';
import { useCupomStore } from '../../../store/cupom.store';
import { cupomDisponivel, formatarDescontoCupom } from '../../cupons/utils/cupom.utils';

/** @brief Carrossel horizontal com os cupons de desconto atualmente disponíveis. */
export function CarrosselCupons() {
  const cupons = useCupomStore((state) => state.cupons);
  const cuponsDisponiveis = cupons.filter((cupom) => cupomDisponivel(cupom));

  if (cuponsDisponiveis.length === 0) {
    return null;
  }

  return (
    <section className="principal-secao-pizzas">
      <div className="titulo-secao">
        <h2>🎟️ Cupons de desconto</h2>
        <Link to="/cupons" className="link-leia-mais">
          Ver todos
        </Link>
      </div>

      <div className="carrossel-cupons">
        {cuponsDisponiveis.map((cupom) => (
          <article className="card-cupom" key={cupom.id}>
            <span className="card-cupom-desconto">{formatarDescontoCupom(cupom)}</span>
            <strong className="card-cupom-titulo">{cupom.titulo}</strong>
            <p className="card-cupom-descricao">{cupom.descricao}</p>
            <span className="card-cupom-codigo">{cupom.codigo}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
