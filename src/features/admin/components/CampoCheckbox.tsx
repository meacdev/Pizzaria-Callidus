import { type UseFormRegister } from 'react-hook-form';
import type { Customization } from '../types/customization';
import styles from '../CustomizationPage.module.css';

interface CampoCheckboxProps {
    label: string;
    register: UseFormRegister<Customization>;
    name: `formasPagamento.${keyof Customization['formasPagamento']}`;
}

export function CampoCheckbox({ label, register, name }: CampoCheckboxProps) {
    return (
        <label className={styles.campoCheckbox}>
            <input type="checkbox" {...register(name)} />
            {label}
        </label>
    );
}