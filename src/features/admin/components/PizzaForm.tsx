/**
 * @file PizzaForm.tsx
 * @brief Formulário de criação/edição de pizza no painel administrativo.
 *
 * @details
 * Usado tanto para cadastrar uma pizza nova quanto para editar uma já
 * existente — o modo é definido por `pizzaEmEdicao` (@see
 * PizzaAdminPage.tsx, que fornece `onSalvar`/`onCancelar`).
 */
import {
  useState,
  type FormEvent,
} from 'react';

import type {
    Categoria,
  DescontoPizza,
  Pizza,
  TamanhosDisponiveis,
} from '../../pizzaria/types/pizza';

import type { PizzaFormData } from '../api/pizzaAdmin.service';

import { Campo } from './Campo';
import { BotaoSalvar } from './BotaoSalvar';

import styles from '../pages/PizzaAdminPage.module.css';

/** @brief Props do formulário de pizza: pizza em edição (ou `null` para criação), callback de salvar e de cancelar. */
interface PizzaFormProps {
  pizzaEmEdicao: Pizza | null;
  onSalvar: (
    dados: PizzaFormData,
  ) => Promise<void>;
  onCancelar: () => void;
}

/** @brief Tamanhos de pizza disponíveis para seleção no formulário, com o rótulo exibido ao usuário. */
const TAMANHOS: {
  valor: TamanhosDisponiveis;
  nome: string;
}[] = [
  {
    valor: 'P',
    nome: 'Pequena (P)',
  },
  {
    valor: 'M',
    nome: 'Média (M)',
  },
  {
    valor: 'G',
    nome: 'Grande (G)',
  },
  {
    valor: 'F',
    nome: 'Família (F)',
  },
];

/**
 * @brief Converte uma `Pizza` (ou `null`) no formato usado pelos campos do formulário.
 * @param pizza Pizza a editar, ou `null` para os valores padrão de uma pizza nova.
 * @return Dados prontos para popular o estado do formulário.
 */
function paraFormData(
  pizza: Pizza | null,
): PizzaFormData {
  if (!pizza) {
    return {
      nome: '',
      precoBase: '',
      categoria: 'tradicional',
      imgURL: '',
      ingredientes: '',
      tamanhosDisponiveis: [
        'P',
        'M',
        'G',
      ],
      permiteBorda: true,
    };
  }

  return {
    nome: pizza.nome,

    precoBase:
      pizza.precoBase,

    categoria:
      pizza.categoria,

    imgURL:
      pizza.imgURL,

    ingredientes:
      pizza.ingredientes
        .map(
          (ingrediente) =>
            ingrediente.nome,
        )
        .join(', '),

    tamanhosDisponiveis:
      pizza.tamanhosDisponiveis?.length >
      0
        ? [
            ...pizza.tamanhosDisponiveis,
          ]
        : [
            'P',
            'M',
            'G',
          ],

    permiteBorda:
      pizza.permiteBorda,

    desconto:
      pizza.desconto ?? null,
  };
}

/** @brief Data de hoje no formato "AAAA-MM-DD", usada como início padrão de uma nova promoção. */
function hojeIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/** @brief Data de 7 dias a partir de hoje no formato "AAAA-MM-DD", usada como fim padrão de uma nova promoção. */
function daquiAUmaSemanaIso(): string {
  const data = new Date();
  data.setDate(data.getDate() + 7);
  return data.toISOString().slice(0, 10);
}

/** @brief Formulário de cadastro/edição de pizza, com seleção de tamanhos disponíveis e borda recheada. */
export function PizzaForm({
  pizzaEmEdicao,
  onSalvar,
  onCancelar,
}: Readonly<PizzaFormProps>) {
  const [dados, setDados] =
    useState<PizzaFormData>(
      () =>
        paraFormData(
          pizzaEmEdicao,
        ),
    );

  const [salvando, setSalvando] =
    useState(false);

  const [promocaoAtiva, setPromocaoAtiva] =
    useState(
      !!pizzaEmEdicao?.desconto,
    );

  const [descontoRascunho, setDescontoRascunho] =
    useState<DescontoPizza>(
      () =>
        pizzaEmEdicao?.desconto ?? {
          percentual: 10,
          inicio: hojeIso(),
          fim: daquiAUmaSemanaIso(),
        },
    );

  /** @brief Atualiza um campo do desconto em edição e já reflete a mudança em `dados.desconto` quando a promoção está ativa. */
  function atualizarDesconto<K extends keyof DescontoPizza>(
    campo: K,
    valor: DescontoPizza[K],
  ) {
    setDescontoRascunho((atual) => {
      const novoDesconto = { ...atual, [campo]: valor };
      if (promocaoAtiva) {
        atualizarCampo('desconto', novoDesconto);
      }
      return novoDesconto;
    });
  }

  /** @brief Liga/desliga a promoção da pizza, refletindo em `dados.desconto` (objeto quando ativa, `null` quando não). */
  function alternarPromocao(ativa: boolean) {
    setPromocaoAtiva(ativa);
    atualizarCampo('desconto', ativa ? descontoRascunho : null);
  }

  const atualizarCampo = <
    K extends keyof PizzaFormData
  >(
    campo: K,
    valor: PizzaFormData[K],
  ) => {
    setDados(
      (atual) => ({
        ...atual,
        [campo]: valor,
      }),
    );
  };

  function alternarTamanho(
    tamanho: TamanhosDisponiveis,
  ) {
    setDados(
      (atual) => {
        const tamanhos =
          atual.tamanhosDisponiveis ??
          [];

        const existe =
          tamanhos.includes(
            tamanho,
          );

        if (existe) {
          /*
           * Impede que todos os
           * tamanhos sejam removidos.
           */
          if (
            tamanhos.length === 1
          ) {
            return atual;
          }

          return {
            ...atual,
            tamanhosDisponiveis:
              tamanhos.filter(
                (item) =>
                  item !==
                  tamanho,
              ),
          };
        }

        return {
          ...atual,
          tamanhosDisponiveis: [
            ...tamanhos,
            tamanho,
          ],
        };
      },
    );
  }

  const onSubmit = async (
    evento: FormEvent,
  ) => {
    evento.preventDefault();

    setSalvando(true);

    try {
      await onSalvar(
        dados,
      );
    } finally {
      setSalvando(false);
    }
  };

  return (
    <form
      className={
        styles.formulario
      }
      onSubmit={onSubmit}
    >
      <h2
        className={
          styles.tituloFormulario
        }
      >
        {pizzaEmEdicao
          ? 'Editar pizza'
          : 'Nova pizza'}
      </h2>

      <Campo label="Nome">
        <input
          className={
            styles.input
          }
          value={
            dados.nome
          }
          onChange={(e) =>
            atualizarCampo(
              'nome',
              e.target.value,
            )
          }
          required
        />
      </Campo>

      <div
        className={
          styles.linha
        }
      >
        <Campo label="Preço (R$)">
          <input
            className={
              styles.input
            }
            type="number"
            step="0.01"
            min="0"
            value={
              dados.precoBase
            }
            onChange={(e) =>
              atualizarCampo(
                'precoBase',
                e.target.value,
              )
            }
            required
          />
        </Campo>

        <Campo label="Categoria">
          <select
            className={
              styles.input
            }
            value={
              dados.categoria
            }
            onChange={(e) =>
              atualizarCampo(
                'categoria',
                e.target.value as Categoria,
              )
            }
          >
            <option value="tradicional">
              Tradicional
            </option>

            <option value="doce">
              Doce
            </option>

            <option value="artesanal">
              Artesanal
            </option>
          </select>
        </Campo>
      </div>

      <Campo label="URL da imagem">
        <input
          className={
            styles.input
          }
          value={
            dados.imgURL
          }
          onChange={(e) =>
            atualizarCampo(
              'imgURL',
              e.target.value,
            )
          }
          placeholder="https://..."
        />
      </Campo>

      <Campo label="Ingredientes (separados por vírgula)">
        <input
          className={
            styles.input
          }
          value={
            dados.ingredientes
          }
          onChange={(e) =>
            atualizarCampo(
              'ingredientes',
              e.target.value,
            )
          }
          placeholder="Mussarela, Tomate, Manjericão"
        />
      </Campo>

      <Campo label="Tamanhos disponíveis">
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            marginTop: '8px',
          }}
        >
          {TAMANHOS.map(
            (tamanho) => {
              const selecionado =
                (
                  dados.tamanhosDisponiveis ??
                  []
                ).includes(
                  tamanho.valor,
                );

              return (
                <label
                  key={
                    tamanho.valor
                  }
                  style={{
                    display:
                      'flex',
                    alignItems:
                      'center',
                    gap: '6px',
                    cursor:
                      'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={
                      selecionado
                    }
                    onChange={() =>
                      alternarTamanho(
                        tamanho.valor,
                      )
                    }
                  />

                  {tamanho.nome}
                </label>
              );
            },
          )}
        </div>
      </Campo>

      <Campo label="Borda recheada">
        <label
          style={{
            display:
              'flex',
            alignItems:
              'center',
            gap: '8px',
            cursor:
              'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={
              dados.permiteBorda ??
              true
            }
            onChange={(e) =>
              atualizarCampo(
                'permiteBorda',
                e.target.checked,
              )
            }
          />

          Permitir borda recheada
        </label>
      </Campo>

      <Campo label="Promoção">
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            marginBottom: promocaoAtiva ? '10px' : 0,
          }}
        >
          <input
            type="checkbox"
            checked={promocaoAtiva}
            onChange={(e) => alternarPromocao(e.target.checked)}
          />
          Pizza em promoção (desconto temporário)
        </label>

        {promocaoAtiva && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              Desconto (%)
              <input
                className={styles.input}
                type="number"
                min={1}
                max={90}
                value={descontoRascunho.percentual}
                onChange={(e) => atualizarDesconto('percentual', Number(e.target.value))}
                style={{ width: '90px' }}
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              Início
              <input
                className={styles.input}
                type="date"
                value={descontoRascunho.inicio}
                onChange={(e) => atualizarDesconto('inicio', e.target.value)}
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              Fim
              <input
                className={styles.input}
                type="date"
                value={descontoRascunho.fim}
                min={descontoRascunho.inicio}
                onChange={(e) => atualizarDesconto('fim', e.target.value)}
              />
            </label>
          </div>
        )}
      </Campo>

      <div
        className={
          styles.acoesFormulario
        }
      >
        <button
          type="button"
          className={
            styles.botaoCancelar
          }
          onClick={
            onCancelar
          }
        >
          Cancelar
        </button>

        <BotaoSalvar>
          {salvando
            ? 'Salvando...'
            : 'Salvar pizza'}
        </BotaoSalvar>
      </div>
    </form>
  );
}