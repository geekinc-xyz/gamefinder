import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getGameDetails } from '@/lib/igdb-api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlatformIcon } from '@/components/icons';
import { ArrowLeft, Star, CalendarDays, Tag, Users, Puzzle, Code, Building, Palette, Film } from 'lucide-react';
import { PriceFinder } from '@/components/price-finder';
import { GameStatusUpdater } from '@/components/game-status-updater';

type GameDetailPageProps = {
  params: { id: string };
};

const DetailItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | React.ReactNode }) => (
  <div>
    <h3 className="flex items-center text-md font-semibold text-muted-foreground mb-1">
      <Icon className="mr-2 h-4 w-4" />
      {label}
    </h3>
    <div className="text-lg">{value || 'N/A'}</div>
  </div>
);

export default async function GameDetailPage({ params }: GameDetailPageProps) {
  const gameId = parseInt(params.id, 10);
  const game = await getGameDetails(gameId);

  if (!game) {
    notFound();
  }

  const releaseDate = game.releaseDate 
    ? new Date(game.releaseDate * 1000).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'N/A';
  
  const renderList = (items: { name: string }[]) =>
    items && items.length > 0
      ? items.map(item => <Badge key={item.name} variant="secondary" className="mr-1 mb-1">{item.name}</Badge>)
      : 'N/A';

  const firstTrailer = game.videos && game.videos.length > 0 ? game.videos[0] : null;

  return (
    <div className="animate-in fade-in-50 duration-500">
      <div className="relative h-[40vh] md:h-[50vh] w-full">
        {game.screenshots && game.screenshots.length > 0 ? (
          <Image
            src={game.screenshots[0].url}
            alt={`Capture d'écran de ${game.name}`}
            fill
            className="object-cover"
            priority
            data-ai-hint="gameplay screenshot"
          />
        ) : (
          <div className="bg-muted w-full h-full" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="absolute top-4 left-4">
          <Button asChild variant="secondary" size="sm">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux jeux
            </Link>
          </Button>
        </div>
      </div>

      <main className="container mx-auto px-4 sm:px-6 md:px-8 pb-16 -mt-32 md:-mt-48 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          <aside className="md:col-span-1 lg:col-span-1">
            <div className="aspect-[3/4] relative rounded-lg overflow-hidden shadow-2xl shadow-primary/20">
              <Image
                src={game.coverUrl}
                alt={game.name}
                fill
                className="object-cover"
                data-ai-hint="game cover"
              />
            </div>
            <div className="mt-6 space-y-4">
              <GameStatusUpdater gameId={game.id} gameName={game.name} />
              <DetailItem icon={CalendarDays} label="Date de sortie" value={releaseDate} />
              <DetailItem icon={Code} label="Développeurs" value={renderList(game.developers)} />
              <DetailItem icon={Building} label="Éditeurs" value={renderList(game.publishers)} />
            </div>
          </aside>

          <div className="md:col-span-2 lg:col-span-3">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-2">{game.name}</h1>
            
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <span className="font-bold text-lg">{game.rating ? game.rating.toFixed(0) : 'N/A'}</span>
                <span className="text-muted-foreground text-sm">/ 100 (Metascore)</span>
              </div>
              <div className="flex items-center gap-x-3">
                {game.platforms.map(platform => (
                  <div key={platform.id} className="flex items-center gap-2 text-muted-foreground" title={platform.name}>
                    <PlatformIcon platform={platform.name as any} className="h-5 w-5" />
                  </div>
                ))}
              </div>
            </div>

            <p className="text-lg text-muted-foreground mb-8 max-w-3xl">
              {game.description || "Aucune description disponible."}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <DetailItem icon={Tag} label="Genres" value={renderList(game.genres)} />
              <DetailItem icon={Users} label="Franchise" value={renderList(game.franchises)} />
              <DetailItem icon={Puzzle} label="Modes de jeu" value={renderList(game.gameModes)} />
              <DetailItem icon={Palette} label="Thèmes" value={renderList(game.themes)} />
            </div>

            {firstTrailer && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center"><Film className="mr-2 h-6 w-6" /> Bande-annonce</h2>
                <div className="aspect-video relative rounded-lg overflow-hidden border">
                  <iframe
                    src={`https://www.youtube.com/embed/${firstTrailer.video_id}`}
                    title={`Bande-annonce de ${game.name}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
                </div>
              </div>
            )}

            <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Captures d'écran</h2>
                {game.screenshots && game.screenshots.length > 0 ? (
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                      {game.screenshots.map((ss) => (
                          <div key={ss.id} className="aspect-video relative rounded-md overflow-hidden">
                              <Image src={ss.url} alt={`Capture d'écran`} fill className="object-cover"/>
                          </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Aucune capture d'écran disponible.</p>
                )}
            </div>

            <PriceFinder gameName={game.name} />
          </div>
        </div>
      </main>
    </div>
  );
}
