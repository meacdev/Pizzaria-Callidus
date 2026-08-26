import { type UseFormRegister } from 'react-hook-form';
import type { Customization } from '../types/customization';
import { Campo } from './Campo';
import styles from '../CustomizationPage.module.css';

interface CampoColorProps {
    label: string;
    register: UseFormRegister<Customization>;
    name: keyof Customization;
}

export function CampoColor({ label, register, name }: CampoColorProps) {
    return (
        <Campo label={label}>
            <input className={styles.input} type="color" {...register(name)} />
        </Campo>
    );
}