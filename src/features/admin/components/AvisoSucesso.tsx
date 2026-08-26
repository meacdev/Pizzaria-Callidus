import styles from '../CustomizationPage.module.css';

interface AvisoSucessoProps {
    mensagem: string;
}

export function AvisoSucesso({ mensagem }: AvisoSucessoProps) {
    return <p className={styles.aviso}>{mensagem}</p>;
}
