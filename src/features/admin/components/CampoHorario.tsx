import { type UseFormRegister } from 'react-hook-form';
import type { Customization } from '../types/customization';
import { Campo } from './Campo';
import styles from '../CustomizationPage.module.css';

interface CampoHorarioProps {
    label: string;
    register: UseFormRegister<Customization>;
    name: keyof Pick<Customization, 'horarioAbertura' | 'horarioFechamento'>;
}

export function CampoHorario({ label, register, name }: CampoHorarioProps) {
    return (
        <Campo label={label}>
            <input className={styles.input} type="time" {...register(name)} />
        </Campo>
    );
}