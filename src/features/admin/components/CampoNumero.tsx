import { type UseFormRegister } from 'react-hook-form';
import type { Customization } from '../types/customization';
import { Campo } from './Campo';
import styles from '../CustomizationPage.module.css';

interface CampoNumeroProps {
    label: string;
    register: UseFormRegister<Customization>;
    name: keyof Pick<Customization, 'taxaEntrega' | 'raioEntregaKm' | 'tempoPreparoMinutos'>;
    step?: string;
    min?: string;
}

export function CampoNumero({ label, register, name, step = '1', min = '0' }: CampoNumeroProps) {
    return (
        <Campo label={label}>
            <input
                className={styles.input}
                type="number"
                step={step}
                min={min}
                {...register(name, { valueAsNumber: true })}
            />
        </Campo>
    );
}