
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { GameStatus } from '@/lib/types';
import { updateUserGameStatus } from '@/app/actions';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/card';

export function GameStatusUpdater({ gameId, gameName }: { gameId: number; gameName: string }) {
  const { user, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<GameStatus>('unplayed');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // We are dependent on auth state, so if that's loading, we are too.
    if (authLoading) {
      setLoading(true);
      return;
    }
    
    // If there is no user, there is no status to fetch.
    if (!user) {
      setLoading(false);
      return;
    };

    const fetchStatus = async () => {
      setLoading(true);
      try {
        const userGameRef = doc(db, 'users', user.uid, 'games', String(gameId));
        const docSnap = await getDoc(userGameRef);
        if (docSnap.exists()) {
          setStatus(docSnap.data().status as GameStatus);
        } else {
          setStatus('unplayed');
        }
      } catch (error) {
        console.error("Error fetching game status:", error);
        // Keep status as 'unplayed' on error
        setStatus('unplayed');
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [user, gameId, authLoading]);
  
  const handleStatusChange = async (newStatus: GameStatus) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Vous devez être connecté pour effectuer cette action.' });
      return;
    }
    
    setLoading(true);
    const oldStatus = status;
    setStatus(newStatus);

    try {
      await updateUserGameStatus(user.uid, gameId, newStatus, gameName);
      toast({ title: 'Statut mis à jour', description: `Le statut de "${gameName}" est maintenant "${translateStatus(newStatus)}".` });
    } catch (error) {
        toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de mettre à jour le statut du jeu.' });
        setStatus(oldStatus);
    } finally {
        setLoading(false);
    }
  };
  
  if (authLoading) {
    return (
        <Card>
            <CardHeader className="p-4">
                <h3 className="font-semibold text-lg">Mon expérience</h3>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                 <div className="flex items-center justify-center h-10">
                    <Loader2 className="h-6 w-6 animate-spin" />
                </div>
            </CardContent>
        </Card>
    );
  }

  // Don't render anything if the user is not logged in.
  if (!user) return null;

  const translateStatus = (status: GameStatus) => {
    switch (status) {
      case 'played': return 'Terminé';
      case 'playing': return 'Commencé';
      case 'unplayed': return 'Non joué';
      default: return 'Non joué';
    }
  };

  return (
    <Card>
      <CardHeader className="p-4">
        <h3 className="font-semibold text-lg">Mon expérience</h3>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {loading ? (
            <div className="flex items-center justify-center h-10">
                <Loader2 className="h-6 w-6 animate-spin" />
            </div>
        ) : (
            <Select onValueChange={(value: GameStatus) => handleStatusChange(value)} value={status}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Définir un statut" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="unplayed">{translateStatus('unplayed')}</SelectItem>
                    <SelectItem value="playing">{translateStatus('playing')}</SelectItem>
                    <SelectItem value="played">{translateStatus('played')}</SelectItem>
                </SelectContent>
            </Select>
        )}
      </CardContent>
    </Card>
  );
}
