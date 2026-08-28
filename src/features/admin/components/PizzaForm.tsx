import {
  useState,
  type FormEvent,
} from 'react';

import type {
    Categoria,
  Pizza,
  TamanhosDisponiveis,
} from '../../pizzaria/types/pizza';

import type { PizzaFormData } from '../api/pizzaAdmin.service';

import { Campo } from './Campo';
import { BotaoSalvar } from './BotaoSalvar';

import styles from '../pages/PizzaAdminPage.module.css';

interface PizzaFormProps {
  pizzaEmEdicao: Pizza | null;
  onSalvar: (
    dados: PizzaFormData,
  ) => Promise<void>;
  onCancelar: () => void;
}

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
  };
}

export function PizzaForm({
  pizzaEmEdicao,
  onSalvar,
  onCancelar,
}: PizzaFormProps) {
  const [dados, setDados] =
    useState<PizzaFormData>(
      () =>
        paraFormData(
          pizzaEmEdicao,
        ),
    );

  const [salvando, setSalvando] =
    useState(false);

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