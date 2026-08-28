import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useCustomization } from '../../../context/CustomizationContext';
import type { Customization } from '../types/customization';
import { SecaoFormulario } from '../components/SecaoFormulario';
import { Campo } from '../components/Campo';
import { CampoColor } from '../components/CampoColor';
import { CampoCheckbox } from '../components/CampoCheckbox';
import { CampoHorarioSemana } from '../components/CampoHorarioSemana';
import { CampoImagem } from '../components/CampoImagem';
import { CampoNumero } from '../components/CampoNumero';
import { BotaoSalvar } from '../components/BotaoSalvar';
import { AvisoSucesso } from '../components/AvisoSucesso';
import { CardNavegacao } from '../components/CardNavegacao';
import styles from './CustomizationPage.module.css';

export function CustomizationPage() {
    const { customization, updateCustomization } = useCustomization();
    const { register, handleSubmit, setValue, watch } = useForm<Customization>({ defaultValues: customization }); // + setValue, watch
    const [salvo, setSalvo] = useState(false);

    const logoUrl = watch('logoUrl');   // novo
    const bannerUrl = watch('bannerUrl'); // novo

    const onSubmit = (data: Customization) => {
        updateCustomization(data);
        setSalvo(true);
        setTimeout(() => setSalvo(false), 2000);
    };

    return (
        <div className={styles.container}>
            <h1 style={{ marginTop: 0 }}>Customização da Loja</h1>

            <form onSubmit={handleSubmit(onSubmit)}>
                <SecaoFormulario titulo="Identidade">
                    <CampoImagem
                        label="Logotipo"
                        valor={logoUrl}
                        aoMudar={(dataUrl) => setValue('logoUrl', dataUrl, { shouldDirty: true })}
                        larguraMaxima={400}
                    />
                    <CampoImagem
                        label="Banner (topo da página inicial)"
                        valor={bannerUrl}
                        aoMudar={(dataUrl) => setValue('bannerUrl', dataUrl, { shouldDirty: true })}
                        larguraMaxima={1600}
                    />
                    <Campo label="Nome da pizzaria">
                        <input className={styles.input} {...register('nomePizzaria', { required: true })} />
                    </Campo>
                    <Campo label="Descrição curta">
                        <input className={styles.input} {...register('descricaoCurta')} />
                    </Campo>
                    <Campo label="Endereço">
                        <input className={styles.input} {...register('endereco')} />
                    </Campo>
                </SecaoFormulario>

                {/* novo */}
                <SecaoFormulario titulo="Contato">
                    <Campo label="Telefone">
                        <input className={styles.input} {...register('telefone')} placeholder="(92) 99123-4567" />
                    </Campo>
                    <Campo label="WhatsApp">
                        <input className={styles.input} {...register('whatsapp')} placeholder="5592991234567" />
                    </Campo>
                    <Campo label="Instagram">
                        <input className={styles.input} {...register('instagram')} placeholder="@minhapizzaria" />
                    </Campo>
                </SecaoFormulario>

                <SecaoFormulario titulo="Tema">
                    <div className={styles.linha}>
                        <CampoColor label="Cor primária" register={register} name="corPrimaria" />
                        <CampoColor label="Cor secundária" register={register} name="corSecundaria" />
                    </div>
                </SecaoFormulario>

                <SecaoFormulario titulo="Funcionamento">
                    <CampoHorarioSemana register={register} /> {/* trocado */}
                </SecaoFormulario>

                <SecaoFormulario titulo="Pagamento">
                    <CampoCheckbox label="Dinheiro" register={register} name="formasPagamento.dinheiro" />
                    <CampoCheckbox label="Cartão" register={register} name="formasPagamento.cartao" />
                    <CampoCheckbox label="Pix" register={register} name="formasPagamento.pix" />
                </SecaoFormulario>

                <SecaoFormulario titulo="Entrega">
                    <div className={styles.linha}>
                        <CampoNumero label="Taxa de entrega (R$)" register={register} name="taxaEntrega" step="0.01" />
                        <CampoNumero label="Raio de entrega (km)" register={register} name="raioEntregaKm" step="0.1" />
                        <CampoNumero label="Tempo médio de preparo (min)" register={register} name="tempoPreparoMinutos" />
                    </div>
                </SecaoFormulario>

                <BotaoSalvar>Salvar alterações</BotaoSalvar>
                {salvo && <AvisoSucesso mensagem="Alterações salvas com sucesso!" />}
            </form>

            <div className={styles.secaoNavegacao}>
                <CardNavegacao icone="🍕" titulo="Gestão de Cardápio" descricao="Adicione, edite ou remova pizzas, bebidas e combos do cardápio." rota="/admin/cardapio" />
                <CardNavegacao icone="📦" titulo="Gestão de Pedidos" descricao="Acompanhe pedidos em tempo real, status e histórico de vendas." rota="/admin/pedidos" />
            </div>
        </div>
    );
}