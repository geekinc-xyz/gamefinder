
'use client';

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { getFavorites } from '@/app/actions';
import type { FavoriteItem } from '@/lib/types';
import { GameCard, GameCardSkeleton } from '@/components/game-card';
import { FranchiseCard, FranchiseCardSkeleton } from '@/components/franchise-card';
import { Game, Franchise } from '@/lib/types';

export default function FavoritesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    if (user) {
      setLoading(true);
      try {
        const userFavorites = await getFavorites(user.uid);
        setFavorites(userFavorites);
      } catch (error) {
        console.error("Failed to fetch favorites:", error);
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading, fetchFavorites]);

  const games = favorites.filter(f => f.itemType === 'game').map(f => ({ id: f.itemId, name: f.name, coverUrl: f.coverUrl, platforms: [], rating: 0 } as Game));
  const franchises = favorites.filter(f => f.itemType === 'franchise').map(f => ({ id: f.itemId, name: f.name, coverUrl: f.coverUrl, games: [] } as Franchise));

  const renderSkeletons = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-6">
      {Array.from({ length: 10 }).map((_, i) => (
        <GameCardSkeleton key={`skeleton-${i}`} />
      ))}
    </div>
  );

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 md:px-8 py-8">
        <h1 className="text-4xl font-extrabold tracking-tighter mb-8">Mes Favoris</h1>
        {renderSkeletons()}
      </div>
    );
  }
  
  if (!user) {
    return null; // Redirecting...
  }

  return (
    <main className="container mx-auto px-4 sm:px-6 md:px-8 py-8">
      <h1 className="text-4xl font-extrabold tracking-tighter mb-8">Mes Favoris</h1>

      {favorites.length === 0 ? (
        <div className="text-center py-20">
          <h2 className="text-2xl font-semibold mb-2">Aucun favori pour le moment</h2>
          <p className="text-muted-foreground">Cliquez sur l'icône cœur sur un jeu ou une franchise pour l'ajouter ici.</p>
        </div>
      ) : (
        <>
          {games.length > 0 && (
            <>
              <h2 className="text-2xl font-bold tracking-tight mb-4">Jeux ({games.length})</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {games.map(game => (
                  <GameCard key={`game-${game.id}`} game={game} />
                ))}
              </div>
            </>
          )}

          {franchises.length > 0 && (
            <>
              <h2 className="text-2xl font-bold tracking-tight mt-12 mb-4">Franchises ({franchises.length})</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {franchises.map(franchise => (
                  <FranchiseCard key={`franchise-${franchise.id}`} franchise={franchise} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </main>
  );
}

    