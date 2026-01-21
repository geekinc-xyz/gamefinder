
'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { ListPlus, Check, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { addItemToLists, createList, getItemListStatuses } from '@/app/actions';
import type { FavoriteItemType } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Input } from './ui/input';

type Item = {
  id: number;
  type: FavoriteItemType;
  name: string;
  coverUrl: string;
};

interface AddToListButtonProps {
  item: Item;
}

export function AddToListButton({ item }: AddToListButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [lists, setLists] = useState<{ id: string; name: string; inList: boolean }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newListName, setNewListName] = useState('');

  useEffect(() => {
    if (isOpen && user) {
      const fetchLists = async () => {
        setLoading(true);
        const userLists = await getItemListStatuses(user.uid, item.id, item.type);
        setLists(userLists);
        setLoading(false);
      };
      fetchLists();
    }
  }, [isOpen, user, item]);

  const handleListToggle = (listId: string) => {
    setLists(lists.map(list => (list.id === listId ? { ...list, inList: !list.inList } : list)));
  };

  const handleCreateAndAdd = async () => {
    if (!user || !newListName.trim()) return;
    setIsSubmitting(true);
    try {
      const newListId = await createList(user.uid, newListName);
      await addItemToLists(user.uid, [newListId], item);
      toast({ title: 'Succès', description: `"${item.name}" ajouté à votre nouvelle liste "${newListName}".` });
      setIsOpen(false);
      setShowCreate(false);
      setNewListName('');
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de créer ou d\'ajouter à la liste.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const selectedListIds = lists.filter(l => l.inList).map(l => l.id);
      await addItemToLists(user.uid, selectedListIds, item);
      toast({ title: 'Listes mises à jour', description: `"${item.name}" a été ajouté aux listes sélectionnées.` });
      setIsOpen(false);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de mettre à jour les listes.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <Button variant="outline" size="icon" onClick={() => setIsOpen(true)} className="bg-background/80 hover:bg-background">
        <ListPlus className="h-4 w-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter "{item.name}" à une liste</DialogTitle>
            <DialogDescription>
              Sélectionnez les listes auxquelles vous souhaitez ajouter cet élément.
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex justify-center items-center h-24">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : showCreate ? (
             <div className="space-y-4 py-4">
                <Label htmlFor="new-list-name">Nom de la nouvelle liste</Label>
                <Input
                    id="new-list-name"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    placeholder="Ex: Mes jeux préférés"
                />
             </div>
          ) : (
            <div className="space-y-2 py-4 max-h-60 overflow-y-auto">
              {lists.length > 0 ? (
                lists.map(list => (
                  <div key={list.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`list-${list.id}`}
                      checked={list.inList}
                      onCheckedChange={() => handleListToggle(list.id)}
                    />
                    <Label htmlFor={`list-${list.id}`}>{list.name}</Label>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center">Vous n'avez pas encore de listes.</p>
              )}
            </div>
          )}
          
          <DialogFooter className="sm:justify-between">
             {showCreate ? (
                 <>
                    <Button variant="ghost" onClick={() => setShowCreate(false)}>Retour</Button>
                    <Button onClick={handleCreateAndAdd} disabled={isSubmitting || !newListName.trim()}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Créer et Ajouter
                    </Button>
                 </>
             ) : (
                <>
                    <Button variant="secondary" onClick={() => setShowCreate(true)}>
                        Créer une nouvelle liste
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Enregistrer
                    </Button>
                </>
             )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
