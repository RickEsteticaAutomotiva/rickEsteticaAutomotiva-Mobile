import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { carrinhoService } from '../services/CarrinhoService';
import { useAuth } from './AuthContext';

const CarrinhoContext = createContext(null);

export function CarrinhoProvider({ children }) {
    const [quantidadeItens, setQuantidadeItens] = useState(0);
    const { user } = useAuth();

    const atualizarCarrinho = useCallback(async () => {
        if (!user) {
            setQuantidadeItens(0);
            return;
        }
        try {
            const data = await carrinhoService.buscarCarrinhoUsuario(user.id);
            setQuantidadeItens(data?.length ?? 0);
        } catch {
            setQuantidadeItens(0);
        }
    }, [user]);

    useEffect(() => {
        atualizarCarrinho();
    }, [atualizarCarrinho]);

    return (
        <CarrinhoContext.Provider value={{ quantidadeItens, atualizarCarrinho }}>
            {children}
        </CarrinhoContext.Provider>
    );
}

export function useCarrinho() {
    const context = useContext(CarrinhoContext);
    if (!context) {
        throw new Error('useCarrinho deve ser usado dentro de CarrinhoProvider');
    }
    return context;
}
