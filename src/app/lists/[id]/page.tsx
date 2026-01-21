
'use client';

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { getListDetails, removeItemFromList } from '@/app/actions';
import type { UserList, ListItem, Game, Franchise } from '@/lib/types';
import { GameCard, GameCardSkeleton } from '@/components/game-card';
import { FranchiseCard, FranchiseCardSkeleton } from '@/components/franchise-card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function ListDetailPage({ params }: { params: { id: string } }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const listId = params.id;
  const { toast } = useToast();

  const [list, setList] = useState<UserList | null>(null);
  const [items, setItems] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchListDetails = useCallback(async () => {
    if (user && listId) {
      setLoading(true);
      const { list: listDetails, items: listItems } = await getListDetails(user.uid, listId as string);
      if (!listDetails) {
        // Maybe redirect to a 404 page or lists page
        router.push('/lists');
        return;
      }
      setList(listDetails);
      setItems(listItems);
      setLoading(false);
    }
  }, [user, listId, router]);
  
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    fetchListDetails();
  }, [fetchListDetails]);
  
  const handleRemoveItem = async (itemId: string) => {
    if (!user) return;
    
    // Optimistic UI update
    const originalItems = items;
    setItems(items.filter(item => item.id !== itemId));

    try {
      await removeItemFromList(user.uid, listId as string, itemId);
      toast({ title: 'Élément supprimé', description: "L'élément a été retiré de la liste." });
    } catch (error) {
      setItems(originalItems); // Revert on error
      toast({ variant: 'destructive', title: 'Erreur', description: "Impossible de supprimer l'élément." });
    }
  };


  const games = items.filter(i => i.itemType === 'game').map(i => ({ id: i.itemId, name: i.name, coverUrl: i.coverUrl, rating: 0, platforms: [] } as Game));
  const franchises = items.filter(i => i.itemType === 'franchise').map(i => ({ id: i.itemId, name: i.name, coverUrl: i.coverUrl, games: [] } as Franchise));

  const renderSkeletons = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <GameCardSkeleton key={`skeleton-${i}`} />
      ))}
    </div>
  );

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 md:px-8 py-8">
        <div className="h-10 w-2/5 bg-muted animate-pulse mb-8 rounded-md" />
        {renderSkeletons()}
      </div>
    );
  }

  if (!user || !list) {
    return null; // or a proper not found component
  }

  return (
    <main className="container mx-auto px-4 sm:px-6 md:px-8 py-8">
       <div className="mb-8">
         <Button asChild variant="outline" size="sm" className="mb-4">
            <Link href="/lists">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à mes listes
            </Link>
         </Button>
        <h1 className="text-4xl font-extrabold tracking-tighter">{list.name}</h1>
        <p className="text-lg text-muted-foreground mt-2">{list.itemCount} élément(s)</p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <h2 className="text-2xl font-semibold mb-2">Cette liste est vide</h2>
          <p className="text-muted-foreground">Ajoutez des jeux ou des franchises pour commencer.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {items.map(item => (
            <div key={item.id} className="relative group/card">
              {item.itemType === 'game' ? (
                <GameCard game={{ id: item.itemId, name: item.name, coverUrl: item.coverUrl, rating: 0, platforms: [] } as Game} />
              ) : (
                <FranchiseCard franchise={{ id: item.itemId, name: item.name, coverUrl: item.coverUrl, games: [] } as Franchise} />
              )}
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 left-2 opacity-0 group-hover/card:opacity-100 transition-opacity z-10"
                onClick={() => handleRemoveItem(item.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
