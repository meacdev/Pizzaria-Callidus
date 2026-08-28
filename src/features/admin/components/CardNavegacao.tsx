import { useNavigate } from 'react-router';
import styles from '../pages/CustomizationPage.module.css';

interface CardNavegacaoProps {
    icone: string;
    titulo: string;
    descricao: string;
    rota: string;
}

export function CardNavegacao({ icone, titulo, descricao, rota }: CardNavegacaoProps) {
    const navigate = useNavigate();

    return (
        <button className={styles.cardNavegacao} onClick={() => navigate(rota)}>
            <div className={styles.cardIcon}>{icone}</div>
            <h3 className={styles.cardTitulo}>{titulo}</h3>
            <p className={styles.cardDesc}>{descricao}</p>
        </button>
    );
}