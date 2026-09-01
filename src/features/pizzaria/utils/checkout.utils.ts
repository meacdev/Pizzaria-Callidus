import type { DadosCheckout, ErrosCheckout } from '../types/checkout';

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGEX_TELEFONE = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
const REGEX_CEP = /^\d{5}-\d{3}$/;

export function mascararTelefone(valor: string): string {
  const digitos = valor.replace(/\D/g, '').slice(0, 11);
  if (digitos.length <= 2) return digitos.replace(/^(\d*)/, '($1');
  if (digitos.length <= 6) return digitos.replace(/^(\d{2})(\d*)/, '($1) $2');
  if (digitos.length <= 10) return digitos.replace(/^(\d{2})(\d{4})(\d*)/, '($1) $2-$3');
  return digitos.replace(/^(\d{2})(\d{5})(\d*)/, '($1) $2-$3');
}

export function mascararCep(valor: string): string {
  const digitos = valor.replace(/\D/g, '').slice(0, 8);
  if (digitos.length <= 5) return digitos;
  return digitos.replace(/^(\d{5})(\d*)/, '$1-$2');
}

export function mascararCpf(valor: string): string {
  const digitos = valor.replace(/\D/g, '').slice(0, 11);
  return digitos
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
}

function campoObrigatorio(valor: string): boolean {
  return valor.trim().length === 0;
}

function calcularDigitoVerificadorCpf(base: string, pesoInicial: number): number {
  const soma = base
    .split('')
    .reduce((acumulado, digito, indice) => acumulado + Number(digito) * (pesoInicial - indice), 0);
  const resto = soma % 11;
  return resto < 2 ? 0 : 11 - resto;
}

export function validarCPF(cpf: string): boolean {
  const digitos = cpf.replace(/\D/g, '');

  if (digitos.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digitos)) return false; // ex: 111.111.111-11

  const primeiroDigito = calcularDigitoVerificadorCpf(digitos.slice(0, 9), 10);
  const segundoDigito = calcularDigitoVerificadorCpf(digitos.slice(0, 9) + primeiroDigito, 11);

  return digitos.slice(9) === `${primeiroDigito}${segundoDigito}`;
}

export function validarFormularioCheckout(dados: DadosCheckout): ErrosCheckout {
  const erros: ErrosCheckout = {};
  const { cliente, endereco } = dados;

  if (campoObrigatorio(cliente.nome)) {
    erros.nome = 'Informe seu nome completo.';
  } else if (cliente.nome.trim().split(/\s+/).length < 2) {
    erros.nome = 'Informe nome e sobrenome.';
  }

  if (campoObrigatorio(cliente.email)) {
    erros.email = 'Informe um e-mail.';
  } else if (!REGEX_EMAIL.test(cliente.email.trim())) {
    erros.email = 'Informe um e-mail válido.';
  }

  if (campoObrigatorio(cliente.telefone)) {
    erros.telefone = 'Informe um telefone para contato.';
  } else if (!REGEX_TELEFONE.test(cliente.telefone.trim())) {
    erros.telefone = 'Informe um telefone válido, com DDD. Ex: (92) 91234-5678';
  }

  if (campoObrigatorio(cliente.cpf)) {
    erros.cpf = 'Informe seu CPF.';
  } else if (!validarCPF(cliente.cpf)) {
    erros.cpf = 'CPF inválido.';
  }

  if (campoObrigatorio(endereco.cep)) {
    erros.cep = 'Informe o CEP.';
  } else if (!REGEX_CEP.test(endereco.cep.trim())) {
    erros.cep = 'CEP inválido. Use o formato 00000-000.';
  }

  if (campoObrigatorio(endereco.rua)) erros.rua = 'Informe a rua ou avenida.';
  if (campoObrigatorio(endereco.numero)) erros.numero = 'Informe o número.';
  if (campoObrigatorio(endereco.bairro)) erros.bairro = 'Informe o bairro.';
  if (campoObrigatorio(endereco.cidade)) erros.cidade = 'Informe a cidade.';

  if (!dados.formaPagamento) {
    erros.formaPagamento = 'Selecione uma forma de pagamento.';
  }

  if (dados.formaPagamento === 'dinheiro' && dados.trocoPara.trim()) {
    const valorTroco = Number(dados.trocoPara.replace(',', '.'));
    if (Number.isNaN(valorTroco) || valorTroco <= 0) {
      erros.trocoPara = 'Informe um valor válido para o troco.';
    }
  }

  return erros;
}