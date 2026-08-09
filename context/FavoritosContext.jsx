import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { favoritoService } from '../services/FavoritoService';
import { useAuth } from './AuthContext';

const FavoritosContext = createContext(null);

export function FavoritosProvider({ children }) {
    const [favoritos, setFavoritos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    const refreshFavoritos = useCallback(async () => {
        if (!user) {
            setFavoritos([]);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const data = await favoritoService.buscarFavoritosUsuario(user.id);
            setFavoritos(data);
        } catch (err) {
            setError('Não foi possível carregar os favoritos.');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        refreshFavoritos();
    }, [refreshFavoritos]);

    return (
        <FavoritosContext.Provider value={{ favoritos, loading, error, refreshFavoritos }}>
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
