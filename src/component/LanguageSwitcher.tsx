/**
 * @file LanguageSwitcher.tsx
 * @brief Seletor de idioma da área do cliente, exibido no cabeçalho da loja.
 *
 * @details
 * Troca o idioma usado pelas páginas da área do cliente (/usuario,
 * /compras, reserva de mesa) — @see LocaleContext. As demais páginas da
 * loja (cardápio, checkout etc.) continuam fixas em português.
 */
import { useState } from 'react';
import { useLocale } from '../i18n/LocaleContext';
import { IDIOMAS } from '../i18n/translations';

/** @brief Botão no cabeçalho que abre um menu para escolher o idioma da área do cliente. */
export function LanguageSwitcher() {
    const { idioma, definirIdioma } = useLocale();
    const [aberto, setAberto] = useState(false);

    const idiomaAtual = IDIOMAS.find((item) => item.codigo === idioma) ?? IDIOMAS[0];

    return (
        <div className="seletor-idioma">
            <button
                type="button"
                className="seletor-idioma-botao"
                onClick={() => setAberto((atual) => !atual)}
                aria-haspopup="listbox"
                aria-expanded={aberto}
                aria-label="Escolher idioma da área do usuário"
                title="Idioma"
            >
                <span aria-hidden="true">{idiomaAtual.bandeira}</span>
            </button>

            {aberto && (
                <ul className="seletor-idioma-lista" role="listbox" aria-label="Idiomas disponíveis">
                    {IDIOMAS.map((item) => (
                        <li key={item.codigo}>
                            <button
                                type="button"
                                role="option"
                                aria-selected={item.codigo === idioma}
                                className={`seletor-idioma-opcao ${item.codigo === idioma ? 'seletor-idioma-opcao-ativa' : ''}`}
                                onClick={() => {
                                    definirIdioma(item.codigo);
                                    setAberto(false);
                                }}
                            >
                                <span aria-hidden="true">{item.bandeira}</span> {item.rotulo}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
