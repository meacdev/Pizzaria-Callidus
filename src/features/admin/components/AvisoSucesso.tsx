/**
 * @file AvisoSucesso.tsx
 * @brief Mensagem simples de sucesso exibida nas telas de customização do admin.
 */
import styles from '../pages/CustomizationPage.module.css';

/** @brief Propriedades do componente {@link AvisoSucesso}. */
interface AvisoSucessoProps {
    /** @brief Texto de sucesso a ser exibido. */
    mensagem: string;
}

/** @brief Exibe uma mensagem de sucesso estilizada (ex.: "Alterações salvas"). */
export function AvisoSucesso({ mensagem }: AvisoSucessoProps) {
    return <p className={styles.aviso}>{mensagem}</p>;
}
