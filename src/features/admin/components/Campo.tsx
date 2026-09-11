/**
 * @file Campo.tsx
 * @brief Wrapper genérico de campo de formulário (rótulo + conteúdo) usado nas telas de customização do admin.
 */
import styles from '../pages/CustomizationPage.module.css';

/** @brief Propriedades do componente {@link Campo}. */
interface CampoProps {
    /** @brief Rótulo exibido acima do campo. */
    label: string;
    /** @brief Elemento de entrada (input, select, etc.) renderizado dentro do campo. */
    children: React.ReactNode;
}

/** @brief Renderiza um rótulo seguido do elemento de entrada informado. */
export function Campo({ label, children }: CampoProps) {
    return (
        <div className={styles.campo}>
            <label className={styles.label}>{label}</label>
            {children}
        </div>
    );
}