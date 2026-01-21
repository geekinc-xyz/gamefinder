
import { getNewsFromRss } from '@/lib/rss';
import { NewsCard, NewsCardSkeleton } from '@/components/news-card';
import { Suspense } from 'react';

async function NewsList() {
  const articles = await getNewsFromRss();
  
  if (articles.length === 0) {
    return (
      <div className="text-center py-20">
          <h2 className="text-2xl font-semibold mb-2">Aucune actualité trouvée</h2>
          <p className="text-muted-foreground">Impossible de charger les actualités pour le moment. Réessayez plus tard.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {articles.map(article => (
        <NewsCard key={article.guid} article={article} />
      ))}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: 9 }).map((_, i) => (
        <NewsCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default function NewsPage() {
  return (
    <main className="container mx-auto px-4 sm:px-6 md:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tighter">Actualités du Jeu Vidéo</h1>
        <p className="text-lg text-muted-foreground mt-2">Les dernières nouvelles, gracieuseté d'IGN.</p>
      </div>
      <Suspense fallback={<LoadingSkeleton />}>
        <NewsList />
      </Suspense>
    </main>
  );
}
