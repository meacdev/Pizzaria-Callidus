/**
 * @file CampoCupons.tsx
 * @brief Editor de cupons de desconto, usado na seção "Cupons" da customização da loja.
 *
 * @details
 * Diferente dos demais campos de @see CustomizationPage (que fazem parte
 * do formulário react-hook-form e só salvam ao clicar em "Salvar
 * alterações"), os cupons têm sua própria store (@see cupom.store) e cada
 * alteração aqui é salva imediatamente — igual ao restante da loja
 * (@see customization.store, @see pizza.service), os cupons também
 * persistem só em localStorage, sem passar pelo backend.
 */
import { useCupomStore } from '../../../store/cupom.store';
import type { Cupom, TipoDescontoCupom } from '../../cupons/types/cupom';
import styles from '../pages/CustomizationPage.module.css';

/** @brief Cria um novo cupom em branco, pronto para o lojista preencher. */
function novoCupomEmBranco(): Cupom {
    return {
        id: crypto.randomUUID(),
        codigo: '',
        titulo: '',
        descricao: '',
        tipoDesconto: 'percentual',
        valor: 10,
        ativo: true,
        validoAte: null,
    };
}

/** @brief Editor da lista de cupons de desconto da loja (adicionar, editar, ativar/desativar e remover). */
export function CampoCupons() {
    const cupons = useCupomStore((state) => state.cupons);
    const adicionarCupom = useCupomStore((state) => state.adicionarCupom);
    const atualizarCupom = useCupomStore((state) => state.atualizarCupom);
    const removerCupom = useCupomStore((state) => state.removerCupom);

    /** @brief Atualiza um único campo de um cupom existente. */
    function atualizarCampo<K extends keyof Cupom>(cupom: Cupom, campo: K, valor: Cupom[K]) {
        atualizarCupom({ ...cupom, [campo]: valor });
    }

    return (
        <div>
            <div className={styles.listaCupons}>
                {cupons.length === 0 && (
                    <p className={styles.descricaoTema}>Nenhum cupom cadastrado ainda.</p>
                )}

                {cupons.map((cupom) => (
                    <div className={styles.cupomItem} key={cupom.id}>
                        <div className={styles.linha}>
                            <div className={styles.campo}>
                                <span className={styles.label}>Código</span>
                                <input
                                    className={styles.input}
                                    value={cupom.codigo}
                                    placeholder="BEMVINDO10"
                                    onChange={(e) => atualizarCampo(cupom, 'codigo', e.target.value.toUpperCase())}
                                />
                            </div>
                            <div className={styles.campo}>
                                <span className={styles.label}>Título</span>
                                <input
                                    className={styles.input}
                                    value={cupom.titulo}
                                    placeholder="10% de desconto"
                                    onChange={(e) => atualizarCampo(cupom, 'titulo', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className={styles.campo}>
                            <span className={styles.label}>Descrição</span>
                            <input
                                className={styles.input}
                                value={cupom.descricao}
                                placeholder="Válido no primeiro pedido pelo site."
                                onChange={(e) => atualizarCampo(cupom, 'descricao', e.target.value)}
                            />
                        </div>

                        <div className={styles.linha}>
                            <div className={styles.campo}>
                                <span className={styles.label}>Tipo de desconto</span>
                                <select
                                    className={styles.input}
                                    value={cupom.tipoDesconto}
                                    onChange={(e) =>
                                        atualizarCampo(cupom, 'tipoDesconto', e.target.value as TipoDescontoCupom)
                                    }
                                >
                                    <option value="percentual">Percentual (%)</option>
                                    <option value="fixo">Valor fixo (R$)</option>
                                </select>
                            </div>
                            <div className={styles.campo}>
                                <span className={styles.label}>
                                    Valor {cupom.tipoDesconto === 'percentual' ? '(%)' : '(R$)'}
                                </span>
                                <input
                                    className={styles.input}
                                    type="number"
                                    min={0}
                                    max={cupom.tipoDesconto === 'percentual' ? 100 : undefined}
                                    step="0.01"
                                    value={cupom.valor}
                                    onChange={(e) => atualizarCampo(cupom, 'valor', Number(e.target.value))}
                                />
                            </div>
                            <div className={styles.campo}>
                                <span className={styles.label}>Válido até (opcional)</span>
                                <input
                                    className={styles.input}
                                    type="date"
                                    value={cupom.validoAte ?? ''}
                                    onChange={(e) => atualizarCampo(cupom, 'validoAte', e.target.value || null)}
                                />
                            </div>
                        </div>

                        <div className={styles.cupomLinhaAcoes}>
                            <label className={styles.campoCheckbox}>
                                <input
                                    type="checkbox"
                                    checked={cupom.ativo}
                                    onChange={(e) => atualizarCampo(cupom, 'ativo', e.target.checked)}
                                />
                                Cupom ativo (visível na home e em /cupons)
                            </label>
                            <button
                                type="button"
                                className={styles.botaoRemoverCupom}
                                onClick={() => removerCupom(cupom.id)}
                            >
                                Remover cupom
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <button
                type="button"
                className={styles.botaoAdicionarCupom}
                onClick={() => adicionarCupom(novoCupomEmBranco())}
            >
                + Adicionar cupom
            </button>
        </div>
    );
}
