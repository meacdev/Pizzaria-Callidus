/** O salão da pizzaria tem 10 mesas de 4 lugares cada. */
export const CAPACIDADE_MESA = 4;
export const NUMERO_DE_MESAS = 10;
export const NUMEROS_DAS_MESAS: readonly number[] = Array.from(
  { length: NUMERO_DE_MESAS },
  (_, indice) => indice + 1,
);
