import React from 'react';
import { cn } from '@/lib/utils';
import TetrisBlock from '@/components/tetris/TetrisBlock';

/**
 * MockupCard - A simplified, blurred card to simulate upcoming content
 */
const MockupCard = ({ className }) => {
  return (
    <div
      className={cn(
        'relative overflow-hidden',
        'bg-off-white',
        'border-3 border-off-black',
        'shadow-brutalist',
        'aspect-[3/4] md:aspect-[4/5]',
        'filter blur-[6px] opacity-70',
        'pointer-events-none select-none',
        className
      )}
    >
      {/* Fake Image Area */}
      <div className="h-[45%] bg-light-gray border-b-3 border-off-black relative">
        <div className="absolute inset-0 bg-gradient-to-br from-tetris-pink/20 to-tetris-purple/20" />
      </div>

      {/* Fake Content Area */}
      <div className="p-4 space-y-3">
        {/* Fake Title */}
        <div className="h-6 w-3/4 bg-dark-gray/20 rounded-sm" />
        
        {/* Fake Description lines */}
        <div className="space-y-2">
          <div className="h-3 w-full bg-mid-gray/20 rounded-sm" />
          <div className="h-3 w-5/6 bg-mid-gray/20 rounded-sm" />
          <div className="h-3 w-4/5 bg-mid-gray/20 rounded-sm" />
        </div>

        {/* Fake Tags */}
        <div className="flex gap-2 pt-2">
          <div className="h-5 w-12 bg-tetris-yellow/30 border border-off-black/20 rounded-sm" />
          <div className="h-5 w-16 bg-tetris-green/30 border border-off-black/20 rounded-sm" />
        </div>
      </div>
    </div>
  );
};

/**
 * TipsSection - "Coming Soon" placeholder for the Tips section
 */
const TipsSection = () => {
  return (
    <section 
      id="section-tips" 
      className="min-h-[60vh] flex flex-col items-center justify-center py-16 relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="absolute top-10 left-10 transform -rotate-12">
          <TetrisBlock type="T" color="purple" size={120} />
        </div>
        <div className="absolute bottom-10 right-10 transform rotate-12">
          <TetrisBlock type="S" color="pink" size={120} />
        </div>
      </div>

      <div className="relative z-10 text-center mb-12">
        <h2 className="text-6xl md:text-8xl font-bold font-shimshon text-off-black mb-4 drop-shadow-brutalist-sm">
          בקרוב
        </h2>
        <p className="text-xl md:text-2xl text-dark-gray font-shimshon max-w-md mx-auto">
          אנחנו עובדים על מאגר טיפים מטורף שיעזור לכם לשרוד את התואר
        </p>
      </div>

      {/* Mockup Cards Container */}
      <div className="relative w-full max-w-4xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 opacity-80">
          {/* Card 1 - Rotated slightly left */}
          <div className="transform -rotate-3 md:-rotate-6 transition-transform hover:rotate-0 duration-500">
            <MockupCard />
          </div>

          {/* Card 2 - Rotated slightly right */}
          <div className="transform rotate-3 md:rotate-6 transition-transform hover:rotate-0 duration-500 md:mt-12">
            <MockupCard />
          </div>
        </div>
        
        {/* Overlay to prevent interaction and add depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-off-white/50 to-transparent pointer-events-none" />
      </div>
    </section>
  );
};

export default TipsSection;
