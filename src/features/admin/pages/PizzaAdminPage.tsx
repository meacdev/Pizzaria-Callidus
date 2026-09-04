import { useState } from 'react';
import { Link } from 'react-router';
import type { Pizza } from '../../pizzaria/types/pizza';
import type { PizzaFormData } from '../api/pizzaAdmin.service';
import { usePizzaAdmin } from '../hooks/usePizzaAdmin';
import { PizzaForm } from '../components/PizzaForm';
import { PizzaListaAdmin } from '../components/PizzaListaAdmin';
import styles from './PizzaAdminPage.module.css';

export function PizzaAdminPage() {
    const { pizzas, carregando, erro, criar, atualizar, excluir } = usePizzaAdmin();
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [pizzaEmEdicao, setPizzaEmEdicao] = useState<Pizza | null>(null);

    const abrirNovaPizza = () => {
        setPizzaEmEdicao(null);
        setMostrarFormulario(true);
    };

    const abrirEdicao = (pizza: Pizza) => {
        setPizzaEmEdicao(pizza);
        setMostrarFormulario(true);
    };

    const fecharFormulario = () => {
        setMostrarFormulario(false);
        setPizzaEmEdicao(null);
    };

    const salvar = async (dados: PizzaFormData) => {
        if (pizzaEmEdicao) {
            await atualizar(pizzaEmEdicao.id, dados);
        } else {
            await criar(dados);
        }
        fecharFormulario();
    };

    const solicitarExclusao = async (pizza: Pizza) => {
        if (window.confirm(`Excluir a pizza "${pizza.nome}"?`)) {
            await excluir(pizza.id);
        }
    };

    return (
        <div className={styles.container}>
            <Link className={styles.voltar} to="/customizacao">
                ‹ Voltar
            </Link>

            <div className={styles.cabecalho}>
                <h1 style={{ margin: 0 }}>Gestão de Pizzas</h1>
                {!mostrarFormulario && (
                    <button className={styles.botaoNovo} onClick={abrirNovaPizza}>
                        + Nova pizza
                    </button>
                )}
            </div>

            {erro && <p className={styles.erro}>{erro}</p>}

            {mostrarFormulario && (
                <PizzaForm
                    pizzaEmEdicao={pizzaEmEdicao}
                    onSalvar={salvar}
                    onCancelar={fecharFormulario}
                />
            )}

            {carregando ? (
                <p className={styles.vazio}>Carregando pizzas...</p>
            ) : (
                <PizzaListaAdmin pizzas={pizzas} onEditar={abrirEdicao} onExcluir={solicitarExclusao} />
            )}
        </div>
    );
}
