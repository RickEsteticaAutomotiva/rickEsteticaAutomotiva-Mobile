import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { favoritoService } from '../services/FavoritoService';
import { normalizarFavoritos } from '../utils/normalizacao';
import { useAuth } from './AuthContext';

/**
 * @typedef {{
 *   favoritos: import('../types').Favorito[],
 *   loading: boolean,
 *   erro: string | null,
 *   carregarFavoritos: () => Promise<void>,
 *   isFavorito: (idServico: number|string) => boolean,
 *   adicionarFavorito: (idServico: number|string) => Promise<void>,
 *   removerFavorito: (idServico: number|string) => Promise<void>,
 *   alternarFavorito: (idServico: number|string) => Promise<void>,
 * }} FavoritosContextValue
 */

/** @type {import('react').Context<FavoritosContextValue | null>} */
const FavoritosContext = createContext(null);

export function FavoritosProvider({ children }) {
    const [favoritos, setFavoritos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState(null);
    const { user } = useAuth();

    const carregarFavoritos = useCallback(async () => {
        if (!user?.id) {
            setFavoritos([]);
            return;
        }

        setLoading(true);
        setErro(null);

        try {
            const response = await favoritoService.buscarFavoritosUsuario(user.id);
            setFavoritos(normalizarFavoritos(response));
        } catch (error) {
            setErro(error.message || 'Não foi possível carregar os favoritos.');
            setFavoritos([]);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        carregarFavoritos();
    }, [carregarFavoritos]);

    const isFavorito = useCallback(
        (idServico) => favoritos.some((favorito) => String(favorito.idServico) === String(idServico)),
        [favoritos]
    );

    const adicionarFavorito = useCallback(
        async (idServico) => {
            if (!user?.id) {
                throw new Error('Usuário não autenticado.');
            }

            await favoritoService.adicionarServicoFavorito(user.id, idServico);
            await carregarFavoritos();
        },
        [user?.id, carregarFavoritos]
    );

    const removerFavorito = useCallback(
        async (idServico) => {
            const favorito = favoritos.find((item) => String(item.idServico) === String(idServico));

            if (!favorito) {
                return;
            }

            await favoritoService.removerItemFavorito(favorito.id);
            setFavoritos((atual) => atual.filter((item) => item.id !== favorito.id));
        },
        [favoritos]
    );

    const alternarFavorito = useCallback(
        async (idServico) => {
            if (isFavorito(idServico)) {
                await removerFavorito(idServico);
            } else {
                await adicionarFavorito(idServico);
            }
        },
        [isFavorito, removerFavorito, adicionarFavorito]
    );

    return (
        <FavoritosContext.Provider
            value={{
                favoritos,
                loading,
                erro,
                carregarFavoritos,
                isFavorito,
                adicionarFavorito,
                removerFavorito,
                alternarFavorito,
            }}
        >
            {children}
        </FavoritosContext.Provider>
    );
}

export function useFavoritos() {
    const context = useContext(FavoritosContext);
    if (!context) {
        throw new Error('useFavoritos deve ser usado dentro de FavoritosProvider');
    }
    return context;
}
