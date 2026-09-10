import { useMemo, useState } from 'react';
import { calcularMediaAvaliacao, useAvaliacaoStore } from '../store/avaliacao.store';
import styles from './SistemaAvaliacao.module.css';

const ESTRELAS = [1, 2, 3, 4, 5] as const;

function formatarMedia(media: number): string {
  return media.toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

export function SistemaAvaliacao() {
  const avaliacoes = useAvaliacaoStore((state) => state.avaliacoes);
  const avaliar = useAvaliacaoStore((state) => state.avaliar);
  const [notaSelecionada, setNotaSelecionada] = useState(0);
  const [mensagem, setMensagem] = useState('');

  const media = useMemo(
    () => calcularMediaAvaliacao(avaliacoes),
    [avaliacoes],
  );

  const quantidadeAvaliacoes = avaliacoes.length;

  function enviarAvaliacao() {
    if (!notaSelecionada) {
      setMensagem('Selecione uma nota de 1 a 5 estrelas.');
      return;
    }

    avaliar(notaSelecionada);
    setMensagem(`Obrigado pela avaliação de ${notaSelecionada} estrela${notaSelecionada > 1 ? 's' : ''}!`);
    setNotaSelecionada(0);
  }

  return (
    <section className={styles.container} aria-labelledby="avaliacao-titulo">
      <div className={styles.cabecalho}>
        <div>
          <span className="tag">Sua opinião importa</span>
          <h2 id="avaliacao-titulo">Avalie nosso atendimento</h2>
          <p>Escolha de 1 a 5 estrelas. A média é atualizada automaticamente após cada avaliação.</p>
        </div>

        <div className={styles.resumo} aria-label={`${formatarMedia(media)} de 5 estrelas, ${quantidadeAvaliacoes} avaliações`}>
          <strong>{formatarMedia(media)}</strong>
          <div className={styles.estrelasMedia} aria-hidden="true">
            {ESTRELAS.map((estrela) => (
              <span key={estrela} className={estrela <= Math.round(media) ? styles.estrelaAtiva : styles.estrela}>
                ★
              </span>
            ))}
          </div>
          <span>
            {quantidadeAvaliacoes === 1
              ? '1 avaliação'
              : `${quantidadeAvaliacoes} avaliações`}
          </span>
        </div>
      </div>

      <div className={styles.formulario}>
        <div className={styles.seletor} role="radiogroup" aria-label="Escolha sua nota">
          {ESTRELAS.map((estrela) => (
            <button
              key={estrela}
              type="button"
              className={estrela <= notaSelecionada ? styles.estrelaBotaoAtiva : styles.estrelaBotao}
              onClick={() => setNotaSelecionada(estrela)}
              role="radio"
              aria-checked={notaSelecionada === estrela}
              aria-label={`${estrela} estrela${estrela > 1 ? 's' : ''}`}
            >
              ★
            </button>
          ))}
        </div>

        <button
          type="button"
          className="botao-primario"
          onClick={enviarAvaliacao}
        >
          Enviar avaliação
        </button>
      </div>

      {mensagem && (
        <p className={styles.mensagem} role="status" aria-live="polite">
          {mensagem}
        </p>
      )}
    </section>
  );
}
