/**
 * Formata um valor numérico para o formato de moeda brasileira (pt-BR).
 * @param {number|string} valor - Valor a ser formatado
 * @param {boolean} incluirSimbolo - Se deve incluir o símbolo R$ (padrão: true)
 * @returns {string} Valor formatado (ex: "R$\u00a01.200,00" ou "1.200,00")
 */
export const formatarPreco = (valor, incluirSimbolo = true) => {
    const numero = Number(valor);
    if (isNaN(numero)) {
        return incluirSimbolo ? 'R$\u00a00,00' : '0,00';
    }

    return numero.toLocaleString('pt-BR', {
        style: incluirSimbolo ? 'currency' : 'decimal',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};