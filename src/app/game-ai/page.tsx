
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { chatAction } from '@/app/actions';
import { Loader2, Wand2, Bot, Sparkles, ServerCrash, User } from 'lucide-react';
import type { ChatMessage } from '@/lib/chat-types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function GameAiPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to the bottom when a new message is added
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const assistantResponse = await chatAction(newMessages);
      setMessages([...newMessages, { role: 'model', content: assistantResponse }]);
    } catch (error: any) {
      const errorMessage = error.message || "Une erreur inattendue est survenue.";
      toast({ variant: 'destructive', title: 'Erreur IA', description: errorMessage });
      setMessages(newMessages); // remove user message if ai fails
    } finally {
      setLoading(false);
    }
  };

  const MessageBubble = ({ message }: { message: ChatMessage }) => {
    const isUser = message.role === 'user';
    return (
      <div className={cn("flex items-start gap-3", isUser ? "justify-end" : "justify-start")}>
        {!isUser && (
          <Avatar className="h-8 w-8">
             <AvatarFallback><Bot /></AvatarFallback>
          </Avatar>
        )}
        <div className={cn(
          "max-w-md rounded-lg p-3 text-sm",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        )}>
          <p>{message.content}</p>
        </div>
        {isUser && (
           <Avatar className="h-8 w-8">
             <AvatarFallback><User /></AvatarFallback>
          </Avatar>
        )}
      </div>
    );
  };

  return (
    <main className="container mx-auto px-4 sm:px-6 md:px-8 py-8 h-[calc(100vh-150px)] flex flex-col">
      <div className="text-center mb-4">
          <h1 className="text-3xl font-extrabold tracking-tighter">Votre Assistant de Jeu IA</h1>
          <p className="text-md text-muted-foreground mt-1">
            Discutez pour trouver votre prochain jeu coup de cœur !
          </p>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col border rounded-lg">
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
              <MessageBubble message={{role: 'model', content: "Bonjour ! Comment puis-je vous aider à trouver votre prochain jeu favori aujourd'hui ?"}}/>
              {messages.map((msg, index) => (
                <MessageBubble key={index} message={msg} />
              ))}
              {loading && <MessageBubble message={{role: 'model', content: "..."}}/>}
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t bg-background">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ex: Je cherche un RPG en monde ouvert avec une bonne histoire..."
              className="flex-1 h-12 text-md"
              disabled={loading}
              autoComplete="off"
            />
            <Button type="submit" disabled={loading || !input.trim()} size="lg" className="h-12">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Envoyer'}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
