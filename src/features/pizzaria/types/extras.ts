export interface Extra {
  readonly id: string;
  readonly nome: string;
  readonly preco: string;
}

export const extras: readonly Extra[] = [
  {
    id: 'bacon',
    nome: 'Bacon',
    preco: '5.00',
  },
  {
    id: 'catupiry',
    nome: 'Catupiry',
    preco: '6.00',
  },
  {
    id: 'cheddar',
    nome: 'Cheddar',
    preco: '5.00',
  },
  {
    id: 'calabresa',
    nome: 'Calabresa',
    preco: '7.00',
  },
  {
    id: 'mussarela',
    nome: 'Mussarela',
    preco: '6.00',
  },
];