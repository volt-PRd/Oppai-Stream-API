import React from 'react';
import { Link, useRoute } from 'wouter';
import { Terminal, BookOpen, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navbar() {
  const [isDocs] = useRoute('/');
  const [isTester] = useRoute('/tester');

  return (
    <nav className="fixed top-0 w-full z-50 glass-panel border-b-0 rounded-none bg-background/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-white">
              OppAI <span className="text-primary">Stream</span>
            </span>
          </div>
          
          <div className="flex space-x-1">
            <Link 
              href="/" 
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2",
                isDocs 
                  ? "bg-secondary text-primary shadow-sm" 
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}
            >
              <BookOpen className="w-4 h-4" />
              Documentation
            </Link>
            <Link 
              href="/tester" 
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2",
                isTester 
                  ? "bg-secondary text-primary shadow-sm" 
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}
            >
              <Terminal className="w-4 h-4" />
              API Tester
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
