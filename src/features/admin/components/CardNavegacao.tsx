/**
 * @file CardNavegacao.tsx
 * @brief Card clicável que navega para uma rota do painel administrativo.
 */
import { useNavigate } from 'react-router';
import styles from '../pages/CustomizationPage.module.css';

/** @brief Propriedades do componente {@link CardNavegacao}. */
interface CardNavegacaoProps {
    /** @brief Ícone (emoji ou texto curto) exibido no topo do card. */
    icone: string;
    /** @brief Título do card. */
    titulo: string;
    /** @brief Texto descritivo curto exibido abaixo do título. */
    descricao: string;
    /** @brief Rota para a qual navegar ao clicar no card. */
    rota: string;
}

/** @brief Card de navegação que leva o usuário até `rota` ao ser clicado. */
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