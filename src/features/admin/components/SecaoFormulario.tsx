/**
 * @file SecaoFormulario.tsx
 * @brief Seção agrupadora (fieldset) reutilizável para os formulários de customização da loja.
 */
import styles from '../pages/CustomizationPage.module.css';

/** @brief Props da seção: título exibido na legenda e o conteúdo do formulário agrupado. */
interface SecaoFormularioProps {
    titulo: string;
    children: React.ReactNode;
}

/** @brief Agrupa campos de formulário em um `<fieldset>` com título (`<legend>`). */
export function SecaoFormulario({ titulo, children }: Readonly<SecaoFormularioProps>) {
    return (
        <fieldset className={styles.secao}>
            <legend className={styles.tituloSecao}>{titulo}</legend>
            {children}
        </fieldset>
    );
}