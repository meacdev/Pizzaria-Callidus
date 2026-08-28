import { useState } from 'react';
import { redimensionarEComprimir } from '../utils/imagem.utils';
import styles from '../pages/CustomizationPage.module.css';

interface CampoImagemProps {
    label: string;
    valor: string;
    aoMudar: (dataUrl: string) => void;
    larguraMaxima?: number;
}

export function CampoImagem({ label, valor, aoMudar, larguraMaxima = 900 }: CampoImagemProps) {
    const [processando, setProcessando] = useState(false);
    const [erro, setErro] = useState('');

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
