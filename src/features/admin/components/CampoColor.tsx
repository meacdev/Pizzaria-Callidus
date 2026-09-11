/**
 * @file CampoColor.tsx
 * @brief Campo de formulário para escolha de cor (ex.: cor primária/secundária da loja), integrado ao react-hook-form.
 *
 * @details
 * Usa {@see Campo} como wrapper de rótulo + conteúdo.
 */
import { type UseFormRegister } from 'react-hook-form';
import type { Customization } from '../types/customization';
import { Campo } from './Campo';
import styles from '../pages/CustomizationPage.module.css';

/** @brief Propriedades do componente {@link CampoColor}. */
interface CampoColorProps {
    /** @brief Rótulo exibido acima do seletor de cor. */
    label: string;
    /** @brief Função de registro do react-hook-form para o formulário de {@link Customization}. */
    register: UseFormRegister<Customization>;
    /** @brief Nome do campo de {@link Customization} a ser registrado. */
    name: keyof Customization;
}

/** @brief Campo de seleção de cor (`<input type="color">`) controlado pelo react-hook-form. */
export function CampoColor({ label, register, name }: CampoColorProps) {
    return (
        <Campo label={label}>
            <input className={styles.input} type="color" {...register(name)} />
        </Campo>
    );
}