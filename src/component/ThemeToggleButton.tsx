/**
 * @file ThemeToggleButton.tsx
 * @brief Botão flutuante global de alternância de tema (claro/escuro).
 *
 * @details
 * Renderizado uma única vez em src/main.tsx, fora do roteador — por isso
 * aparece em todas as páginas do site (loja, totem, admin), sempre na
 * mesma posição na tela, independente da rota atual (ver @see
 * ThemeContext para a lógica de qual tema fica ativo).
 */
import { useTheme } from '../context/ThemeContext';

/** @brief Botão fixo no canto da tela que alterna entre o tema claro e o escuro. */
export function ThemeToggleButton() {
    const { tema, alternarTema } = useTheme();
    const proximoTema = tema === 'claro' ? 'escuro' : 'claro';

    return (
        <button
            type="button"
            className="botao-tema-flutuante"
            onClick={alternarTema}
            aria-label={`Mudar para o tema ${proximoTema}`}
            title={`Mudar para o tema ${proximoTema}`}
        >
            <span aria-hidden="true">{tema === 'claro' ? '🌙' : '☀️'}</span>
        </button>
    );
}
