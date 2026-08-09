/**
 * Formata uma placa de carro para o padrão "AAA-1234".
 * @param {string} placaCarro 
 * @returns {string|boolean} Placa formatada ou false se inválida
 */
export const formatarPlacaCarro = (placaCarro) => {
    placaCarro = placaCarro.toUpperCase();
    
    var placaCarroLimpa = placaCarro.replace(/[^\w]+/g, '');

    if (placaCarro !== placaCarroLimpa) return placaCarroLimpa;

    return placaCarroLimpa.replace(/(\w{3})(\d{4})/, '$1-$2');
}

export const isPlacaCarro = (placaCarro) => {
    if (!placaCarro) return false;

    const regexPlaca = /^([A-Z]{3}[0-9]{1}[A-Z]{1}[0-9]{2})|([A-Z]{3}\-?[0-9]{4})$/;
    return regexPlaca.test(placaCarro);
}