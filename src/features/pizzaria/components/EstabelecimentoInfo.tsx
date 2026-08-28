import { useEffect, useState } from 'react';
import { useCustomizationStore } from '../../../context/customization.store';
import { DIAS_SEMANA_ORDEM, DIA_SEMANA_LABEL } from '../../../features/admin/types/customization';

interface EstabelecimentoInfoProps {
  readonly aberto: boolean;
  readonly onFechar: () => void;
  readonly logo: string;
}

type Aba = 'sobre' | 'horario' | 'pagamento';

export function EstabelecimentoInfo({ aberto, onFechar, logo }: EstabelecimentoInfoProps) {
  const customization = useCustomizationStore((state) => state.customization);
  const [abaSelecionada, setAbaSelecionada] = useState<Aba>('sobre');

  useEffect(() => {
    if (!aberto) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onFechar();
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [aberto, onFechar]);

  if (!aberto) return null;

  const formasAtivas = [
    customization.formasPagamento.pix && { icone: 'PIX', titulo: 'PIX', desc: 'Pagamento via PIX' },
    customization.formasPagamento.cartao && { icone: '💳', titulo: 'Cartão', desc: 'Crédito e débito' },
    customization.formasPagamento.dinheiro && { icone: '💵', titulo: 'Dinheiro', desc: 'Pagamento em dinheiro' },
  ].filter(Boolean) as { icone: string; titulo: string; desc: string }[];

  return (
    <div className="estabelecimento-overlay" onClick={onFechar} role="presentation">
      <section
        className="estabelecimento-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-estabelecimento"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="estabelecimento-modal-header">
          <h2 id="titulo-estabelecimento">{customization.nomePizzaria}</h2>
          <button type="button" className="estabelecimento-fechar" onClick={onFechar} aria-label="Fechar informações">
            ×
          </button>
        </header>

        <nav className="estabelecimento-abas">
          <button
            type="button"
            className={`estabelecimento-aba ${abaSelecionada === 'sobre' ? 'ativa' : ''}`}
            onClick={() => setAbaSelecionada('sobre')}
          >
            SOBRE
          </button>
          <button
            type="button"
            className={`estabelecimento-aba ${abaSelecionada === 'horario' ? 'ativa' : ''}`}
            onClick={() => setAbaSelecionada('horario')}
          >
            HORÁRIO
          </button>
          <button
            type="button"
            className={`estabelecimento-aba ${abaSelecionada === 'pagamento' ? 'ativa' : ''}`}
            onClick={() => setAbaSelecionada('pagamento')}
          >
            PAGAMENTO
          </button>
        </nav>

        <div className="estabelecimento-conteudo">
          {abaSelecionada === 'sobre' && (
            <>
              <div className="estabelecimento-apresentacao">
                <div className="estabelecimento-logo">
                  <img src={logo} alt={`Logo ${customization.nomePizzaria}`} />
                </div>

                <div className="estabelecimento-descricao">
                  <p>{customization.descricaoCurta}</p>

                  {customization.instagram && (
                    <a
                      href={`https://instagram.com/${customization.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="estabelecimento-instagram"
                    >
                      @{customization.instagram.replace('@', '')}
                    </a>
                  )}
                </div>
              </div>

              <div className="estabelecimento-secao">
                <h3>Contato</h3>

                <div className="estabelecimento-contatos">
                  {customization.whatsapp && (
                    <a
                      href={`https://wa.me/${customization.whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contato-botao"
                    >
                      {customization.telefone || customization.whatsapp}
                    </a>
                  )}

                  {customization.telefone && (
                    <a href={`tel:+55${customization.telefone.replace(/\D/g, '')}`} className="contato-botao">
                      <span>☎</span>
                      {customization.telefone}
                    </a>
                  )}
                </div>
              </div>

              <div className="estabelecimento-secao">
                <h3>Endereço</h3>
                <p className="estabelecimento-endereco">{customization.endereco || 'Endereço não informado'}</p>
              </div>
            </>
          )}

          {abaSelecionada === 'horario' && (
            <div className="horarios-estabelecimento">
              {DIAS_SEMANA_ORDEM.map((dia) => {
                const h = customization.horarios[dia];
                return (
                  <div key={dia} className="horario-item">
                    <span>{DIA_SEMANA_LABEL[dia]}</span>
                    <strong>{h.ativo ? `${h.abertura} às ${h.fechamento}` : 'Fechado'}</strong>
                  </div>
                );
              })}
            </div>
          )}

          {abaSelecionada === 'pagamento' && (
            <div className="pagamentos-estabelecimento">
              <h3>Formas de pagamento</h3>

              {formasAtivas.length === 0 && <p>Nenhuma forma de pagamento configurada.</p>}

              {formasAtivas.map((forma) => (
                <div className="pagamento-item" key={forma.titulo}>
                  <span className="pagamento-icone">{forma.icone}</span>
                  <div>
                    <strong>{forma.titulo}</strong>
                    <p>{forma.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}