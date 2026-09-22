/**
 * @file PizzaListaAdmin.tsx
 * @brief Tabela de pizzas cadastradas no painel administrativo, com ações de editar/excluir.
 *
 * @details
 * Usada em conjunto com @see PizzaForm (formulário de criação/edição) na
 * página de administração de pizzas (PizzaAdminPage.tsx).
 */
import type { Pizza } from '../../pizzaria/types/pizza';
import { nomeCategoria } from '../../pizzaria/utils/pizza.utils';
import styles from '../pages/PizzaAdminPage.module.css';

/** @brief Props da tabela: lista de pizzas e callbacks acionados ao clicar em editar/excluir uma linha. */
interface PizzaListaAdminProps {
    pizzas: Pizza[];
    onEditar: (pizza: Pizza) => void;
    onExcluir: (pizza: Pizza) => void;
}

/**
 * @brief Formata um preço (string vinda da API) como moeda BRL; mantém o valor bruto se não for um número válido.
 * @param preco Preço em formato string.
 * @return Preço formatado, ex.: "R$ 39,90".
 */
function formatarPreco(preco: string): string {
    const valor = Number(preco);
    if (Number.isNaN(valor)) return `R$ ${preco}`;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}

/** @brief Tabela com as pizzas cadastradas, ou uma mensagem de estado vazio quando não há nenhuma. */
export function PizzaListaAdmin({ pizzas, onEditar, onExcluir }: Readonly<PizzaListaAdminProps>) {
    if (pizzas.length === 0) {
        return <p className={styles.vazio}>Nenhuma pizza cadastrada ainda.</p>;
    }

    return (
        <table className={styles.tabela}>
            <thead>
                <tr>
                    <th></th>
                    <th>Nome</th>
                    <th>Categoria</th>
                    <th>Preço</th>
                    <th>Ingredientes</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {pizzas.map((pizza) => (
                    <tr key={pizza.id}>
                        <td>
                            {pizza.imgURL && (
                                <img className={styles.miniatura} src={pizza.imgURL} alt={pizza.nome} />
                            )}
                        </td>
                        <td>{pizza.nome}</td>
                        <td>
                            <span className={styles.badge}>{nomeCategoria(pizza.categoria)}</span>
                        </td>
                        <td>{formatarPreco(pizza.precoBase)}</td>
                        <td className={styles.colunaIngredientes}>
                            {pizza.ingredientes.map((ingrediente) => ingrediente.nome).join(', ')}
                        </td>
                        <td className={styles.colunaAcoes}>
                            <button type="button" className={styles.botaoEditar} onClick={() => onEditar(pizza)}>
                                Editar
                            </button>
                            <button type="button" className={styles.botaoExcluir} onClick={() => onExcluir(pizza)}>
                                Excluir
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
