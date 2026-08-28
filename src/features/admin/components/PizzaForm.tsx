import { useState, type FormEvent } from 'react';
import type { Pizza } from '../../pizzaria/types/pizza';
import type { PizzaFormData } from '../api/pizzaAdmin.service';
import { Campo } from './Campo';
import { BotaoSalvar } from './BotaoSalvar';
import styles from '../pages/PizzaAdminPage.module.css';

interface PizzaFormProps {
    pizzaEmEdicao: Pizza | null;
    onSalvar: (dados: PizzaFormData) => Promise<void>;
    onCancelar: () => void;
}

function paraFormData(pizza: Pizza | null): PizzaFormData {
    if (!pizza) {
        return { nome: '', precoBase: '', categoria: 'tradicional', imgURL: '', ingredientes: '' };
    }
    return {
        nome: pizza.nome,
        precoBase: pizza.precoBase,
        categoria: pizza.categoria,
        imgURL: pizza.imgURL,
        ingredientes: pizza.ingredientes.map((ingrediente) => ingrediente.nome).join(', '),
    };
}

export function PizzaForm({ pizzaEmEdicao, onSalvar, onCancelar }: PizzaFormProps) {
    const [dados, setDados] = useState<PizzaFormData>(() => paraFormData(pizzaEmEdicao));
    const [salvando, setSalvando] = useState(false);

    const atualizarCampo = <K extends keyof PizzaFormData>(campo: K, valor: PizzaFormData[K]) => {
        setDados((atual) => ({ ...atual, [campo]: valor }));
    };

    const onSubmit = async (evento: FormEvent) => {
        evento.preventDefault();
        setSalvando(true);
        try {
            await onSalvar(dados);
        } finally {
            setSalvando(false);
        }
    };

    return (
        <form className={styles.formulario} onSubmit={onSubmit}>
            <h2 className={styles.tituloFormulario}>
                {pizzaEmEdicao ? 'Editar pizza' : 'Nova pizza'}
            </h2>

            <Campo label="Nome">
                <input
                    className={styles.input}
                    value={dados.nome}
                    onChange={(e) => atualizarCampo('nome', e.target.value)}
                    required
                />
            </Campo>

            <div className={styles.linha}>
                <Campo label="Preço (R$)">
                    <input
                        className={styles.input}
                        type="number"
                        step="0.01"
                        min="0"
                        value={dados.precoBase}
                        onChange={(e) => atualizarCampo('precoBase', e.target.value)}
                        required
                    />
                </Campo>
                <Campo label="Categoria">
                    <select
                        className={styles.input}
                        value={dados.categoria}
                        onChange={(e) => atualizarCampo('categoria', e.target.value as PizzaFormData['categoria'])}
                    >
                        <option value="tradicional">Tradicional</option>
                        <option value="doce">Doce</option>
                        <option value="artesanal">Artesanal</option>
                    </select>
                </Campo>
            </div>

            <Campo label="URL da imagem">
                <input
                    className={styles.input}
                    value={dados.imgURL}
                    onChange={(e) => atualizarCampo('imgURL', e.target.value)}
                    placeholder="https://..."
                />
            </Campo>

            <Campo label="Ingredientes (separados por vírgula)">
                <input
                    className={styles.input}
                    value={dados.ingredientes}
                    onChange={(e) => atualizarCampo('ingredientes', e.target.value)}
                    placeholder="Mussarela, Tomate, Manjericão"
                />
            </Campo>

            <div className={styles.acoesFormulario}>
                <button type="button" className={styles.botaoCancelar} onClick={onCancelar}>
                    Cancelar
                </button>
                <BotaoSalvar>{salvando ? 'Salvando...' : 'Salvar pizza'}</BotaoSalvar>
            </div>
        </form>
    );
}
