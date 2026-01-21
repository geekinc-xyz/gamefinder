
'use server';

import { aggregatePrices } from '@/ai/flows/aggregate-game-prices';
import type { AggregateGamePricesInput, AggregateGamePricesOutput } from '@/lib/price-aggregator-types';
import { findGamesFlow } from '@/ai/flows/find-games';
import type { FindGamesInput, FindGamesOutput } from '@/lib/game-discovery-types';
import { chatFlow } from '@/ai/flows/chat';
import type { ChatInput, ChatMessage } from '@/lib/chat-types';
import { doc, setDoc, collection, getDocs, orderBy, query, deleteDoc, getDoc, writeBatch, serverTimestamp, collectionGroup } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Game, GameStatus, UserGame, FavoriteItem, FavoriteItemType, UserList, ListItem } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { getGameDetails, getFranchiseDetails, getGames } from '@/lib/igdb-api';

export async function findPricesAction(gameName: string): Promise<AggregateGamePricesOutput> {
  try {
    const result = await aggregatePrices({ gameName });
    return result;

  } catch (error) {
    console.error('Error in findPricesAction:', error);
    throw new Error('Failed to fetch game prices.');
  }
}

export async function findGamesAction(query: string): Promise<{ intro: string; games: Game[] }> {
    try {
        const aiResult = await findGamesFlow({ query });

        if (!aiResult || !aiResult.games) {
            return {
                intro: aiResult?.recommendationText || "Désolé, je n'ai rien trouvé. Essayez une autre recherche !",
                games: []
            };
        }
        
        if (aiResult.games.length === 0) {
            return { 
                intro: aiResult.recommendationText || "Je n'ai pas trouvé de jeux correspondant à votre recherche. Essayez d'être plus précis !", 
                games: [] 
            };
        }

        const gamePromises = aiResult.games.map(async (recommendedGame) => {
            try {
                const searchResult = await getGames({ search: recommendedGame.name, limit: 1 });
                if (searchResult.games.length > 0) {
                    return { ...searchResult.games[0], reason: recommendedGame.reason };
                }
                console.warn(`No game found in DB for AI recommendation: "${recommendedGame.name}"`);
                return null;
            } catch (searchError) {
                console.error(`Error fetching details for game "${recommendedGame.name}":`, searchError);
                return null;
            }
        });

        const gamesWithDetails = (await Promise.all(gamePromises)).filter((g): g is Game & { reason: string } => g !== null);
        
        const introText = aiResult.recommendationText || "Voici quelques recommandations basées sur votre recherche :";
        
        if (gamesWithDetails.length === 0) {
             return { 
                intro: aiResult.recommendationText || "Je n'ai pas trouvé de jeux correspondants dans notre base de données pour les suggestions de l'IA. Essayez une autre recherche !", 
                games: [] 
            };
        }

        return { intro: introText, games: gamesWithDetails };

    } catch (error) {
        console.error('Error in findGamesAction (AI communication or processing):', error);
        throw new Error("Une erreur de communication est survenue avec l'assistant IA. Veuillez réessayer.");
    }
}

export async function updateUserGameStatus(userId: string, gameId: number, status: GameStatus, gameName: string) {
  try {
    const userGameRef = doc(db, 'users', userId, 'games', String(gameId));
    await setDoc(userGameRef, {
      gameId,
      status,
      gameName,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    revalidatePath('/my-experiences');
  } catch (error) {
    console.error('Error updating game status:', error);
    throw new Error('Failed to update game status.');
  }
}

export async function getUserGames(userId: string): Promise<(Game & { status: GameStatus })[]> {
    try {
        const userGamesRef = collection(db, 'users', userId, 'games');
        const q = query(userGamesRef, orderBy('updatedAt', 'desc'));
        const querySnapshot = await getDocs(q);

        const userGames: UserGame[] = [];
        querySnapshot.forEach((doc) => {
            userGames.push(doc.data() as UserGame);
        });

        const gamesWithDetails = await Promise.all(
            userGames
                .filter(ug => ug.status === 'playing' || ug.status === 'played')
                .map(async (userGame) => {
                    const gameDetails = await getGameDetails(userGame.gameId);
                    if (gameDetails) {
                        return {
                            ...gameDetails,
                            status: userGame.status,
                        };
                    }
                    return null;
                })
        );

        return gamesWithDetails.filter((g): g is Game & { status: GameStatus } => g !== null);
    } catch (error) {
        console.error('Error fetching user games:', error);
        throw new Error('Failed to fetch user games.');
    }
}

export async function chatAction(history: ChatMessage[]): Promise<string> {
    try {
        const result = await chatFlow({ history });
        return result.text;
    } catch (error) {
        console.error("Error in chatAction:", error);
        throw new Error("Une erreur de communication est survenue avec l'assistant IA. Veuillez réessayer.");
    }
}

// Favorites Actions

export async function getFavoriteStatus(userId: string, itemId: number, itemType: FavoriteItemType) {
  const favoriteId = `${itemType}-${itemId}`;
  const docRef = doc(db, 'users', userId, 'favorites', favoriteId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists();
}

export async function getMultipleFavoriteStatuses(userId: string, items: { id: number; type: FavoriteItemType }[]) {
  const statuses: { [key: string]: boolean } = {};
  const promises = items.map(async ({ id, type }) => {
    const status = await getFavoriteStatus(userId, id, type);
    statuses[`${type}-${id}`] = status;
  });
  await Promise.all(promises);
  return statuses;
}

export async function toggleFavorite(userId: string, item: { id: number; type: FavoriteItemType; name: string; coverUrl: string }) {
  const favoriteId = `${item.type}-${item.id}`;
  const docRef = doc(db, 'users', userId, 'favorites', favoriteId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    await deleteDoc(docRef);
    revalidatePath('/favorites');
    revalidatePath(`/games/${item.id}`);
    revalidatePath(`/franchises/${item.id}`);
    return false;
  } else {
    await setDoc(docRef, {
      itemId: item.id,
      itemType: item.type,
      name: item.name,
      coverUrl: item.coverUrl,
      createdAt: serverTimestamp(),
    });
    revalidatePath('/favorites');
    revalidatePath(`/games/${item.id}`);
    revalidatePath(`/franchises/${item.id}`);
    return true;
  }
}


export async function getFavorites(userId: string): Promise<FavoriteItem[]> {
    const favoritesRef = collection(db, 'users', userId, 'favorites');
    const q = query(favoritesRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FavoriteItem));
}

// List Actions

export async function createList(userId: string, listName: string): Promise<string> {
  const listRef = doc(collection(db, 'users', userId, 'lists'));
  await setDoc(listRef, {
    name: listName,
    createdAt: serverTimestamp(),
    itemCount: 0,
  });
  revalidatePath('/lists');
  return listRef.id;
}

export async function getUserLists(userId: string): Promise<UserList[]> {
    const listsRef = collection(db, 'users', userId, 'lists');
    const q = query(listsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const lists: UserList[] = [];
    for (const doc of querySnapshot.docs) {
        const listData = doc.data();
        const itemsRef = collection(db, 'users', userId, 'lists', doc.id, 'items');
        const itemsQuery = query(itemsRef, orderBy('addedAt', 'desc'), orderBy('name', 'asc'));
        const itemsSnapshot = await getDocs(itemsQuery);
        
        let coverUrl = listData.coverUrl;
        if (!coverUrl && !itemsSnapshot.empty) {
          coverUrl = itemsSnapshot.docs[0].data().coverUrl;
        }

        lists.push({
            id: doc.id,
            name: listData.name,
            createdAt: listData.createdAt,
            itemCount: itemsSnapshot.size,
            coverUrl: coverUrl || '/placeholder.jpg'
        });
    }
    return lists;
}


export async function getListDetails(userId: string, listId: string): Promise<{ list: UserList | null; items: ListItem[] }> {
    const listRef = doc(db, 'users', userId, 'lists', listId);
    const listSnap = await getDoc(listRef);

    if (!listSnap.exists()) {
        return { list: null, items: [] };
    }

    const itemsRef = collection(db, 'users', userId, 'lists', listId, 'items');
    const q = query(itemsRef, orderBy('addedAt', 'desc'));
    const itemsSnapshot = await getDocs(itemsSnapshot);

    const items = itemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ListItem));
    const listData = listSnap.data();

    let coverUrl = listData.coverUrl;
    if (!coverUrl && items.length > 0) {
        coverUrl = items[0].coverUrl;
    }
    
    const list: UserList = {
        id: listSnap.id,
        name: listData.name,
        createdAt: listData.createdAt,
        itemCount: items.length,
        coverUrl: coverUrl || '/placeholder.jpg'
    };

    return { list, items };
}


export async function addItemToLists(
  userId: string,
  listIds: string[],
  item: { id: number; type: FavoriteItemType; name: string; coverUrl: string }
) {
  const batch = writeBatch(db);
  const itemId = `${item.type}-${item.id}`;

  listIds.forEach(listId => {
    const itemRef = doc(db, 'users', userId, 'lists', listId, 'items', itemId);
    batch.set(itemRef, {
      itemId: item.id,
      itemType: item.type,
      name: item.name,
      coverUrl: item.coverUrl,
      addedAt: serverTimestamp(),
    });
  });

  await batch.commit();
  revalidatePath('/lists');
}


export async function getItemListStatuses(userId: string, itemId: number, itemType: FavoriteItemType) {
    const itemDocId = `${itemType}-${itemId}`;
    const lists: { id: string; name: string; inList: boolean }[] = [];
    const userLists = await getUserLists(userId);

    for (const list of userLists) {
        const itemRef = doc(db, `users/${userId}/lists/${list.id}/items/${itemDocId}`);
        const itemSnap = await getDoc(itemRef);
        lists.push({ id: list.id, name: list.name, inList: itemSnap.exists() });
    }
    return lists;
}


export async function removeItemFromList(userId: string, listId: string, itemId: string) {
    const itemRef = doc(db, 'users', userId, 'lists', listId, 'items', itemId);
    await deleteDoc(itemRef);
    revalidatePath(`/lists/${listId}`);
    revalidatePath('/lists');
}

    