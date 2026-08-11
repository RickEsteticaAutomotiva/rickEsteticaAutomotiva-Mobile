import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { carrinhoService } from '../services/CarrinhoService';
import { normalizarCarrinho } from '../utils/normalizacao';
import { useAuth } from './AuthContext';

/**
 * @typedef {{
 *   idCarrinho: number|string,
 *   idServico: number|string,
 *   nome: string,
 *   descricao: string,
 *   preco: number|string,
 *   imagem?: string,
 * }} ItemCarrinho
 * @typedef {{
 *   itens: ItemCarrinho[],
 *   loading: boolean,
 *   erro: string | null,
 *   quantidadeItens: number,
 *   subtotal: number,
 *   total: number,
 *   carregarCarrinho: () => Promise<void>,
 *   adicionarServico: (idServico: number|string) => Promise<void>,
 *   removerItem: (idCarrinho: number|string) => Promise<void>,
 * }} CarrinhoContextValue
 */

/** @type {import('react').Context<CarrinhoContextValue | null>} */
const CarrinhoContext = createContext(null);

export function CarrinhoProvider({ children }) {
    const [itens, setItens] = useState(/** @type {ItemCarrinho[]} */ ([]));
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState(/** @type {string | null} */ (null));
    const { user } = useAuth();

    const carregarCarrinho = useCallback(async () => {
        if (!user?.id) {
            setItens([]);
            return;
        }

        setLoading(true);
        setErro(null);

        try {
            const response = await carrinhoService.buscarCarrinhoUsuario(user.id);
            setItens(normalizarCarrinho(response));
        } catch (error) {
            setErro(error.message || 'Não foi possível carregar o carrinho.');
            setItens([]);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        carregarCarrinho();
    }, [carregarCarrinho]);

    // O POST /carrinhos não retorna o item criado (apenas 201 sem corpo), então
    // não há como montar a nova entrada localmente com segurança — recarregamos
    // do backend, que continua sendo a fonte de verdade.
    const adicionarServico = useCallback(
        async (idServico) => {
            if (!user?.id) {
                throw new Error('Usuário não autenticado.');
            }

            await carrinhoService.adicionarServicoCarrinho(user.id, idServico);
            await carregarCarrinho();
        },
        [user?.id, carregarCarrinho]
    );

    // Já sabemos exatamente qual idCarrinho foi removido e o DELETE confirmou a
    // remoção no backend, então atualizar o estado local é seguro e evita uma
    // requisição extra.
    const removerItem = useCallback(async (idCarrinho) => {
        await carrinhoService.removerItemCarrinho(idCarrinho);
        setItens((atual) => atual.filter((item) => item.idCarrinho !== idCarrinho));
    }, []);

    const subtotal = itens.reduce((soma, item) => soma + (Number(item.preco) || 0), 0);

    return (
        <CarrinhoContext.Provider
            value={{
                itens,
                loading,
                erro,
                quantidadeItens: itens.length,
                subtotal,
                total: subtotal,
                carregarCarrinho,
                adicionarServico,
                removerItem,
            }}
        >
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
