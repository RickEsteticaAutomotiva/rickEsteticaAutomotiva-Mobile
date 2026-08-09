import { useState, useCallback } from 'react';

/** @deprecated Use useToast() do ToastContext para toasts globais. */
export function UseToast() {
    const [toasts, setToasts] = useState([]);

    const mostrarToast = useCallback(({ 
        tipo = 'info', 
        titulo, 
        subtitulo, 
        mensagem, 
        duracao = 3000 
    }) => {
        const id = Date.now().toString() + Math.random().toString(36);
        const novoToast = {
            id,
            tipo,
            titulo,
            subtitulo,
            mensagem,
            duracao
        };

        setToasts(anterior => [...anterior, novoToast]);

        return id;
    }, []);

    const fecharToast = useCallback((id: string) => {
        setToasts(anterior => anterior.filter(toast => toast.id !== id));
    }, []);

    return {
        toasts,
        mostrarToast,
        fecharToast
    };
}

/** Alias camelCase — preferível ao PascalCase acima. */
export const useToast = UseToast;