/**
 * @file providers.tsx
 * @brief Provedores de contexto de nível de aplicação (react-query + tema dinâmico da customização).
 *
 * @details
 * `TemaDinamico` (interno a este arquivo) aplica, via variáveis CSS
 * inline em `<html>`, as cores escolhidas pelo lojista no painel de
 * customização (@see CustomizationContext). Essas variáveis (`--primary`,
 * `--background`, `--surface`, `--surface-light`...) são as mesmas usadas
 * pelo tema claro/escuro global (@see ThemeContext) — por isso este
 * componente também precisa saber qual tema está ativo: a cor de fundo
 * "secundária" escolhida pelo lojista foi pensada para o tema escuro
 * original, então no tema claro ela é usada só como base de tonalidade
 * (bem clareada), não como cor de fundo direta.
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useEffect, type PropsWithChildren } from 'react';
import { CustomizationProvider, useCustomization } from '../context/CustomizationContext';
import { useTheme } from '../context/ThemeContext';
import { ajustarClaridade, escurecerCor } from './theme.utils';

const queryClient = new QueryClient({
defaultOptions: {
queries: {
staleTime: 1000 * 60 * 5,
retry: 1,
refetchOnWindowFocus: false,
},
},
});

/**
 * @brief Aplica as cores de customização da loja (@see CustomizationContext)
 * como variáveis CSS em `<html>`, adaptando fundo/superfícies ao tema
 * claro ou escuro atualmente ativo (@see ThemeContext).
 */
function TemaDinamico({ children }: Readonly<PropsWithChildren>) {
const { customization } = useCustomization();
const { tema } = useTheme();


useEffect(() => {
    const root = document.documentElement;

    const primaria = customization.corPrimaria;
    const secundaria = customization.corSecundaria;

    /*
     * CORES PRIMÁRIAS
     *
     * A cor de marca escolhida no painel administrativo vale para os
     * dois temas — só o fundo/superfícies abaixo mudam com claro/escuro.
     */
    root.style.setProperty('--primary', primaria);
    root.style.setProperty(
        '--primary-light',
        ajustarClaridade(primaria, 20)
    );
    root.style.setProperty(
        '--primary-dark',
        escurecerCor(primaria, 20)
    );

    /*
     * CORES SECUNDÁRIAS / ESTRUTURA DO SITE
     *
     * No tema escuro (o original do projeto), a cor "secundária" do
     * lojista é usada diretamente como fundo, e as superfícies (cards)
     * são um pouco mais claras que ela. No tema claro, essa mesma cor
     * secundária só serve de base de tonalidade — é fortemente
     * clareada para virar um fundo quase branco, mantendo a identidade
     * visual da loja sem deixar de ser um tema claro de verdade.
     */
    if (tema === 'escuro') {
        root.style.setProperty('--background', secundaria);
        root.style.setProperty('--surface', ajustarClaridade(secundaria, 6));
        root.style.setProperty('--surface-light', ajustarClaridade(secundaria, 12));
    } else {
        root.style.setProperty('--background', ajustarClaridade(secundaria, 93));
        root.style.setProperty('--surface', ajustarClaridade(secundaria, 98));
        root.style.setProperty('--surface-light', ajustarClaridade(secundaria, 88));
    }

    /*
     * Cores que dependem da cor primária.
     */
    root.style.setProperty(
        '--primary-rgb',
        hexParaRgbCss(primaria)
    );
}, [
    customization.corPrimaria,
    customization.corSecundaria,
    tema,
]);

return <>{children}</>;

}

/** @brief Converte uma cor hexadecimal (#rrggbb) em uma lista "r, g, b" pronta para `rgba(var(--primary-rgb), alpha)`. */
function hexParaRgbCss(hex: string): string {
const cor = hex.replace('#', '');

if (!/^[0-9A-Fa-f]{6}$/.test(cor)) {
    return '255, 42, 42';
}

const r = parseInt(cor.substring(0, 2), 16);
const g = parseInt(cor.substring(2, 4), 16);
const b = parseInt(cor.substring(4, 6), 16);

return `${r}, ${g}, ${b}`;

}

/**
 * @brief Provedores de nível de aplicação: cliente do react-query e a
 * customização visual da loja (@see TemaDinamico). Deve ficar dentro de
 * `ThemeProvider`/`LocaleProvider` (ver src/main.tsx), já que depende do
 * tema atual para calcular as cores de fundo/superfície.
 */
export function AppProviders({ children }: Readonly<PropsWithChildren>) {
return ( <QueryClientProvider client={queryClient}> <CustomizationProvider> <TemaDinamico>
{children} </TemaDinamico> </CustomizationProvider>

        <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
);

}
