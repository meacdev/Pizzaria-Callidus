import styles from '../pages/CustomizationPage.module.css';

interface SecaoFormularioProps {
    titulo: string;
    children: React.ReactNode;
}

export function SecaoFormulario({ titulo, children }: Readonly<SecaoFormularioProps>) {
    return (
        <fieldset className={styles.secao}>
            <legend className={styles.tituloSecao}>{titulo}</legend>
            {children}
        </fieldset>
    );
}