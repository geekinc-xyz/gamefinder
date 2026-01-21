
'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import { StudioCard, StudioCardSkeleton } from '@/components/studio-card';
import { getStudios } from '@/lib/igdb-api';
import type { Studio } from '@/lib/types';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';
import { Search } from 'lucide-react';

export default function StudiosPage() {
  const [studios, setStudios] = useState<Studio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name asc');
  const [isPending, startTransition] = useTransition();
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const loadStudios = useCallback(() => {
    setIsLoading(true);
    startTransition(async () => {
      const { studios: newStudios, totalCount } = await getStudios({
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearchQuery,
        sortBy: sortBy,
      });
      setStudios(newStudios);
      setTotalItems(totalCount);
      setIsLoading(false);
    });
  }, [currentPage, itemsPerPage, debouncedSearchQuery, sortBy]);

  useEffect(() => {
    loadStudios();
  }, [loadStudios]);

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage, debouncedSearchQuery, sortBy]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  
  const renderPagination = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    const halfMaxPages = Math.floor(maxPagesToShow / 2);

    let startPage = Math.max(1, currentPage - halfMaxPages);
    let endPage = Math.min(totalPages, currentPage + halfMaxPages);

    if (currentPage - halfMaxPages < 1) {
        endPage = Math.min(totalPages, endPage + (halfMaxPages - (currentPage - 1)));
    }
    if (currentPage + halfMaxPages > totalPages) {
        startPage = Math.max(1, startPage - (currentPage + halfMaxPages - totalPages));
    }

    if (startPage > 1) {
        pageNumbers.push(
            <PaginationItem key="1">
                <PaginationLink href="#" onClick={(e) => { e.preventDefault(); handlePageChange(1); }}>1</PaginationLink>
            </PaginationItem>
        );
        if (startPage > 2) {
            pageNumbers.push(<PaginationItem key="start-ellipsis"><PaginationEllipsis /></PaginationItem>);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(
            <PaginationItem key={i}>
                <PaginationLink href="#" onClick={(e) => { e.preventDefault(); handlePageChange(i); }} isActive={i === currentPage}>
                    {i}
                </PaginationLink>
            </PaginationItem>
        );
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            pageNumbers.push(<PaginationItem key="end-ellipsis"><PaginationEllipsis /></PaginationItem>);
        }
        pageNumbers.push(
            <PaginationItem key={totalPages}>
                <PaginationLink href="#" onClick={(e) => { e.preventDefault(); handlePageChange(totalPages); }}>{totalPages}</PaginationLink>
            </PaginationItem>
        );
    }

    return pageNumbers;
  };


  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 container mx-auto px-4 sm:px-6 md:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold tracking-tighter">Studios de développement</h1>
          <p className="text-lg text-muted-foreground mt-2">Explorez les créateurs derrière vos jeux préférés.</p>
        </div>
        
        <div className="mb-8 flex flex-col sm:flex-row gap-4 items-end">
            <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    id="search-studio"
                    type="search"
                    placeholder="Rechercher un studio..."
                    className="pl-10 h-12 text-lg"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <div className="w-full sm:w-[240px]">
                <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger id="sort-by-select" className="w-full h-12 text-lg">
                    <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="name asc">Nom (A-Z)</SelectItem>
                    <SelectItem value="name desc">Nom (Z-A)</SelectItem>
                </SelectContent>
                </Select>
            </div>
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.from({ length: itemsPerPage }).map((_, i) => (
              <StudioCardSkeleton key={i} />
            ))}
          </div>
        )}

        {!isLoading && studios.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {studios.map(studio => (
              <StudioCard key={studio.id} studio={studio} />
            ))}
          </div>
        )}

        {!isLoading && studios.length === 0 && (
            <div className="text-center py-20">
                <h2 className="text-2xl font-semibold mb-2">Aucun studio trouvé</h2>
                <p className="text-muted-foreground">Nous n'avons pas pu charger les studios. Réessayez plus tard.</p>
            </div>
        )}
      </main>

      {!isLoading && totalPages > 1 && (
        <div className="py-6 px-4 sm:px-6 md:px-8 border-t">
          <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Studios par page:</span>
              <Select value={String(itemsPerPage)} onValueChange={(value) => setItemsPerPage(Number(value))}>
                <SelectTrigger className="w-[80px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }} />
                </PaginationItem>
                {renderPagination()}
                <PaginationItem>
                  <PaginationNext href="#" onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
            <div className="text-sm text-muted-foreground">
              Page {currentPage} sur {totalPages} ({totalItems} studios)
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
