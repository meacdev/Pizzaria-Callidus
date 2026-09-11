/**
 * @file ThemeContext.tsx
 * @brief Contexto global de tema (claro/escuro) da loja.
 *
 * @details
 * A paleta original do projeto é escura (ver `:root` em src/index.css).
 * Este contexto adiciona um tema claro alternativo e decide, a cada
 * carregamento, qual dos dois usar:
 *
 * 1. Se o usuário já escolheu um tema manualmente antes (clicando no
 *    botão flutuante — @see ThemeToggleButton), esse tema é lembrado em
 *    `localStorage` e usado sempre, em qualquer página.
 * 2. Caso contrário, o tema segue automaticamente a preferência do
 *    sistema operacional (`prefers-color-scheme`), inclusive reagindo em
 *    tempo real se o usuário mudar o tema do SO com o site aberto.
 *
 * O tema é aplicado escrevendo `data-tema="claro"` ou `data-tema="escuro"`
 * no elemento `<html>`; o CSS correspondente mora em src/index.css sob o
 * seletor `:root[data-tema="claro"]`. Um script inline em index.html
 * aplica esse mesmo atributo antes do React montar, para evitar o "flash"
 * do tema errado (FOUC).
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

/** @brief Os dois temas visuais suportados pela loja. */
export type Tema = 'claro' | 'escuro';

/** @brief Chave usada no `localStorage` para lembrar a escolha manual do usuário. */
const CHAVE_TEMA = 'tema_preferido';

/** @brief `matchMedia` usado para descobrir e observar o tema do sistema operacional. */
function consultaTemaSistema(): MediaQueryList {
    return window.matchMedia('(prefers-color-scheme: dark)');
}

/** @brief Lê o tema salvo manualmente pelo usuário, se houver. */
function lerTemaSalvo(): Tema | null {
    const bruto = localStorage.getItem(CHAVE_TEMA);
    return bruto === 'claro' || bruto === 'escuro' ? bruto : null;
}

/** @brief Tema atual do sistema operacional (usado quando não há escolha manual). */
function lerTemaDoSistema(): Tema {
    return consultaTemaSistema().matches ? 'escuro' : 'claro';
}

/** @brief Formato do valor exposto por `useTheme()`. */
interface ThemeContextType {
    /** @brief Tema visual atualmente aplicado. */
    tema: Tema;
    /** @brief `true` quando o usuário nunca escolheu um tema manualmente (ainda seguindo o SO). */
    seguindoSistema: boolean;
    /** @brief Alterna entre claro/escuro e passa a lembrar essa escolha manualmente. */
    alternarTema: () => void;
    /** @brief Volta a seguir automaticamente o tema do sistema operacional. */
    seguirSistema: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

/**
 * @brief Provedor do tema claro/escuro — deve envolver toda a aplicação
 * (ver src/main.tsx) para que o botão flutuante (@see ThemeToggleButton)
 * funcione em qualquer página, independente da rota.
 */
export function ThemeProvider({ children }: Readonly<{ children: ReactNode }>) {
    const [tema, setTema] = useState<Tema>(() => lerTemaSalvo() ?? lerTemaDoSistema());
    const [seguindoSistema, setSeguindoSistema] = useState<boolean>(() => lerTemaSalvo() === null);

    // Aplica o tema no <html> sempre que ele mudar.
    useEffect(() => {
        document.documentElement.setAttribute('data-tema', tema);
    }, [tema]);

    // Enquanto o usuário não escolheu um tema manualmente, acompanha
    // mudanças no tema do sistema operacional em tempo real.
    useEffect(() => {
        if (!seguindoSistema) return;

        const consulta = consultaTemaSistema();
        const aoMudar = () => setTema(lerTemaDoSistema());

        consulta.addEventListener('change', aoMudar);
        return () => consulta.removeEventListener('change', aoMudar);
    }, [seguindoSistema]);

    /** @brief Alterna claro/escuro manualmente e passa a lembrar essa escolha. */
    function alternarTema() {
        setTema((atual) => {
            const novoTema: Tema = atual === 'claro' ? 'escuro' : 'claro';
            localStorage.setItem(CHAVE_TEMA, novoTema);
            setSeguindoSistema(false);
            return novoTema;
        });
    }

    /** @brief Esquece a escolha manual e volta a seguir o tema do sistema operacional. */
    function seguirSistema() {
        localStorage.removeItem(CHAVE_TEMA);
        setSeguindoSistema(true);
        setTema(lerTemaDoSistema());
    }

    return (
        <ThemeContext.Provider value={{ tema, seguindoSistema, alternarTema, seguirSistema }}>
            {children}
        </ThemeContext.Provider>
    );
}

/** @brief Hook para ler/alternar o tema claro/escuro em qualquer componente. */
export function useTheme(): ThemeContextType {
    const contexto = useContext(ThemeContext);
    if (!contexto) {
        throw new Error('useTheme precisa estar dentro de um ThemeProvider');
    }
    return contexto;
}
