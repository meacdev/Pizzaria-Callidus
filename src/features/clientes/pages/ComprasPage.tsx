/**
 * @file ComprasPage.tsx
 * @brief Página "Minhas compras" (rota /compras): histórico de pedidos do cliente logado.
 *
 * @details
 * Protegida por @see ClienteAutenticadoRoute (definida em router.tsx) —
 * quem não está logado é redirecionado para /usuario antes de chegar
 * aqui. Página multi-idioma (@see LocaleContext); as datas são formatadas
 * no idioma atual e os rótulos de status vêm do dicionário de traduções.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useClienteAuth } from '../context/ClienteAuthContext';
import { listarComprasCliente } from '../api/cliente.service';
import { useLocale } from '../../../i18n/LocaleContext';
import type { PedidoApi } from '../../pizzaria/api/pedido.service';

/** @brief Formata um timestamp ISO na data/hora curta do idioma informado. */
function formatarData(data: string, localeIntl: string) {
    return new Intl.DateTimeFormat(localeIntl, { dateStyle: 'short', timeStyle: 'short' }).format(new Date(data));
}

/** @brief Formata um valor em reais (BRL) — a moeda não muda com o idioma, só o texto ao redor. */
function formatarPreco(valor: number) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}

/** @brief Reduz um id de pedido (UUID) às 8 primeiras posições, em maiúsculas, para exibição. */
function idCurto(id: string) {
    return id.slice(0, 8).toUpperCase();
}

/** @brief Página com o histórico de compras do cliente autenticado. */
export function ComprasPage() {
    const { cliente } = useClienteAuth();
    const { t, localeIntl } = useLocale();
    const [compras, setCompras] = useState<PedidoApi[] | null>(null);
    const [erro, setErro] = useState('');

    useEffect(() => {
        if (!cliente) return;

        listarComprasCliente(cliente.id)
            .then(setCompras)
            .catch((e) => setErro(e instanceof Error ? e.message : 'Não foi possível carregar suas compras.'));
    }, [cliente]);

    return (
        <>
            <main className="principal cabecalho-pagina">
                <span className="tag">{t('compras.tag')}</span>
                <h1>{t('compras.titulo')}</h1>
                <p>{t('compras.subtitulo')}</p>
            </main>

            <div className="principal usuario-layout">
                {erro && <span className="erro-campo" role="alert">{erro}</span>}

                {!compras ? (
                    <p>{t('compras.carregando')}</p>
                ) : compras.length === 0 ? (
                    <div className="estado" role="status">
                        <h2>{t('compras.vazioTitulo')}</h2>
                        <p>{t('compras.vazioTexto')}</p>
                        <div className="acoes-pagina">
                            <Link className="botao-primario" to="/cardapio">{t('compras.vazioBotao')}</Link>
                        </div>
                    </div>
                ) : (
                    <div className="compras-lista">
                        {compras.map((pedido) => (
                            <article key={pedido.pedidoId} className="compra-card">
                                <div className="compra-card-topo">
                                    <span className="compra-card-id">Pedido #{idCurto(pedido.pedidoId)}</span>
                                    <span className="compra-card-status">
                                        {t(`compras.status.${pedido.status}`)}
                                    </span>
                                </div>
                                <p className="compra-card-itens">
                                    {pedido.itens.map((item) => `${item.quantidade}x ${item.nome}`).join(', ')}
                                </p>
                                <div className="compra-card-rodape">
                                    <span>{t('compras.feitoEm', { data: formatarData(pedido.criadoEm, localeIntl) })}</span>
                                    <span className="compra-card-total">{formatarPreco(pedido.total)}</span>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
