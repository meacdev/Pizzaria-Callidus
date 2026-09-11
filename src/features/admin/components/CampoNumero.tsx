/**
 * @file CampoNumero.tsx
 * @brief Campo numérico de formulário (taxa de entrega, raio de entrega, tempo de preparo), integrado ao react-hook-form.
 *
 * @details
 * Usa {@see Campo} como wrapper de rótulo + conteúdo.
 */
import { type UseFormRegister } from 'react-hook-form';
import type { Customization } from '../types/customization';
import { Campo } from './Campo';
import styles from '../pages/CustomizationPage.module.css';

/** @brief Propriedades do componente {@link CampoNumero}. */
interface CampoNumeroProps {
    /** @brief Rótulo exibido acima do campo. */
    label: string;
    /** @brief Função de registro do react-hook-form para o formulário de {@link Customization}. */
    register: UseFormRegister<Customization>;
    /** @brief Nome do campo numérico de {@link Customization} a ser registrado. */
    name: keyof Pick<Customization, 'taxaEntrega' | 'raioEntregaKm' | 'tempoPreparoMinutos'>;
    /** @brief Incremento do input numérico. @default '1' */
    step?: string;
    /** @brief Valor mínimo aceito pelo input numérico. @default '0' */
    min?: string;
}

/** @brief Campo numérico (`<input type="number">`) controlado pelo react-hook-form. */
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