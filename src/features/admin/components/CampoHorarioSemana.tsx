/**
 * @file CampoHorarioSemana.tsx
 * @brief Grade de campos para configurar o horário de funcionamento da loja em cada dia da semana.
 *
 * @details
 * Renderiza uma linha por dia (na ordem de {@link DIAS_SEMANA_ORDEM}), cada uma
 * com um checkbox de "ativo" e os horários de abertura/fechamento, todos
 * registrados no formulário de {@link Customization} via react-hook-form.
 */
import { type UseFormRegister } from 'react-hook-form';
import type { Customization } from '../types/customization';
import { DIAS_SEMANA_ORDEM } from '../types/customization';
import { DIA_SEMANA_LABEL } from '../types/customization';
import styles from '../pages/CustomizationPage.module.css';

/** @brief Propriedades do componente {@link CampoHorarioSemana}. */
interface CampoHorarioSemanaProps {
    /** @brief Função de registro do react-hook-form para o formulário de {@link Customization}. */
    register: UseFormRegister<Customization>;
}

/** @brief Grade com os horários de funcionamento (ativo/abertura/fechamento) de cada dia da semana. */
export function CampoHorarioSemana({ register }: CampoHorarioSemanaProps) {
    return (
        <div className={styles.horariosSemana}>
            {DIAS_SEMANA_ORDEM.map((dia) => (
                <div key={dia} className={styles.horarioLinha}>
                    <label className={styles.horarioDiaLabel}>
                        <input type="checkbox" {...register(`horarios.${dia}.ativo`)} />
                        {DIA_SEMANA_LABEL[dia]}
                    </label>
                    <input className={styles.input} type="time" {...register(`horarios.${dia}.abertura`)} />
                    <span>até</span>
                    <input className={styles.input} type="time" {...register(`horarios.${dia}.fechamento`)} />
                </div>
            ))}
        </div>
    );
}