const obterDataValida = (dataString) => {
    const data = new Date(dataString);
    return Number.isNaN(data.getTime()) ? null : data;
};

/**
 * Formata uma data para o formato brasileiro completo
 * @param {string|Date} dataString - Data a ser formatada
 * @param {string} fallback - Valor de fallback quando a data for inválida
 * @returns {string} Data formatada (ex: "segunda-feira, 12 de novembro de 2025")
 */
export const formatarDataCompleta = (dataString, fallback = '--/--/----') => {
    const data = obterDataValida(dataString);

    if (!data) {
        return fallback;
    }

    return data.toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

/**
 * Formata uma data para o formato brasileiro simples
 * @param {string|Date} dataString - Data a ser formatada
 * @param {string} fallback - Valor de fallback quando a data for inválida
 * @returns {string} Data formatada (ex: "12/11/2025")
 */
export const formatarDataSimples = (dataString, fallback = '--/--/----') => {
    const data = obterDataValida(dataString);

    if (!data) {
        return fallback;
    }

    return data.toLocaleDateString('pt-BR');
};

/**
 * Formata o horário no formato brasileiro
 * @param {string|Date} dataString - Data/hora a ser formatada
 * @param {string} fallback - Valor de fallback quando a data for inválida
 * @returns {string} Horário formatado (ex: "14:30")
 */
export const formatarHorario = (dataString, fallback = '--:--') => {
    const data = obterDataValida(dataString);

    if (!data) {
        return fallback;
    }

    return data.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
    });
};

/**
 * Formata data e horário juntos
 * @param {string|Date} dataString - Data/hora a ser formatada
 * @param {string} fallback - Valor de fallback quando a data for inválida
 * @returns {string} Data e horário formatados (ex: "12/11/2025 às 14:30")
 */
export const formatarDataHorario = (dataString, fallback = '--/--/---- às --:--') => {
    const data = obterDataValida(dataString);

    if (!data) {
        return fallback;
    }

    return `${formatarDataSimples(data)} às ${formatarHorario(data)}`;
};

/**
 * Formata data e horário completos
 * @param {string|Date} dataString - Data/hora a ser formatada
 * @param {string} fallback - Valor de fallback quando a data for inválida
 * @returns {string} Data e horário formatados (ex: "segunda-feira, 12 de novembro de 2025 às 14:30")
 */
export const formatarDataHorarioCompleto = (dataString, fallback = '--/--/---- às --:--') => {
    const data = obterDataValida(dataString);

    if (!data) {
        return fallback;
    }

    return `${formatarDataCompleta(data)} às ${formatarHorario(data)}`;
};