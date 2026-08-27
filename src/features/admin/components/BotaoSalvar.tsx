import styles from '../pages/CustomizationPage.module.css';

interface BotaoSalvarProps {
    children: React.ReactNode;
}

export function BotaoSalvar({ children }: BotaoSalvarProps) {
    return (
        <button className={styles.botaoSalvar} type="submit">
            {children}
        </button>
    );
}