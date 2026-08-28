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

export function escurecerCor(hex: string, percent: number): string {
    return ajustarClaridade(hex, -Math.abs(percent));
}

export function clarearCor(hex: string, percent: number): string {
    return ajustarClaridade(hex, Math.abs(percent));
}
