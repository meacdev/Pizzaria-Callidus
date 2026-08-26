import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { useCustomization } from '../../../context/CustomizationContext';
import type { Customization } from '../types/customization';
import styles from './CustomizationPage.module.css';

export function CustomizationPage() {
    const { customization, updateCustomization } = useCustomization();
    const { register, handleSubmit } = useForm<Customization>({ defaultValues: customization });
    const [salvo, setSalvo] = useState(false);
    const navigate = useNavigate();

    const onSubmit = (data: Customization) => {
        updateCustomization(data);
        setSalvo(true);
        setTimeout(() => setSalvo(false), 2000);
    };

    return (
        <div className={styles.container}>
            <h1 style={{ marginTop: 0 }}>Customização da Loja</h1>

            <form onSubmit={handleSubmit(onSubmit)}>
                <fieldset className={styles.secao}>
                    <legend className={styles.tituloSecao}>Identidade</legend>
                    <div className={styles.campo}>
                        <label className={styles.label}>URL do logotipo</label>
                        <input className={styles.input} {...register('logoUrl')} placeholder="https://..." />
                    </div>
                    <div className={styles.campo}>
                        <label className={styles.label}>Nome da pizzaria</label>
                        <input className={styles.input} {...register('nomePizzaria', { required: true })} />
                    </div>
                    <div className={styles.campo}>
                        <label className={styles.label}>Endereço</label>
                        <input className={styles.input} {...register('endereco')} />
                    </div>
                </fieldset>

                <fieldset className={styles.secao}>
                    <legend className={styles.tituloSecao}>Tema</legend>
                    <div className={styles.linha}>
                        <div className={styles.campo}>
                            <label className={styles.label}>Cor primária</label>
                            <input className={styles.input} type="color" {...register('corPrimaria')} />
                        </div>
                        <div className={styles.campo}>
                            <label className={styles.label}>Cor secundária</label>
                            <input className={styles.input} type="color" {...register('corSecundaria')} />
                        </div>
                    </div>
                </fieldset>

                <fieldset className={styles.secao}>
                    <legend className={styles.tituloSecao}>Funcionamento</legend>
                    <div className={styles.linha}>
                        <div className={styles.campo}>
                            <label className={styles.label}>Abertura</label>
                            <input className={styles.input} type="time" {...register('horarioAbertura')} />
                        </div>
                        <div className={styles.campo}>
                            <label className={styles.label}>Fechamento</label>
                            <input className={styles.input} type="time" {...register('horarioFechamento')} />
                        </div>
                    </div>
                </fieldset>

                <fieldset className={styles.secao}>
                    <legend className={styles.tituloSecao}>Pagamento</legend>
                    <label className={styles.campoCheckbox}>
                        <input type="checkbox" {...register('formasPagamento.dinheiro')} />
                        Dinheiro
                    </label>
                    <label className={styles.campoCheckbox}>
                        <input type="checkbox" {...register('formasPagamento.cartao')} />
                        Cartão
                    </label>
                    <label className={styles.campoCheckbox}>
                        <input type="checkbox" {...register('formasPagamento.pix')} />
                        Pix
                    </label>
                </fieldset>

                <fieldset className={styles.secao}>
                    <legend className={styles.tituloSecao}>Entrega</legend>
                    <div className={styles.linha}>
                        <div className={styles.campo}>
                            <label className={styles.label}>Taxa de entrega (R$)</label>
                            <input className={styles.input} type="number" step="0.01" min="0" {...register('taxaEntrega', { valueAsNumber: true })} />
                        </div>
                        <div className={styles.campo}>
                            <label className={styles.label}>Raio de entrega (km)</label>
                            <input className={styles.input} type="number" step="0.1" min="0" {...register('raioEntregaKm', { valueAsNumber: true })} />
                        </div>
                        <div className={styles.campo}>
                            <label className={styles.label}>Tempo médio de preparo (min)</label>
                            <input className={styles.input} type="number" min="0" {...register('tempoPreparoMinutos', { valueAsNumber: true })} />
                        </div>
                    </div>
                </fieldset>

                <button className={styles.botaoSalvar} type="submit">Salvar alterações</button>
                {salvo && <p className={styles.aviso}>Alterações salvas com sucesso!</p>}
            </form>

            <div className={styles.secaoNavegacao}>
                <button className={styles.cardNavegacao} onClick={() => navigate('/admin/cardapio')}>
                    <div className={styles.cardIcon}>🍕</div>
                    <h3 className={styles.cardTitulo}>Gestão de Cardápio</h3>
                    <p className={styles.cardDesc}>Adicione, edite ou remova pizzas, bebidas e combos do cardápio.</p>
                </button>

                <button className={styles.cardNavegacao} onClick={() => navigate('/admin/pedidos')}>
                    <div className={styles.cardIcon}>📦</div>
                    <h3 className={styles.cardTitulo}>Gestão de Pedidos</h3>
                    <p className={styles.cardDesc}>Acompanhe pedidos em tempo real, status e histórico de vendas.</p>
                </button>
            </div>
        </div>
    );
}