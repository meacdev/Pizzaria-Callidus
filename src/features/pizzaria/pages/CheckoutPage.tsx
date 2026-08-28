import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useCarrinhoStore } from '../../../store/carrinho.store';
import { usePedidoStore } from '../../../store/pedido.store';
import { ResumoPedido } from '../components/ResumoPedido';
import {
  DADOS_CHECKOUT_INICIAIS,
  ESTADOS_BRASILEIROS,
  FORMAS_PAGAMENTO,
  type CampoCheckout,
  type DadosCheckout,
  type DadosCliente,
  type EnderecoEntrega,
  type ErrosCheckout,
  type FormaPagamento,
} from '../types/checkout';
import { mascararCep, mascararTelefone, validarFormularioCheckout } from '../utils/checkout.utils';

export function CheckoutPage() {
  const navigate = useNavigate();

  const carrinho = useCarrinhoStore(
    (state) => state.itens,
  );
  const limparCarrinho = useCarrinhoStore(
    (state) => state.limparCarrinho,
  );
  const definirPedido = usePedidoStore(
    (state) => state.definirPedido,
  );
  const itensCarrinho = carrinho;
  const total = itensCarrinho.reduce(
    (soma, item) =>
      soma +
      item.precoUnitario *
      item.quantidade,
    0,
  );
  const [dados, setDados] =
    useState<DadosCheckout>(
      DADOS_CHECKOUT_INICIAIS,
    );
  const [erros, setErros] =
    useState<ErrosCheckout>({});
  function limparErro(campo: CampoCheckout) {
    setErros((atuais) => {
      if (!atuais[campo]) return atuais;
      const { [campo]: _removido, ...resto } = atuais;
      return resto;
    });
  }

  function atualizarCliente<K extends keyof DadosCliente>(campo: K, valor: DadosCliente[K]) {
    setDados((atuais) => ({ ...atuais, cliente: { ...atuais.cliente, [campo]: valor } }));
    limparErro(campo);
  }

  function atualizarEndereco<K extends keyof EnderecoEntrega>(campo: K, valor: EnderecoEntrega[K]) {
    setDados((atuais) => ({ ...atuais, endereco: { ...atuais.endereco, [campo]: valor } }));
    limparErro(campo as CampoCheckout);
  }

  function selecionarFormaPagamento(formaPagamento: FormaPagamento) {
    setDados((atuais) => ({ ...atuais, formaPagamento }));
    limparErro('formaPagamento');
  }

  function atualizarTroco(valor: string) {
    setDados((atuais) => ({ ...atuais, trocoPara: valor }));
    limparErro('trocoPara');
  }

  function focarPrimeiroErro(errosAtuais: ErrosCheckout) {
    const primeiroCampo = Object.keys(errosAtuais)[0];
    if (!primeiroCampo) return;
    document.getElementById(`checkout-${primeiroCampo}`)?.focus();
  }

  function handleSubmit(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    const errosEncontrados = validarFormularioCheckout(dados);
    setErros(errosEncontrados);

    if (Object.keys(errosEncontrados).length > 0) {
      focarPrimeiroErro(errosEncontrados);
      return;
    }

    definirPedido({
      dados,
      itens: itensCarrinho.map((item) => {
        let nome = '';
        if (item.tipo === 'pizza') {
          nome = item.pizza.nome;
        }
        if (item.tipo === 'bebida') {
          nome = item.bebida.nome;
        }
        if (item.tipo === 'combo') {
          nome = item.combo.nome;
        }
        return {
          id: item.id,
          tipo: item.tipo,
          nome,
          quantidade: item.quantidade,
          precoUnitario: item.precoUnitario,
        };
      }),
      total,
      criadoEm: new Date().toISOString(),
    });

    limparCarrinho();
    navigate('/pagamento');
  }

  if (itensCarrinho.length === 0) {
    return (
      <main className="principal cabecalho-pagina">
        <span className="tag">Checkout</span>
        <h1>Seu carrinho está vazio</h1>
        <p>Adicione pizzas ao carrinho antes de finalizar o pedido.</p>
        <div className="acoes-pagina">
          <Link className="botao-primario" to="/cardapio">Explorar cardápio</Link>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="principal cabecalho-pagina">
        <span className="tag">Finalizar pedido</span>
        <h1>Checkout</h1>
        <p>Confira seus dados, o endereço de entrega e escolha a forma de pagamento.</p>
      </main>

      <div className="principal checkout-layout">
        <form className="formulario-checkout" onSubmit={handleSubmit} noValidate>

          <fieldset className="grupo-formulario">
            <legend>Dados do cliente</legend>

            <div className="campo-formulario">
              <label htmlFor="checkout-nome">Nome completo</label>
              <input
                id="checkout-nome"
                type="text"
                autoComplete="name"
                value={dados.cliente.nome}
                onChange={(e) => atualizarCliente('nome', e.target.value)}
                aria-invalid={Boolean(erros.nome)}
                aria-describedby={erros.nome ? 'checkout-nome-erro' : undefined}
              />
              {erros.nome && <span id="checkout-nome-erro" className="erro-campo">{erros.nome}</span>}
            </div>

            <div className="grade-formulario">
              <div className="campo-formulario">
                <label htmlFor="checkout-email">E-mail</label>
                <input
                  id="checkout-email"
                  type="email"
                  autoComplete="email"
                  value={dados.cliente.email}
                  onChange={(e) => atualizarCliente('email', e.target.value)}
                  aria-invalid={Boolean(erros.email)}
                  aria-describedby={erros.email ? 'checkout-email-erro' : undefined}
                />
                {erros.email && <span id="checkout-email-erro" className="erro-campo">{erros.email}</span>}
              </div>

              <div className="campo-formulario">
                <label htmlFor="checkout-telefone">Telefone</label>
                <input
                  id="checkout-telefone"
                  type="tel"
                  inputMode="tel"
                  placeholder="(00) 00000-0000"
                  autoComplete="tel"
                  value={dados.cliente.telefone}
                  onChange={(e) => atualizarCliente('telefone', mascararTelefone(e.target.value))}
                  aria-invalid={Boolean(erros.telefone)}
                  aria-describedby={erros.telefone ? 'checkout-telefone-erro' : undefined}
                />
                {erros.telefone && <span id="checkout-telefone-erro" className="erro-campo">{erros.telefone}</span>}
              </div>
            </div>
          </fieldset>

          <fieldset className="grupo-formulario">
            <legend>Endereço de entrega</legend>

            <div className="grade-formulario grade-formulario-endereco">
              <div className="campo-formulario">
                <label htmlFor="checkout-cep">CEP</label>
                <input
                  id="checkout-cep"
                  type="text"
                  inputMode="numeric"
                  placeholder="00000-000"
                  autoComplete="postal-code"
                  value={dados.endereco.cep}
                  onChange={(e) => atualizarEndereco('cep', mascararCep(e.target.value))}
                  aria-invalid={Boolean(erros.cep)}
                  aria-describedby={erros.cep ? 'checkout-cep-erro' : undefined}
                />
                {erros.cep && <span id="checkout-cep-erro" className="erro-campo">{erros.cep}</span>}
              </div>

              <div className="campo-formulario campo-formulario-largo">
                <label htmlFor="checkout-rua">Rua / Avenida</label>
                <input
                  id="checkout-rua"
                  type="text"
                  autoComplete="address-line1"
                  value={dados.endereco.rua}
                  onChange={(e) => atualizarEndereco('rua', e.target.value)}
                  aria-invalid={Boolean(erros.rua)}
                  aria-describedby={erros.rua ? 'checkout-rua-erro' : undefined}
                />
                {erros.rua && <span id="checkout-rua-erro" className="erro-campo">{erros.rua}</span>}
              </div>

              <div className="campo-formulario">
                <label htmlFor="checkout-numero">Número</label>
                <input
                  id="checkout-numero"
                  type="text"
                  inputMode="numeric"
                  value={dados.endereco.numero}
                  onChange={(e) => atualizarEndereco('numero', e.target.value)}
                  aria-invalid={Boolean(erros.numero)}
                  aria-describedby={erros.numero ? 'checkout-numero-erro' : undefined}
                />
                {erros.numero && <span id="checkout-numero-erro" className="erro-campo">{erros.numero}</span>}
              </div>

              <div className="campo-formulario">
                <label htmlFor="checkout-complemento">Complemento (opcional)</label>
                <input
                  id="checkout-complemento"
                  type="text"
                  autoComplete="address-line2"
                  value={dados.endereco.complemento}
                  onChange={(e) => atualizarEndereco('complemento', e.target.value)}
                />
              </div>

              <div className="campo-formulario">
                <label htmlFor="checkout-bairro">Bairro</label>
                <input
                  id="checkout-bairro"
                  type="text"
                  value={dados.endereco.bairro}
                  onChange={(e) => atualizarEndereco('bairro', e.target.value)}
                  aria-invalid={Boolean(erros.bairro)}
                  aria-describedby={erros.bairro ? 'checkout-bairro-erro' : undefined}
                />
                {erros.bairro && <span id="checkout-bairro-erro" className="erro-campo">{erros.bairro}</span>}
              </div>

              <div className="campo-formulario">
                <label htmlFor="checkout-cidade">Cidade</label>
                <input
                  id="checkout-cidade"
                  type="text"
                  autoComplete="address-level2"
                  value={dados.endereco.cidade}
                  onChange={(e) => atualizarEndereco('cidade', e.target.value)}
                  aria-invalid={Boolean(erros.cidade)}
                  aria-describedby={erros.cidade ? 'checkout-cidade-erro' : undefined}
                />
                {erros.cidade && <span id="checkout-cidade-erro" className="erro-campo">{erros.cidade}</span>}
              </div>

              <div className="campo-formulario">
                <label htmlFor="checkout-estado">Estado</label>
                <select
                  id="checkout-estado"
                  autoComplete="address-level1"
                  value={dados.endereco.estado}
                  onChange={(e) => atualizarEndereco('estado', e.target.value)}
                  aria-invalid={Boolean(erros.estado)}
                  aria-describedby={erros.estado ? 'checkout-estado-erro' : undefined}
                >
                  <option value="">Selecione</option>
                  {ESTADOS_BRASILEIROS.map((estado) => (
                    <option key={estado.sigla} value={estado.sigla}>{estado.nome}</option>
                  ))}
                </select>
                {erros.estado && <span id="checkout-estado-erro" className="erro-campo">{erros.estado}</span>}
              </div>
            </div>
          </fieldset>

          <fieldset className="grupo-formulario">
            <legend>Forma de pagamento</legend>

            <div className="opcoes-pagamento" role="radiogroup" aria-describedby={erros.formaPagamento ? 'checkout-formaPagamento-erro' : undefined}>
              {FORMAS_PAGAMENTO.map((forma) => (
                <label
                  key={forma.valor}
                  className={`opcao-pagamento ${dados.formaPagamento === forma.valor ? 'opcao-pagamento-selecionada' : ''}`}
                  htmlFor={`checkout-pagamento-${forma.valor}`}
                >
                  <input
                    id={`checkout-pagamento-${forma.valor}`}
                    type="radio"
                    name="formaPagamento"
                    value={forma.valor}
                    checked={dados.formaPagamento === forma.valor}
                    onChange={() => selecionarFormaPagamento(forma.valor)}
                  />
                  <span className="opcao-pagamento-rotulo">{forma.rotulo}</span>
                  <span className="opcao-pagamento-descricao">{forma.descricao}</span>
                </label>
              ))}
            </div>
            {erros.formaPagamento && <span id="checkout-formaPagamento-erro" className="erro-campo">{erros.formaPagamento}</span>}

            {dados.formaPagamento === 'dinheiro' && (
              <div className="campo-formulario campo-troco">
                <label htmlFor="checkout-trocoPara">Troco para quanto? (opcional)</label>
                <input
                  id="checkout-trocoPara"
                  type="text"
                  inputMode="decimal"
                  placeholder="Ex: 50,00"
                  value={dados.trocoPara}
                  onChange={(e) => atualizarTroco(e.target.value)}
                  aria-invalid={Boolean(erros.trocoPara)}
                  aria-describedby={erros.trocoPara ? 'checkout-trocoPara-erro' : undefined}
                />
                {erros.trocoPara && <span id="checkout-trocoPara-erro" className="erro-campo">{erros.trocoPara}</span>}
              </div>
            )}
          </fieldset>

          <fieldset className="grupo-formulario">
            <legend>Observações (opcional)</legend>
            <div className="campo-formulario">
              <label htmlFor="checkout-observacoes">Alguma instrução para a entrega?</label>
              <textarea
                id="checkout-observacoes"
                rows={3}
                placeholder="Ex: sem cebola, interfone quebrado, ponto de referência..."
                value={dados.observacoes}
                onChange={(e) => setDados((atuais) => ({ ...atuais, observacoes: e.target.value }))}
              />
            </div>
          </fieldset>

          <div className="acoes-pagina">
            <Link className="botao-secundario" to="/carrinho">Voltar ao carrinho</Link>
            <button type="submit" className="botao-primario">Continuar para pagamento</button>
          </div>
        </form>

        <ResumoPedido
          itens={itensCarrinho.map((item) => {
            let nome = '';

            if (item.tipo === 'pizza') {
              nome = item.pizza.nome;
            }

            if (item.tipo === 'bebida') {
              nome = item.bebida.nome;
            }

            if (item.tipo === 'combo') {
              nome = item.combo.nome;
            }

            return {
              id: item.id,
              nome,
              precoUnitario: item.precoUnitario,
              quantidade: item.quantidade,
            };
          })}
          total={total}
        />
      </div>
    </>
  );
}
