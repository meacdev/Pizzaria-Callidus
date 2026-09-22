/**
 * @file LocaleContext.tsx
 * @brief Contexto de idioma da área do cliente (multi-idioma).
 *
 * @details
 * Guarda o idioma escolhido pelo cliente (Português, Inglês ou Espanhol)
 * em `localStorage`, para persistir entre visitas, e expõe uma função de
 * tradução `t(caminho, variaveis?)` que busca o texto no dicionário atual
 * (@see translations.ts) por um caminho com pontos (ex:
 * `t('usuario.sair')`), com substituição de placeholders `{assim}` e
 * fallback automático para o Português quando uma chave não existe em
 * outro idioma.
 *
 * Cobre só a "área do cliente" (login/cadastro, compras, reserva de
 * mesa e o botão de área do usuário no cabeçalho) — o resto da loja
 * continua fixo em português.
 */
import { createContext, useContext, useState, type ReactNode } from 'react';
import { DICIONARIOS, LOCALE_INTL, type Dicionario, type Idioma } from './translations';

/** @brief Chave usada no `localStorage` para lembrar o idioma escolhido. */
const CHAVE_IDIOMA = 'idioma_area_cliente';

/** @brief Formato do valor exposto por `useLocale()`. */
interface LocaleContextType {
    /** @brief Idioma atualmente selecionado. */
    idioma: Idioma;
    /** @brief Troca o idioma da área do cliente e lembra a escolha. */
    definirIdioma: (idioma: Idioma) => void;
    /**
     * @brief Traduz uma chave (ex: "usuario.sair") para o idioma atual.
     * @param caminho Caminho da chave no dicionário, separado por pontos.
     * @param variaveis Valores para substituir placeholders `{nome}` no texto.
     * @return O texto traduzido (ou a própria chave, se não encontrada em nenhum idioma).
     */
    t: (caminho: string, variaveis?: Readonly<Record<string, string | number>>) => string;
    /** @brief Código de locale do `Intl` correspondente ao idioma atual (ex: "pt-BR"), para formatar datas/números. */
    localeIntl: string;
}

const LocaleContext = createContext<LocaleContextType | null>(null);

/** @brief Lê o idioma salvo anteriormente, se houver e for válido. */
function lerIdiomaSalvo(): Idioma | null {
    const bruto = localStorage.getItem(CHAVE_IDIOMA);
    return bruto === 'pt' || bruto === 'en' || bruto === 'es' ? bruto : null;
}

/** @brief Busca um valor aninhado em um dicionário a partir de um caminho com pontos (ex: "usuario.sair"). */
function buscarNoDicionario(dicionario: Dicionario, caminho: string): string | undefined {
    const partes = caminho.split('.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let atual: any = dicionario;
    for (const parte of partes) {
        if (atual == null) return undefined;
        atual = atual[parte];
    }
    return typeof atual === 'string' ? atual : undefined;
}

/** @brief Substitui placeholders `{nome}` no texto pelos valores informados. */
function substituirVariaveis(texto: string, variaveis?: Readonly<Record<string, string | number>>): string {
    if (!variaveis) return texto;
    return Object.entries(variaveis).reduce(
        (resultado, [chave, valor]) => resultado.replaceAll(`{${chave}}`, String(valor)),
        texto,
    );
}

/**
 * @brief Provedor do idioma da área do cliente — deve envolver toda a
 * aplicação (ver src/main.tsx) para que o seletor de idioma no cabeçalho
 * (@see LanguageSwitcher) funcione em qualquer página.
 */
export function LocaleProvider({ children }: Readonly<{ children: ReactNode }>) {
    const [idioma, setIdioma] = useState<Idioma>(() => lerIdiomaSalvo() ?? 'pt');

    function definirIdioma(novoIdioma: Idioma) {
        localStorage.setItem(CHAVE_IDIOMA, novoIdioma);
        setIdioma(novoIdioma);
    }

    function t(caminho: string, variaveis?: Readonly<Record<string, string | number>>): string {
        const texto = buscarNoDicionario(DICIONARIOS[idioma], caminho) ?? buscarNoDicionario(DICIONARIOS.pt, caminho);
        return substituirVariaveis(texto ?? caminho, variaveis);
    }

    return (
        <LocaleContext.Provider value={{ idioma, definirIdioma, t, localeIntl: LOCALE_INTL[idioma] }}>
            {children}
        </LocaleContext.Provider>
    );
}

/** @brief Hook para ler o idioma atual, trocá-lo e traduzir textos da área do cliente. */
export function useLocale(): LocaleContextType {
    const contexto = useContext(LocaleContext);
    if (!contexto) {
        throw new Error('useLocale precisa estar dentro de um LocaleProvider');
    }
    return contexto;
}
