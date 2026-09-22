/**
 * @file SistemaAvaliacao.tsx
 * @brief Widget de avaliação por estrelas (1 a 5) do atendimento da loja.
 *
 * @details
 * Lê e grava as avaliações via @see avaliacao.store; cada cliente só pode
 * avaliar uma vez (`jaAvaliou`), controlado pela store.
 */
import { useMemo, useState } from 'react';
import { calcularMediaAvaliacao, useAvaliacaoStore } from '../store/avaliacao.store';
import styles from './SistemaAvaliacao.module.css';

const ESTRELAS = [1, 2, 3, 4, 5] as const;

/** @brief Formata a nota média com uma casa decimal, no padrão pt-BR. */
function formatarMedia(media: number): string {
  return media.toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

/** @brief Widget com a média de avaliações da loja e o formulário para enviar uma nova avaliação. */
export function SistemaAvaliacao() {
  const avaliacoes = useAvaliacaoStore((state) => state.avaliacoes);
  const avaliar = useAvaliacaoStore((state) => state.avaliar);
  const jaAvaliou = useAvaliacaoStore((state) => state.jaAvaliou);
  const [notaSelecionada, setNotaSelecionada] = useState(0);
  const [mensagem, setMensagem] = useState('');

  const media = useMemo(
    () => calcularMediaAvaliacao(avaliacoes),
    [avaliacoes],
  );

  const quantidadeAvaliacoes = avaliacoes.length;

  function enviarAvaliacao() {
    if (jaAvaliou) {
      return;
    }

    if (!notaSelecionada) {
      setMensagem('Selecione uma nota de 1 a 5 estrelas.');
      return;
    }

    avaliar(notaSelecionada);
    setMensagem('Obrigado pela sua avaliação!');
    setNotaSelecionada(0);
  }

  return (
    <section className={styles.container} aria-labelledby="avaliacao-titulo">
      <div className={styles.cabecalho}>
        <div>
          <span className="tag">Sua opinião importa</span>
          <h2 id="avaliacao-titulo">Avalie nosso atendimento</h2>
          <p>Escolha de 1 a 5 estrelas.</p>
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

      {jaAvaliou ? (
        <p className={styles.mensagem} role="status" aria-live="polite">
          Obrigado pela sua avaliação!
        </p>
      ) : (
        <>
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
        </>
      )}
    </section>
  );
}
