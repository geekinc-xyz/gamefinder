
'use client';

import { useState, useEffect, useTransition } from 'react';
import { Button } from './ui/button';
import { Heart, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { getFavoriteStatus, toggleFavorite } from '@/app/actions';
import type { FavoriteItemType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type Item = {
  id: number;
  type: FavoriteItemType;
  name: string;
  coverUrl: string;
};

interface FavoriteButtonProps {
  item: Item;
}

export function FavoriteButton({ item }: FavoriteButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(true);
      getFavoriteStatus(user.uid, item.id, item.type)
        .then(setIsFavorite)
        .finally(() => setLoading(false));
    } else {
        setLoading(false);
    }
  }, [user, item.id, item.type]);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ variant: 'destructive', title: 'Connectez-vous', description: 'Vous devez être connecté pour ajouter des favoris.' });
      return;
    }
    
    startTransition(async () => {
      try {
        const newStatus = await toggleFavorite(user.uid, item);
        setIsFavorite(newStatus);
        toast({
          title: newStatus ? 'Ajouté aux favoris' : 'Retiré des favoris',
          description: `"${item.name}" a été ${newStatus ? 'ajouté à' : 'retiré de'} vos favoris.`,
        });
      } catch (error) {
          toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de modifier les favoris.' });
      }
    });
  };

  if (!user) return null;
  const isLoading = isPending || loading;


  if (isLoading) {
    return (
      <Button variant="outline" size="icon" disabled className="bg-background/80 hover:bg-background">
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  return (
    <Button variant="outline" size="icon" onClick={handleToggleFavorite} className="bg-background/80 hover:bg-background">
      <Heart className={cn("h-4 w-4", isFavorite && 'fill-red-500 text-red-500')} />
    </Button>
  );
}

    