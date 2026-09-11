/**
 * @file CampoCheckbox.tsx
 * @brief Checkbox de formulário para as formas de pagamento aceitas, integrado ao react-hook-form.
 */
import { type UseFormRegister } from 'react-hook-form';
import type { Customization } from '../types/customization';
import styles from '../pages/CustomizationPage.module.css';

/** @brief Propriedades do componente {@link CampoCheckbox}. */
interface CampoCheckboxProps {
    /** @brief Rótulo exibido ao lado do checkbox. */
    label: string;
    /** @brief Função de registro do react-hook-form para o formulário de {@link Customization}. */
    register: UseFormRegister<Customization>;
    /** @brief Caminho do campo dentro de `formasPagamento` a ser registrado. */
    name: `formasPagamento.${keyof Customization['formasPagamento']}`;
}

/** @brief Checkbox controlado pelo react-hook-form para habilitar/desabilitar uma forma de pagamento. */
export function CampoCheckbox({ label, register, name }: CampoCheckboxProps) {
    return (
        <label className={styles.campoCheckbox}>
            <input type="checkbox" {...register(name)} />
            {label}
        </label>
    );
}