export interface Comanda {
  id: string;
  mesaId: number;
  nomeCliente: string;
  itens: any[];
  total: number;
  status: 'ABERTA' | 'PAGA';
}

export interface Mesa {
  id: number;
  status: 'LIVRE' | 'OCUPADA';
}
