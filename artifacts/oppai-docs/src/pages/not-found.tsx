import React from 'react';
import { Link } from 'wouter';
import { Activity } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-8 border border-primary/20">
        <Activity className="w-8 h-8 text-primary" />
      </div>
      <h1 className="text-6xl font-display font-bold text-white mb-4">404</h1>
      <p className="text-xl text-muted-foreground mb-8 max-w-md">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link 
        href="/"
        className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
      >
        Return to Documentation
      </Link>
    </div>
  );
}
