import { useEffect, useState } from 'react';

interface EstabelecimentoInfoProps {
  readonly aberto: boolean;
  readonly onFechar: () => void;
  readonly logo: string;
}

type Aba = 'sobre' | 'horario' | 'pagamento';

const horarios = [
  { dia: 'Segunda', horario: 'Fechado' },
  { dia: 'Terça', horario: 'Fechado' },
  { dia: 'Quarta', horario: 'Fechado' },
  { dia: 'Quinta', horario: 'Fechado' },
  { dia: 'Sexta', horario: 'Fechado' },
  { dia: 'Sábado', horario: 'Fechado' },
  { dia: 'Domingo', horario: 'Fechado' },
];

export function EstabelecimentoInfo({
  aberto,
  onFechar,
  logo,
}: EstabelecimentoInfoProps) {
  const [abaSelecionada, setAbaSelecionada] = useState<Aba>('sobre');

  useEffect(() => {
    if (!aberto) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onFechar();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [aberto, onFechar]);

  if (!aberto) return null;

  return (
    <div
      className="estabelecimento-overlay"
      onClick={onFechar}
      role="presentation"
    >
      <section
        className="estabelecimento-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-estabelecimento"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="estabelecimento-modal-header">
          <h2 id="titulo-estabelecimento">
            Dom Helder Pizzaria
          </h2>

          <button
            type="button"
            className="estabelecimento-fechar"
            onClick={onFechar}
            aria-label="Fechar informações"
          >
            ×
          </button>
        </header>

        {/* ABAS */}
        <nav className="estabelecimento-abas">

          <button
            type="button"
            className={`estabelecimento-aba ${
              abaSelecionada === 'sobre' ? 'ativa' : ''
            }`}
            onClick={() => setAbaSelecionada('sobre')}
          >
            SOBRE
          </button>

          <button
            type="button"
            className={`estabelecimento-aba ${
              abaSelecionada === 'horario' ? 'ativa' : ''
            }`}
            onClick={() => setAbaSelecionada('horario')}
          >
            HORÁRIO
          </button>

          <button
            type="button"
            className={`estabelecimento-aba ${
              abaSelecionada === 'pagamento' ? 'ativa' : ''
            }`}
            onClick={() => setAbaSelecionada('pagamento')}
          >
            PAGAMENTO
          </button>

        </nav>

        <div className="estabelecimento-conteudo">

          {/* =====================================================
              ABA SOBRE
              ===================================================== */}

          {abaSelecionada === 'sobre' && (
            <>
              <div className="estabelecimento-apresentacao">

                <div className="estabelecimento-logo">
                  <img
                    src={logo}
                    alt="Logo Dom Helder Pizzaria"
                  />
                </div>

                <div className="estabelecimento-descricao">

                  <p>
                    Surpreenda-se com a melhor Pizza Artesanal de Manaus!
                  </p>

                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="estabelecimento-instagram"
                  >
                    <img className='instagram-icone' src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Instagram_logo_2022.svg/1280px-Instagram_logo_2022.svg.png?utm_source=pt.wikipedia.org&utm_campaign=index&utm_content=thumbnail" alt="" />

                    @paradasiopizzaria
                  </a>

                </div>

              </div>

              <div className="estabelecimento-secao">

                <h3>Contato</h3>

                <div className="estabelecimento-contatos">

                  <a
                    href="https://wa.me/5592991234567"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contato-botao"
                  >
                    <img className='instagram-icone' src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/WhatsApp_Logo_green.svg/250px-WhatsApp_Logo_green.svg.png?utm_source=pt.wikipedia.org&utm_campaign=parser&utm_content=thumbnail" alt="" />
                    (92) 99123-4567
                  </a>

                  <a
                    href="tel:+5592991234567"
                    className="contato-botao"
                  >
                    <span>☎</span>
                    (92) 99123-4567
                  </a>

                </div>

              </div>

              <div className="estabelecimento-secao">

                <h3>Endereço</h3>

                <p className="estabelecimento-endereco">
                  Av. Teffé, 123
                  <br />
                  Cachoeirinha, Manaus - AM
                </p>

              </div>
            </>
          )}

          {/* =====================================================
              ABA HORÁRIO
              ===================================================== */}

          {abaSelecionada === 'horario' && (
            <div className="horarios-estabelecimento">

              {horarios.map((item) => (
                <div
                  key={item.dia}
                  className="horario-item"
                >
                  <span>{item.dia}</span>

                  <strong>
                    {item.horario}
                  </strong>
                </div>
              ))}

            </div>
          )}

          {/* =====================================================
              ABA PAGAMENTO
              ===================================================== */}

          {abaSelecionada === 'pagamento' && (
            <div className="pagamentos-estabelecimento">

              <h3>Formas de pagamento</h3>

              <div className="pagamento-item">
                <span className="pagamento-icone">
                  PIX
                </span>

                <div>
                  <strong>PIX</strong>
                  <p>Pagamento via PIX</p>
                </div>
              </div>

              <div className="pagamento-item">
                <span className="pagamento-icone">
                  💳
                </span>

                <div>
                  <strong>Cartão</strong>
                  <p>
                    Crédito e débito
                  </p>
                </div>
              </div>

              <div className="pagamento-item">
                <span className="pagamento-icone">
                  💵
                </span>

                <div>
                  <strong>Dinheiro</strong>
                  <p>
                    Pagamento em dinheiro
                  </p>
                </div>
              </div>

            </div>
          )}

        </div>
      </section>
    </div>
  );
}