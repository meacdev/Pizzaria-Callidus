import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useEffect, type PropsWithChildren } from 'react';
import { ThemeProvider } from 'styled-components';
import { CustomizationProvider, useCustomization } from '../context/CustomizationContext';
import { ajustarClaridade } from './theme.utils';

const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: 1000 * 60 * 5, retry: 1, refetchOnWindowFocus: false } },
});

function TemaDinamico({ children }: PropsWithChildren) {
    const { customization } = useCustomization();

    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty('--primary', customization.corPrimaria);
        root.style.setProperty('--primary-light', ajustarClaridade(customization.corPrimaria, 20));
        root.style.setProperty('--primary-dark', ajustarClaridade(customization.corPrimaria, -20));
    }, [customization.corPrimaria]);

    return (
        <ThemeProvider theme={{ corPrimaria: customization.corPrimaria, corSecundaria: customization.corSecundaria }}>
            {children}
        </ThemeProvider>
    );
}

export function AppProviders({ children }: PropsWithChildren) {
    return (
        <QueryClientProvider client={queryClient}>
            <CustomizationProvider>
                <TemaDinamico>{children}</TemaDinamico>
            </CustomizationProvider>
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}