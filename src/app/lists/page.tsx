
'use client';

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getUserLists, createList } from '@/app/actions';
import type { UserList } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ListCard, ListCardSkeleton } from '@/components/list-card';

export default function ListsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [lists, setLists] = useState<UserList[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const fetchLists = async () => {
    if (!user) return;
    setLoading(true);
    const userLists = await getUserLists(user.uid);
    setLists(userLists);
    setLoading(false);
  };
  
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchLists();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const handleCreateList = async () => {
    if (!user || !newListName.trim()) return;
    setIsCreating(true);
    try {
      await createList(user.uid, newListName);
      toast({ title: 'Liste créée', description: `La liste "${newListName}" a été créée avec succès.` });
      setNewListName('');
      setCreateDialogOpen(false);
      await fetchLists(); // Re-fetch to get the latest lists
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de créer la liste.' });
    } finally {
      setIsCreating(false);
    }
  };

  const renderSkeletons = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <ListCardSkeleton key={`skeleton-${i}`} />
      ))}
    </div>
  );
  
  if (authLoading || loading) {
    return (
       <main className="container mx-auto px-4 sm:px-6 md:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-extrabold tracking-tighter">Mes Listes</h1>
          </div>
          {renderSkeletons()}
       </main>
    )
  }

  if (!user) return null;

  return (
    <main className="container mx-auto px-4 sm:px-6 md:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold tracking-tighter">Mes Listes</h1>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Créer une liste
        </Button>
      </div>
      
      {lists.length === 0 ? (
        <div className="text-center py-20">
          <h2 className="text-2xl font-semibold mb-2">Aucune liste pour le moment</h2>
          <p className="text-muted-foreground">Créez votre première liste pour organiser vos jeux et franchises.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {lists.map(list => (
            <ListCard key={list.id} list={list} />
          ))}
        </div>
      )}

      <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer une nouvelle liste</DialogTitle>
            <DialogDescription>Donnez un nom à votre nouvelle liste pour commencer à y ajouter des éléments.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="list-name" className="text-right">Nom</Label>
              <Input
                id="list-name"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                className="col-span-3"
                placeholder="Ex: Pépites indépendantes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleCreateList} disabled={isCreating || !newListName.trim()}>
              {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
