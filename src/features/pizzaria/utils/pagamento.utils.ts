import type { FormaPagamento } from '../types/checkout';
import type { DadosCartao, ErrosCartao, InfoPagamentoSimulado } from '../types/pagamento';

const REGEX_NUMERO_CARTAO = /^(\d{4} ){3}\d{4}$/;
const REGEX_VALIDADE = /^(0[1-9]|1[0-2])\/\d{2}$/;
const REGEX_CVV = /^\d{3,4}$/;

export function mascararNumeroCartao(valor: string): string {
  const digitos = valor.replace(/\D/g, '').slice(0, 16);
  return digitos.replace(/(\d{4})(?=\d)/g, '$1 ');
}

export function mascararValidadeCartao(valor: string): string {
  const digitos = valor.replace(/\D/g, '').slice(0, 4);
  if (digitos.length <= 2) return digitos;
  return `${digitos.slice(0, 2)}/${digitos.slice(2)}`;
}

export function mascararCvv(valor: string): string {
  return valor.replace(/\D/g, '').slice(0, 4);
}

function campoObrigatorio(valor: string): boolean {
  return valor.trim().length === 0;
}

export function validarDadosCartao(dados: DadosCartao): ErrosCartao {
  const erros: ErrosCartao = {};

  if (campoObrigatorio(dados.numero)) {
    erros.numero = 'Informe o número do cartão.';
  } else if (!REGEX_NUMERO_CARTAO.test(dados.numero.trim())) {
    erros.numero = 'Número de cartão inválido. Use 16 dígitos.';
  }

  if (campoObrigatorio(dados.nomeImpresso)) {
    erros.nomeImpresso = 'Informe o nome impresso no cartão.';
  }

  if (campoObrigatorio(dados.validade)) {
    erros.validade = 'Informe a validade do cartão.';
  } else if (!REGEX_VALIDADE.test(dados.validade.trim())) {
    erros.validade = 'Validade inválida. Use o formato MM/AA.';
  }

  if (campoObrigatorio(dados.cvv)) {
    erros.cvv = 'Informe o CVV.';
  } else if (!REGEX_CVV.test(dados.cvv.trim())) {
    erros.cvv = 'CVV inválido.';
  }

  return erros;
}

export function identificarBandeiraCartao(numero: string): string {
  const digitos = numero.replace(/\D/g, '');

  if (/^4/.test(digitos)) return 'Visa';
  if (/^5[1-5]/.test(digitos)) return 'Mastercard';
  if (/^3[47]/.test(digitos)) return 'American Express';
  if (/^6(?:011|5)/.test(digitos)) return 'Elo';

  return 'Desconhecida';
}

export function gerarCodigoPixCopiaCola(semente: string, total: number): string {
  const valor = total.toFixed(2);
  const idCurto = semente.replace(/[^a-zA-Z0-9]/g, '').slice(0, 25).toUpperCase().padEnd(25, '0');

  return `00020126580014BR.GOV.BCB.PIX0136${idCurto}5204000053039865405${valor}5802BR5920PARADISO PIZZARIA6009SAO PAULO6304FFFF`;
}

const QR_CODE_API_ENDPOINT = 'https://api.qrserver.com/v1/create-qr-code/';

export function gerarUrlQrCodePix(codigoPix: string, tamanho = 200): string {
  const parametros = new URLSearchParams({
    size: `${tamanho}x${tamanho}`,
    data: codigoPix,
  });

  return `${QR_CODE_API_ENDPOINT}?${parametros.toString()}`;
}

export function simularProcessamentoPagamento(delayMs = 1800): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, delayMs);
  });
}

interface ContextoPagamento {
  readonly pedidoId: string;
  readonly total: number;
  readonly dadosCartao?: DadosCartao;
  readonly trocoPara?: string;
}

export function montarInfoPagamentoSimulado(
  forma: FormaPagamento,
  contexto: ContextoPagamento,
): InfoPagamentoSimulado {
  const confirmadoEm = new Date().toISOString();

  if (forma === 'pix') {
    return {
      forma,
      identificador: `PIX-${contexto.pedidoId.replace(/\W/g, '').slice(0, 8).toUpperCase()}`,
      detalhes: {
        codigoCopiaCola: gerarCodigoPixCopiaCola(contexto.pedidoId, contexto.total),
      },
      confirmadoEm,
    };
  }

  if (forma === 'cartao' && contexto.dadosCartao) {
    const ultimosDigitos = contexto.dadosCartao.numero.replace(/\D/g, '').slice(-4);

    return {
      forma,
      identificador: `CARTAO-**** ${ultimosDigitos}`,
      detalhes: {
        bandeira: identificarBandeiraCartao(contexto.dadosCartao.numero),
        parcelas: contexto.dadosCartao.parcelas,
        ultimosDigitos,
      },
      confirmadoEm,
    };
  }

  return {
    forma: 'dinheiro',
    identificador: 'PAGAMENTO-NA-ENTREGA',
    detalhes: {
      trocoPara: contexto.trocoPara?.trim() ? contexto.trocoPara : 'Sem troco',
    },
    confirmadoEm,
  };
}