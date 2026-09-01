import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { MensagemErro } from '../../../component/MensagemErro';
import { usePedidoStore } from '../../../store/pedido.store';
import { ResumoPedido } from '../components/ResumoPedido';
import { FORMAS_PAGAMENTO, type FormaPagamento } from '../types/checkout';
import {
  DADOS_CARTAO_INICIAIS,
  OPCOES_PARCELAS,
  type DadosCartao,
  type EstadoPagamento,
  type ErrosCartao,
} from '../types/pagamento';
import type { PedidoPayload } from '../types/pedidoPayload';
import {
  gerarCodigoPixCopiaCola,
  gerarUrlQrCodePix,
  mascararCvv,
  mascararNumeroCartao,
  mascararValidadeCartao,
  montarInfoPagamentoSimulado,
  simularProcessamentoPagamento,
  validarDadosCartao,
} from '../utils/pagamento.utils';
import { gerarPedidoPayload } from '../utils/pedido.utils';
import { useCustomizationStore } from '../../../context/customization.store';

const DURACAO_PIX_SEGUNDOS = 5 * 60;

function formatarPreco(preco: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(preco);
}

function formatarTempo(segundos: number): string {
  const minutos = Math.floor(segundos / 60);
  const resto = segundos % 60;
  return `${String(minutos).padStart(2, '0')}:${String(resto).padStart(2, '0')}`;
}

export function PagamentoPage() {
  const pedido = usePedidoStore((state) => state.pedido);
  const limparPedido = usePedidoStore((state) => state.limparPedido);
  const customization = useCustomizationStore((state) => state.customization);

  const [estado, setEstado] = useState<EstadoPagamento>('formulario');
  const [dadosCartao, setDadosCartao] = useState<DadosCartao>(DADOS_CARTAO_INICIAIS);
  const [errosCartao, setErrosCartao] = useState<ErrosCartao>({});
  const [pixCopiado, setPixCopiado] = useState(false);
  const [segundosRestantes, setSegundosRestantes] = useState(DURACAO_PIX_SEGUNDOS);
  const [payloadGerado, setPayloadGerado] = useState<PedidoPayload | null>(null);

  const forma: FormaPagamento = (pedido?.dados.formaPagamento || 'dinheiro') as FormaPagamento;
  const formaPagamentoInfo = FORMAS_PAGAMENTO.find((item) => item.valor === forma);

  const codigoPix = useMemo(() => {
    if (!pedido || forma !== 'pix') return '';
    return gerarCodigoPixCopiaCola(pedido.criadoEm, pedido.total);
  }, [pedido, forma]);

  useEffect(() => {
    if (estado !== 'formulario' || forma !== 'pix') return;

    if (segundosRestantes <= 0) return;

    const intervalo = setInterval(() => {
      setSegundosRestantes((atual) => Math.max(0, atual - 1));
    }, 1000);

    return () => clearInterval(intervalo);
  }, [estado, forma, segundosRestantes]);

  if (!pedido) {
    return (
      <MensagemErro
        titulo="Nenhum pedido em andamento"
        mensagem="Finalize o checkout para ver esta página."
      />
    );
  }

  function limparErroCartao(campo: keyof DadosCartao) {
    setErrosCartao((atuais) => {
      if (!(campo in atuais)) return atuais;
      const { [campo as keyof ErrosCartao]: _removido, ...resto } = atuais;
      return resto;
    });
  }

  function atualizarCampoCartao<K extends keyof DadosCartao>(campo: K, valor: DadosCartao[K]) {
    setDadosCartao((atuais) => ({ ...atuais, [campo]: valor }));
    limparErroCartao(campo);
  }

  async function processarPagamento(dadosCartaoConfirmados?: DadosCartao) {
    if (!pedido) return;

    setEstado('processando');

    await simularProcessamentoPagamento();

    const infoPagamento = montarInfoPagamentoSimulado(forma, {
      pedidoId: pedido.criadoEm,
      total: pedido.total,
      dadosCartao: dadosCartaoConfirmados,
      trocoPara: pedido.dados.trocoPara,
    });

    const payload = gerarPedidoPayload(pedido, infoPagamento);

    console.log('[pagamento] JSON do pedido gerado:', payload);

    setPayloadGerado(payload);
    setEstado('sucesso');
  }

  function handleSubmitCartao(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    const errosEncontrados = validarDadosCartao(dadosCartao);
    setErrosCartao(errosEncontrados);

    if (Object.keys(errosEncontrados).length > 0) return;

    void processarPagamento(dadosCartao);
  }

  function handleConfirmarPix() {
    void processarPagamento();
  }

  function handleConfirmarDinheiro() {
    void processarPagamento();
  }

  async function copiarCodigoPix() {
    try {
      await navigator.clipboard.writeText(codigoPix);
      setPixCopiado(true);
      setTimeout(() => setPixCopiado(false), 2000);
    } catch {
      setPixCopiado(false);
    }
  }

  function handleFinalizar() {
    limparPedido();
  }

  const itensResumo = pedido.itens.map((item) => ({
    id: item.id,
    nome: item.nome,
    precoUnitario: item.precoUnitario,
    quantidade: item.quantidade,
  }));

  return (
    <>
      <main className="principal cabecalho-pagina">
        <span className="tag">Pagamento</span>
        <h1>
          {estado === 'sucesso' ? 'Pedido confirmado!' : `Pagamento via ${formaPagamentoInfo?.rotulo ?? forma}`}
        </h1>
        {estado === 'formulario' && (
          <p>Essa é uma simulação de pagamento — nenhum dado é enviado a nenhum serviço externo.</p>
        )}
      </main>

      <div className="principal checkout-layout">
        <div className="pagamento-conteudo">
          {estado === 'sucesso' && payloadGerado && (
            <section className="pagamento-sucesso">
              <div className="pagamento-sucesso-icone" aria-hidden="true">✓</div>
              <h2>Pagamento confirmado</h2>
              <p>
                Pagamento via <strong>{formaPagamentoInfo?.rotulo ?? forma}</strong> simulado com sucesso.
              </p>
              <p className="pagamento-id">Pedido nº {payloadGerado.pedidoId}</p>

              <div className="acoes-pagina">
                <Link className="botao-secundario" to={`/pedido/${pedido.id}`}>
                  Acompanhar pedido
                </Link>
                <Link className="botao-primario" to="/" onClick={handleFinalizar}>
                  Voltar ao início
                </Link>
              </div>
            </section>
          )}

          {estado === 'formulario' && forma === 'pix' && (
            <section className="pagamento-pix">
              <div className="pagamento-pix-qrcode">
                <img
                  src={gerarUrlQrCodePix(codigoPix)}
                  alt="QR Code do Pix (simulado)"
                  width={200}
                  height={200}
                />
              </div>
              <p className="pagamento-pix-instrucao">
                Escaneie o QR Code com o app do seu banco ou copie o código abaixo.
              </p>

              <code className="pagamento-pix-codigo">{codigoPix}</code>

              <div className="acoes-pagina">
                <button type="button" className="botao-secundario" onClick={copiarCodigoPix}>
                  {pixCopiado ? 'Código copiado!' : 'Copiar código'}
                </button>
                <button type="button" className="botao-primario" onClick={handleConfirmarPix}>
                  Já paguei
                </button>
              </div>

              <p className="pagamento-pix-timer">
                {segundosRestantes > 0
                  ? `Esse código expira em ${formatarTempo(segundosRestantes)}`
                  : 'Código expirado. Você ainda pode confirmar o pagamento simulado abaixo.'}
              </p>
            </section>
          )}

          {estado === 'formulario' && forma === 'cartao' && (
            <form className="formulario-checkout" onSubmit={handleSubmitCartao} noValidate>
              <fieldset className="grupo-formulario">
                <legend>Dados do cartão</legend>

                <div className="campo-formulario">
                  <label htmlFor="pagamento-numero">Número do cartão</label>
                  <input
                    id="pagamento-numero"
                    type="text"
                    inputMode="numeric"
                    placeholder="0000 0000 0000 0000"
                    autoComplete="cc-number"
                    value={dadosCartao.numero}
                    onChange={(e) => atualizarCampoCartao('numero', mascararNumeroCartao(e.target.value))}
                    aria-invalid={Boolean(errosCartao.numero)}
                    aria-describedby={errosCartao.numero ? 'pagamento-numero-erro' : undefined}
                  />
                  {errosCartao.numero && (
                    <span id="pagamento-numero-erro" className="erro-campo">{errosCartao.numero}</span>
                  )}
                </div>

                <div className="campo-formulario">
                  <label htmlFor="pagamento-nome">Nome impresso no cartão</label>
                  <input
                    id="pagamento-nome"
                    type="text"
                    autoComplete="cc-name"
                    placeholder="Como está escrito no cartão"
                    value={dadosCartao.nomeImpresso}
                    onChange={(e) => atualizarCampoCartao('nomeImpresso', e.target.value)}
                    aria-invalid={Boolean(errosCartao.nomeImpresso)}
                    aria-describedby={errosCartao.nomeImpresso ? 'pagamento-nome-erro' : undefined}
                  />
                  {errosCartao.nomeImpresso && (
                    <span id="pagamento-nome-erro" className="erro-campo">{errosCartao.nomeImpresso}</span>
                  )}
                </div>

                <div className="grade-formulario">
                  <div className="campo-formulario">
                    <label htmlFor="pagamento-validade">Validade</label>
                    <input
                      id="pagamento-validade"
                      type="text"
                      inputMode="numeric"
                      placeholder="MM/AA"
                      autoComplete="cc-exp"
                      value={dadosCartao.validade}
                      onChange={(e) => atualizarCampoCartao('validade', mascararValidadeCartao(e.target.value))}
                      aria-invalid={Boolean(errosCartao.validade)}
                      aria-describedby={errosCartao.validade ? 'pagamento-validade-erro' : undefined}
                    />
                    {errosCartao.validade && (
                      <span id="pagamento-validade-erro" className="erro-campo">{errosCartao.validade}</span>
                    )}
                  </div>

                  <div className="campo-formulario">
                    <label htmlFor="pagamento-cvv">CVV</label>
                    <input
                      id="pagamento-cvv"
                      type="text"
                      inputMode="numeric"
                      placeholder="000"
                      autoComplete="cc-csc"
                      value={dadosCartao.cvv}
                      onChange={(e) => atualizarCampoCartao('cvv', mascararCvv(e.target.value))}
                      aria-invalid={Boolean(errosCartao.cvv)}
                      aria-describedby={errosCartao.cvv ? 'pagamento-cvv-erro' : undefined}
                    />
                    {errosCartao.cvv && (
                      <span id="pagamento-cvv-erro" className="erro-campo">{errosCartao.cvv}</span>
                    )}
                  </div>

                  <div className="campo-formulario">
                    <label htmlFor="pagamento-parcelas">Parcelas</label>
                    <select
                      id="pagamento-parcelas"
                      value={dadosCartao.parcelas}
                      onChange={(e) => atualizarCampoCartao('parcelas', Number(e.target.value))}
                    >
                      {OPCOES_PARCELAS.map((parcela) => (
                        <option key={parcela} value={parcela}>
                          {parcela}x de {formatarPreco(pedido.total / parcela)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </fieldset>

              <div className="acoes-pagina">
                <Link className="botao-secundario" to="/checkout">Voltar ao checkout</Link>
                <button type="submit" className="botao-primario">
                  Pagar {formatarPreco(pedido.total)}
                </button>
              </div>
            </form>
          )}

          {estado === 'formulario' && forma === 'dinheiro' && (
            <section className="pagamento-dinheiro">
              <p>Você escolheu pagar em dinheiro na entrega.</p>
              <p>
                Valor a pagar ao entregador: <strong>{formatarPreco(pedido.total)}</strong>
              </p>
              {pedido.dados.trocoPara && (
                <p>
                  Troco para: <strong>{pedido.dados.trocoPara}</strong>
                </p>
              )}
              <div className="acoes-pagina">
                <Link className="botao-secundario" to="/checkout">Voltar ao checkout</Link>
                <button type="button" className="botao-primario" onClick={handleConfirmarDinheiro}>
                  Confirmar pedido
                </button>
              </div>
            </section>
          )}

        </div>

        <ResumoPedido itens={itensResumo} total={pedido.total} taxaEntrega={customization.taxaEntrega} />
      </div>
    </>
  );
}