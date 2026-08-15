import { isPlacaCarro } from '../formatacao/placa';

const ANO_MINIMO = 1950;

export function validarVeiculo(dados) {
  const erros = {};
  const anoMaximo = new Date().getFullYear() + 1;

  if (!dados.marca || !dados.marca.trim()) {
    erros.marca = 'Marca é obrigatória';
  }

  if (!dados.modelo || !dados.modelo.trim()) {
    erros.modelo = 'Modelo é obrigatório';
  }

  const anoTexto = (dados.ano || '').toString().trim();
  const anoNumero = Number(anoTexto);
  if (!anoTexto) {
    erros.ano = 'Ano é obrigatório';
  } else if (!/^\d{4}$/.test(anoTexto) || anoNumero < ANO_MINIMO || anoNumero > anoMaximo) {
    erros.ano = `Informe um ano válido entre ${ANO_MINIMO} e ${anoMaximo}`;
  }

  if (!dados.cor || !dados.cor.trim()) {
    erros.cor = 'Cor é obrigatória';
  }

  const placaTexto = (dados.placa || '').trim();
  if (!placaTexto) {
    erros.placa = 'Placa é obrigatória';
  } else if (!isPlacaCarro(placaTexto)) {
    erros.placa = 'Informe uma placa válida (ex: ABC1234 ou ABC1D23)';
  }

  return {
    isValid: Object.keys(erros).length === 0,
    errors: erros,
  };
}
