/**
 * @file theme.utils.ts
 * @brief Funções utilitárias de cor usadas para derivar variações claras/escuras
 * das cores de tema e de customização da loja.
 *
 * @details
 * Usado por @see providers.tsx para calcular as variáveis CSS de tema
 * a partir das cores escolhidas pelo lojista.
 */

/**
 * @brief Converte uma cor hexadecimal (#rrggbb) em seus componentes r/g/b.
 * @param hex Cor no formato hexadecimal (ex.: "#ff2a2a").
 * @return Objeto `{ r, g, b }`; retorna `{ r: 0, g: 0, b: 0 }` se `hex` for inválido.
 */
export function hexParaRgb(hex: string): { r: number; g: number; b: number } {
    const cor = hex.replace('#', '').trim();

    if (!/^[0-9A-Fa-f]{6}$/.test(cor)) {
        return { r: 0, g: 0, b: 0 };
    }

    return {
        r: parseInt(cor.substring(0, 2), 16),
        g: parseInt(cor.substring(2, 4), 16),
        b: parseInt(cor.substring(4, 6), 16),
    };
}

/**
 * @brief Clareia ou escurece uma cor hexadecimal por uma porcentagem.
 * @param hex Cor no formato hexadecimal (ex.: "#ff2a2a").
 * @param percent Percentual de ajuste: positivo clareia (aproxima de branco), negativo escurece (aproxima de preto).
 * @return Nova cor no formato hexadecimal.
 */
export function ajustarClaridade(hex: string, percent: number): string {
    const { r, g, b } = hexParaRgb(hex);
    const fator = percent / 100;

    const ajustar = (valor: number) => {
        if (fator >= 0) {
            return Math.round(valor + (255 - valor) * fator);
        }

        return Math.round(valor * (1 + fator));
    };

    const novoR = Math.min(255, Math.max(0, ajustar(r)));
    const novoG = Math.min(255, Math.max(0, ajustar(g)));
    const novoB = Math.min(255, Math.max(0, ajustar(b)));

    return `#${[novoR, novoG, novoB]
        .map((valor) => valor.toString(16).padStart(2, '0'))
        .join('')}`;
}

/**
 * @brief Escurece uma cor hexadecimal em uma porcentagem (atalho de @see ajustarClaridade com valor negativo).
 * @param hex Cor no formato hexadecimal.
 * @param percent Percentual de escurecimento (sempre tratado como positivo internamente).
 * @return Nova cor, mais escura, no formato hexadecimal.
 */
export function escurecerCor(hex: string, percent: number): string {
    return ajustarClaridade(hex, -Math.abs(percent));
}

/**
 * @brief Clareia uma cor hexadecimal em uma porcentagem (atalho de @see ajustarClaridade com valor positivo).
 * @param hex Cor no formato hexadecimal.
 * @param percent Percentual de clareamento (sempre tratado como positivo internamente).
 * @return Nova cor, mais clara, no formato hexadecimal.
 */
export function clarearCor(hex: string, percent: number): string {
    return ajustarClaridade(hex, Math.abs(percent));
}
