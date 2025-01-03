'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Check, Moon, Monitor, Sun, Tags, 
  Scroll, Eye, Leaf, Waves,
  Sparkles, Flame, Star, Menu,
  Info, Share2, 
  Twitter, Linkedin, Facebook, MessageCircle,
  Github, X, Search,
  TreePalm,
  Flower2
} from 'lucide-react';
import { LogoIcon } from '@/components/logo-icon';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';
import { WhatsAppIcon } from '@/components/icons/whatsapp-icon';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const AppSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const isTopicsPage = pathname === '/topics';
  const isAboutPage = pathname === '/about';
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the welcome card before
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      setShowWelcome(true);
    }
  }, []);

  const dismissWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem('hasSeenWelcome', 'true');
  };

  const shareUrl = 'https://epigram.news';
  const shareText = 'Check out Epigram - AI-powered news that matters, delivered your way.';

  const shareLinks = [
    {
      name: 'X (Twitter)',
      icon: <Twitter className="w-5 h-5" />,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      color: 'hover:bg-[#1DA1F2]/10 group-hover:text-[#1DA1F2]'
    },
    {
      name: 'LinkedIn',
      icon: <Linkedin className="w-5 h-5" />,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      color: 'hover:bg-[#0A66C2]/10 group-hover:text-[#0A66C2]'
    },
    {
      name: 'Facebook',
      icon: <Facebook className="w-5 h-5" />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      color: 'hover:bg-[#1877F2]/10 group-hover:text-[#1877F2]'
    },
    {
      name: 'WhatsApp',
      icon: <WhatsAppIcon className="w-5 h-5" />,
      url: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
      color: 'hover:bg-[#25D366]/10 group-hover:text-[#25D366]'
    },
    {
      name: 'Messages',
      icon: <MessageCircle className="w-5 h-5" />,
      url: `sms:&body=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
      color: 'hover:bg-blue-500/10 group-hover:text-blue-500'
    }
  ];

  return (
    <>
      {showWelcome && isHomePage && (
        <>
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-10"
            onClick={dismissWelcome}
            aria-hidden="true"
          />
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-20 w-full max-w-[400px] px-4">
            <div className="animate-in fade-in duration-300 slide-in-from-bottom">
              <Card className="relative p-4 shadow-lg">
                <button
                  onClick={dismissWelcome}
                  className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Dismiss welcome message"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <LogoIcon className="w-5 h-5" />
                    <h3 className="font-semibold">Welcome to Epigram!</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your open-source, AI-powered news companion that redefines how you consume news. Get bite-sized summaries from trusted sources worldwide, personalized to your interests. Stay informed without the overwhelm.
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <button
                      onClick={dismissWelcome}
                      className="flex-1 py-1 px-3 bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity"
                    >
                      Get Started
                    </button>
                    <Link href="/about">
                      <button
                        onClick={dismissWelcome}
                        className="flex-1 py-1 px-3 bg-secondary text-secondary-foreground rounded-full hover:opacity-90 transition-opacity whitespace-nowrap"
                      >
                        About Epigram
                      </button>
                    </Link>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </>
      )}

      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-10 pb-[env(safe-area-inset-bottom)]">
        <nav
          className="bg-white dark:bg-card backdrop-blur-md rounded-full shadow-lg border border-gray-200/50 dark:border-gray-800"
          role="navigation"
          aria-label="Main navigation"
        >
          <div className="flex items-center h-11 px-2 gap-2">
            <a 
              href="/" 
              className={cn(
                "p-1.5 rounded-full transition-colors flex items-center gap-2",
                isHomePage && "bg-primary text-primary-foreground",
                !isHomePage && "hover:bg-gray-100 dark:hover:bg-muted"
              )}
              aria-label="Go to Epigram"
              aria-current={isHomePage ? "page" : undefined}
            >
              <LogoIcon className="w-5 h-5" />
              <span className="font-medium text-sm">Epigram</span>
            </a>

            <Link href="/topics">
              <button 
                className={cn(
                  "p-1.5 rounded-full transition-colors flex items-center gap-2",
                  isTopicsPage 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-gray-100 dark:hover:bg-muted"
                )}
                aria-label="Go to topics page"
                aria-current={isTopicsPage ? "page" : undefined}
              >
                <Tags className="w-5 h-5" />
                <span className="font-medium text-sm">Topics</span>
              </button>
            </Link>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button 
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-muted rounded-full transition-colors"
                        aria-label="Change theme"
                      >
                        <Sun className="w-5 h-5 dark:hidden" />
                        <Moon className="w-5 h-5 hidden dark:block" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56" role="menu" aria-label="Theme options">
                      <DropdownMenuItem
                        className={cn(
                          "h-9 focus:bg-accent cursor-pointer",
                          theme === "light" && "bg-accent"
                        )}
                        onClick={() => setTheme("light")}
                        role="menuitemradio"
                        aria-checked={theme === "light"}
                      >
                        <Sun className="mr-2 h-4 w-4" aria-hidden="true" />
                        <span className="flex-1">Light</span>
                        {theme === "light" && <Check className="h-4 w-4" aria-hidden="true" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className={cn(
                          "h-9 focus:bg-accent cursor-pointer",
                          theme === "dark" && "bg-accent"
                        )}
                        onClick={() => setTheme("dark")}
                        role="menuitemradio"
                        aria-checked={theme === "dark"}
                      >
                        <Moon className="mr-2 h-4 w-4" aria-hidden="true" />
                        <span className="flex-1">Dark</span>
                        {theme === "dark" && <Check className="h-4 w-4" aria-hidden="true" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className={cn(
                          "h-9 focus:bg-accent cursor-pointer",
                          theme === "system" && "bg-accent"
                        )}
                        onClick={() => setTheme("system")}
                        role="menuitemradio"
                        aria-checked={theme === "system"}
                      >
                        <Monitor className="mr-2 h-4 w-4" aria-hidden="true" />
                        <span className="flex-1">System</span>
                        {theme === "system" && <Check className="h-4 w-4" aria-hidden="true" />}
                      </DropdownMenuItem>
                      <div className="h-px bg-border my-1" />
                      <DropdownMenuItem
                        className={cn(
                          "h-9 focus:bg-accent cursor-pointer",
                          theme === "sepia" && "bg-accent"
                        )}
                        onClick={() => setTheme("sepia")}
                        role="menuitemradio"
                        aria-checked={theme === "sepia"}
                      >
                        <Scroll className="mr-2 h-4 w-4" aria-hidden="true" />
                        <span className="flex-1">Sepia</span>
                        <div className="w-4 h-4 rounded-sm mr-2 bg-[#F4ECD8]" />
                        {theme === "sepia" && <Check className="h-4 w-4" aria-hidden="true" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className={cn(
                          "h-9 focus:bg-accent cursor-pointer",
                          theme === "high-contrast" && "bg-accent"
                        )}
                        onClick={() => setTheme("high-contrast")}
                        role="menuitemradio"
                        aria-checked={theme === "high-contrast"}
                      >
                        <Eye className="mr-2 h-4 w-4" aria-hidden="true" />
                        <span className="flex-1">High Contrast</span>
                        <div className="w-4 h-4 rounded-sm mr-2 bg-[#000000]" />
                        {theme === "high-contrast" && <Check className="h-4 w-4" aria-hidden="true" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className={cn(
                          "h-9 focus:bg-accent cursor-pointer",
                          theme === "forest" && "bg-accent"
                        )}
                        onClick={() => setTheme("forest")}
                        role="menuitemradio"
                        aria-checked={theme === "forest"}
                      >
                        <Leaf className="mr-2 h-4 w-4" aria-hidden="true" />
                        <span className="flex-1">Forest</span>
                        <div className="w-4 h-4 rounded-sm mr-2 bg-[#2D4F1E]" />
                        {theme === "forest" && <Check className="h-4 w-4" aria-hidden="true" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className={cn(
                          "h-9 focus:bg-accent cursor-pointer",
                          theme === "ocean" && "bg-accent"
                        )}
                        onClick={() => setTheme("ocean")}
                        role="menuitemradio"
                        aria-checked={theme === "ocean"}
                      >
                        <Waves className="mr-2 h-4 w-4" aria-hidden="true" />
                        <span className="flex-1">Ocean</span>
                        <div className="w-4 h-4 rounded-sm mr-2 bg-[#0C4A6E]" />
                        {theme === "ocean" && <Check className="h-4 w-4" aria-hidden="true" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className={cn(
                          "h-9 focus:bg-accent cursor-pointer",
                          theme === "aurora" && "bg-accent"
                        )}
                        onClick={() => setTheme("aurora")}
                        role="menuitemradio"
                        aria-checked={theme === "aurora"}
                      >
                        <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
                        <span className="flex-1">Aurora Borealis</span>
                        <div className="w-4 h-4 rounded-sm mr-2 bg-[#064E3B]" />
                        {theme === "aurora" && <Check className="h-4 w-4" aria-hidden="true" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className={cn(
                          "h-9 focus:bg-accent cursor-pointer",
                          theme === "volcanic" && "bg-accent"
                        )}
                        onClick={() => setTheme("volcanic")}
                        role="menuitemradio"
                        aria-checked={theme === "volcanic"}
                      >
                        <Flame className="mr-2 h-4 w-4" aria-hidden="true" />
                        <span className="flex-1">Volcanic Ember</span>
                        <div className="w-4 h-4 rounded-sm mr-2 bg-[#7F1D1D]" />
                        {theme === "volcanic" && <Check className="h-4 w-4" aria-hidden="true" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className={cn(
                          "h-9 focus:bg-accent cursor-pointer",
                          theme === "cosmos" && "bg-accent"
                        )}
                        onClick={() => setTheme("cosmos")}
                        role="menuitemradio"
                        aria-checked={theme === "cosmos"}
                      >
                        <Star className="mr-2 h-4 w-4" aria-hidden="true" />
                        <span className="flex-1">Violet Cosmos</span>
                        <div className="w-4 h-4 rounded-sm mr-2 bg-[#4C1D95]" />
                        {theme === "cosmos" && <Check className="h-4 w-4" aria-hidden="true" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className={cn(
                          "h-9 focus:bg-accent cursor-pointer",
                          theme === "desert" && "bg-accent"
                        )}
                        onClick={() => setTheme("desert")}
                        role="menuitemradio"
                        aria-checked={theme === "desert"}
                      >
                        <TreePalm className="mr-2 h-4 w-4" aria-hidden="true" />
                        <span className="flex-1">Desert Sand</span>
                        <div className="w-4 h-4 rounded-sm mr-2 bg-[#C2B280]" />
                        {theme === "desert" && <Check className="h-4 w-4" aria-hidden="true" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className={cn(
                          "h-9 focus:bg-accent cursor-pointer",
                          theme === "rose" && "bg-accent"
                        )}
                        onClick={() => setTheme("rose")}
                        role="menuitemradio"
                        aria-checked={theme === "rose"}
                      >
                        <Flower2 className="mr-2 h-4 w-4" aria-hidden="true" />
                        <span className="flex-1">Rose Garden</span>
                        <div className="w-4 h-4 rounded-sm mr-2 bg-[#C9184A]" />
                        {theme === "rose" && <Check className="h-4 w-4" aria-hidden="true" />}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TooltipTrigger>
                <TooltipContent side="top">Theme</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button 
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-muted rounded-full transition-colors"
                        aria-label="More options"
                      >
                        <Menu className="w-5 h-5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56" role="menu" aria-label="More options">
                      <Link href="/about">
                        <DropdownMenuItem 
                          className={cn(
                            "h-9 focus:bg-accent cursor-pointer",
                            isAboutPage && "bg-accent"
                          )}
                        >
                          <Info className="mr-2 h-4 w-4" aria-hidden="true" />
                          <span className="flex-1">About</span>
                          {isAboutPage && <Check className="h-4 w-4" aria-hidden="true" />}
                        </DropdownMenuItem>
                      </Link>
                      <a 
                        href="https://github.com/hashnode-labs/epigram/"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <DropdownMenuItem className="h-9 focus:bg-accent cursor-pointer">
                          <Github className="mr-2 h-4 w-4" aria-hidden="true" />
                          <span className="flex-1">Contribute and fork</span>
                        </DropdownMenuItem>
                      </a>
                      <DropdownMenuItem 
                        className="h-9 focus:bg-accent cursor-pointer"
                        onClick={() => setIsShareOpen(true)}
                      >
                        <Share2 className="mr-2 h-4 w-4" aria-hidden="true" />
                        <span className="flex-1">Share Epigram</span>
                      </DropdownMenuItem>
                      <div className="h-px bg-border my-1" />
                      <div className="px-2 py-3 space-y-1">
                        <div className="text-xs text-center text-muted-foreground">
                          Built by humans, optimized by AI, with ❤️ from SF.
                        </div>
                        <div className="text-[10px] text-center text-muted-foreground/60">
                          © {new Date().getFullYear()} Epigram
                        </div>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TooltipTrigger>
                <TooltipContent>
                  <p>More options</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </nav>
      </div>

      <Drawer open={isShareOpen} onOpenChange={setIsShareOpen}>
        <DrawerContent>
          <div className="mx-auto max-w-lg w-full">
            <DrawerHeader>
              <DrawerTitle className="text-center">Share Epigram</DrawerTitle>
              <DrawerDescription className="text-center">
                Share Epigram with your friends and colleagues
              </DrawerDescription>
            </DrawerHeader>
            <div className="flex justify-center gap-4 p-4">
              {shareLinks.map((link) => (
                <Button
                  key={link.name}
                  variant="outline"
                  size="icon"
                  onClick={(e) => {
                    e.preventDefault();
                    window.open(link.url, '_blank', 'width=550,height=435');
                  }}
                  className={cn(
                    "rounded-full transition-colors",
                    link.color
                  )}
                  aria-label={link.name}
                >
                  {typeof link.icon === 'string' ? (
                    <span className="text-2xl">{link.icon}</span>
                  ) : (
                    link.icon
                  )}
                </Button>
              ))}
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="sm:max-w-[600px] left-[50%] top-[50%] -translate-x-[50%] -translate-y-[50%] -mt-24 w-[calc(100%-2rem)] p-0 bg-background/80 backdrop-blur-xl border shadow-lg rounded-xl overflow-hidden absolute">
          <div className="p-6 space-y-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold tracking-tight">Search Epigram</DialogTitle>
            </DialogHeader>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Type to search articles..."
                className="w-full h-12 rounded-xl border border-input bg-background/50 px-12 pr-20 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
                autoFocus
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none inline-flex h-7 select-none items-center gap-1 rounded border bg-muted px-2 font-mono text-xs font-medium text-muted-foreground opacity-60">
                ⏎
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AppSwitcher; 