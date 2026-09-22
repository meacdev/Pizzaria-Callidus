/**
 * @file CampoImagem.tsx
 * @brief Campo de upload de imagem (ex.: logo/banner da loja) com redimensionamento/compressão e preview.
 *
 * @details
 * Usa {@see redimensionarEComprimir} (utils/imagem.utils) para converter o
 * arquivo escolhido em um data URL já otimizado antes de repassá-lo via
 * `aoMudar`.
 */
import { useState } from 'react';
import { redimensionarEComprimir } from '../utils/imagem.utils';
import styles from '../pages/CustomizationPage.module.css';

/** @brief Propriedades do componente {@link CampoImagem}. */
interface CampoImagemProps {
    /** @brief Rótulo exibido acima do campo. */
    label: string;
    /** @brief Data URL da imagem atual (vazio quando nenhuma imagem foi definida). */
    valor: string;
    /** @brief Callback chamado com o novo data URL (ou string vazia ao remover). */
    aoMudar: (dataUrl: string) => void;
    /** @brief Largura máxima, em pixels, usada no redimensionamento. @default 900 */
    larguraMaxima?: number;
}

/** @brief Campo de upload de imagem com redimensionamento/compressão automáticos e preview. */
export function CampoImagem({ label, valor, aoMudar, larguraMaxima = 900 }: CampoImagemProps) {
    const [processando, setProcessando] = useState(false);
    const [erro, setErro] = useState('');

    /** @brief Lida com a seleção de um arquivo de imagem: redimensiona/comprime e repassa o data URL via `aoMudar`. */
    async function handleArquivo(evento: React.ChangeEvent<HTMLInputElement>) {
        const arquivo = evento.target.files?.[0];
        evento.target.value = ''; // permite escolher o mesmo arquivo de novo depois

        if (!arquivo) return;

        setErro('');
        setProcessando(true);
        try {
            const dataUrl = await redimensionarEComprimir(arquivo, larguraMaxima, 0.82);
            aoMudar(dataUrl);
        } catch {
            setErro('Não foi possível carregar essa imagem. Tenta outro arquivo.');
        } finally {
            setProcessando(false);
        }
    }

    return (
        <div className={styles.campo}>
            <label className={styles.label}>{label}</label>

            {valor && <img src={valor} alt="" className={styles.previewImagem} />}

            <input className={styles.input} type="file" accept="image/*" onChange={handleArquivo} />

            {processando && <span className={styles.avisoCampo}>Processando imagem...</span>}
            {erro && <span className={styles.avisoCampo}>{erro}</span>}

            {valor && (
                <button type="button" className={styles.botaoRemoverImagem} onClick={() => aoMudar('')}>
                    Remover e usar imagem padrão
                </button>
            )}
        </div>
    );
}
