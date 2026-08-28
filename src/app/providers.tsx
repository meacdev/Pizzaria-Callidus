import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useEffect, type PropsWithChildren } from 'react';
import { CustomizationProvider, useCustomization } from '../context/CustomizationContext';
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

function TemaDinamico({ children }: PropsWithChildren) {
const { customization } = useCustomization();


useEffect(() => {
    const root = document.documentElement;

    const primaria = customization.corPrimaria;
    const secundaria = customization.corSecundaria;

    /*
     * CORES PRIMÁRIAS
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
     * A cor escolhida no painel administrativo
     * será utilizada como base do fundo.
     */
    root.style.setProperty('--background', secundaria);

    /*
     * Cards, cabeçalhos e containers.
     * São derivados automaticamente da cor secundária.
     */
    root.style.setProperty(
        '--surface',
        ajustarClaridade(secundaria, 6)
    );

    root.style.setProperty(
        '--surface-light',
        ajustarClaridade(secundaria, 12)
    );

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
]);

return <>{children}</>;

}

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

export function AppProviders({ children }: PropsWithChildren) {
return ( <QueryClientProvider client={queryClient}> <CustomizationProvider> <TemaDinamico>
{children} </TemaDinamico> </CustomizationProvider>

        <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
);

}
