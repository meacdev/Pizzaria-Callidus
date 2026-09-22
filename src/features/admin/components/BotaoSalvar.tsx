/**
 * @file BotaoSalvar.tsx
 * @brief Botão de submissão padrão dos formulários de customização do admin.
 */
import styles from '../pages/CustomizationPage.module.css';

/** @brief Propriedades do componente {@link BotaoSalvar}. */
interface BotaoSalvarProps {
    /** @brief Conteúdo exibido dentro do botão. */
    children: React.ReactNode;
}

/** @brief Botão de tipo "submit" com o estilo padrão de salvar do painel de customização. */
export function BotaoSalvar({ children }: BotaoSalvarProps) {
    return (
        <button className={styles.botaoSalvar} type="submit">
            {children}
        </button>
    );
}