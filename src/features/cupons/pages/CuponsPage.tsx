/**
 * @file CuponsPage.tsx
 * @brief Página pública com todos os cupons de desconto ativos da loja (rota /cupons).
 *
 * @details
 * Diferente do carrossel da home (@see CarrosselCupons, que mostra só um
 * resumo), esta página lista todos os cupons ativos com a descrição
 * completa e um botão de copiar código — pensada para quem chegou direto
 * pelo link do cabeçalho.
 */
import { useState } from 'react';
import { Link } from 'react-router';
import { useCupomStore } from '../../../store/cupom.store';
import { cupomDisponivel, formatarDescontoCupom } from '../utils/cupom.utils';

/** @brief Página com a lista completa de cupons de desconto disponíveis. */
export function CuponsPage() {
    const cupons = useCupomStore((state) => state.cupons);
    const cuponsDisponiveis = cupons.filter((cupom) => cupomDisponivel(cupom));
    const [codigoCopiado, setCodigoCopiado] = useState<string | null>(null);

    /** @brief Copia o código de um cupom para a área de transferência e mostra a confirmação por 2 segundos. */
    async function copiarCodigo(codigo: string) {
        try {
            await navigator.clipboard.writeText(codigo);
            setCodigoCopiado(codigo);
            setTimeout(() => setCodigoCopiado((atual) => (atual === codigo ? null : atual)), 2000);
        } catch {
            // Área de transferência indisponível (ex.: navegador sem permissão) — sem tratamento especial, o código já fica visível no card.
        }
    }

    return (
        <>
            <main className="principal cabecalho-pagina">
                <span className="tag">Cupons</span>
                <h1>Cupons de desconto</h1>
                <p>Use um dos códigos abaixo no checkout para garantir seu desconto.</p>
            </main>

            <div className="principal usuario-layout">
                {cuponsDisponiveis.length === 0 ? (
                    <div className="estado" role="status">
                        <h2>Nenhum cupom disponível no momento</h2>
                        <p>Volte mais tarde — a loja pode liberar novos cupons a qualquer momento.</p>
                        <div className="acoes-pagina">
                            <Link className="botao-primario" to="/cardapio">Ver cardápio</Link>
                        </div>
                    </div>
                ) : (
                    <div className="compras-lista">
                        {cuponsDisponiveis.map((cupom) => (
                            <article key={cupom.id} className="card-cupom card-cupom-pagina">
                                <span className="card-cupom-desconto">{formatarDescontoCupom(cupom)}</span>
                                <strong className="card-cupom-titulo">{cupom.titulo}</strong>
                                <p className="card-cupom-descricao">{cupom.descricao}</p>
                                {cupom.validoAte && (
                                    <p className="card-cupom-validade">
                                        Válido até {new Date(`${cupom.validoAte}T00:00:00`).toLocaleDateString('pt-BR')}
                                    </p>
                                )}
                                <button
                                    type="button"
                                    className="botao-secundario"
                                    onClick={() => copiarCodigo(cupom.codigo)}
                                >
                                    {codigoCopiado === cupom.codigo ? 'Copiado!' : `Copiar código ${cupom.codigo}`}
                                </button>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
