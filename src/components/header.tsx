
'use client';

import Link from 'next/link';
import { Gamepad, Rss, Bot, Compass } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { Button } from './ui/button';
import { UserNav } from './user-nav';

export function Header() {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  const navItems = [
    { href: '/games', label: 'Parcourir' },
    { href: '/franchises', label: 'Franchises' },
    { href: '/studios', label: 'Studios' },
    { href: '/news', label: 'Actualités' },
    { href: '/game-ai', label: 'GameAI' },
  ];

  return (
    <header className="py-4 px-4 sm:px-6 md:px-8 border-b sticky top-0 bg-background/80 backdrop-blur-sm z-20">
      <div className="container mx-auto flex items-center justify-between gap-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <Gamepad className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground tracking-tight">GameNexus</h1>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-lg font-medium transition-colors hover:text-primary flex items-center gap-2',
                  pathname.startsWith(item.href) && item.href !== '/' ? 'text-primary' : 'text-muted-foreground',
                  pathname === '/' && item.href === '/' ? 'text-primary' : ''
                )}
              >
                 {item.href === '/games' && <Compass className="h-5 w-5" />}
                 {item.href === '/game-ai' && <Bot className="h-5 w-5" />}
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {loading ? (
            <div className="h-10 w-24 bg-muted rounded-md animate-pulse" />
          ) : user ? (
            <UserNav />
          ) : (
            <Button asChild>
              <Link href="/login">Connexion</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
