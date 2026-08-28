import { type UseFormRegister } from 'react-hook-form';
import type { Customization } from '../types/customization';
import { DIAS_SEMANA_ORDEM } from '../types/customization';
import { DIA_SEMANA_LABEL } from '../types/customization';
import styles from '../pages/CustomizationPage.module.css';

interface CampoHorarioSemanaProps {
    register: UseFormRegister<Customization>;
}

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