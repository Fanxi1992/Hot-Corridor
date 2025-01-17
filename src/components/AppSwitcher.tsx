'use client';
// 导入必要的 React 钩子和第三方库
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// 导入大量图标组件，用于应用内不同功能和状态的视觉表示
import { 
  Check, Moon, Monitor, Sun, Tags, 
  Scroll, Eye, Leaf, Waves,
  Sparkles, Flame, Star, Menu,
  Info, Share2, 
  Twitter, Linkedin, Facebook, MessageCircle,
  Github, X, Search,
  TreePalm,
  Flower2,
  Mic,
  Loader2
} from 'lucide-react';

// 导入自定义组件和图标
import { LogoIcon } from '@/components/logo-icon';

// 导入 UI 组件，用于构建交互式下拉菜单、提示和抽屉
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';

// 导入工具函数和主题上下文
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';

// 导入特定的图标组件
import { WhatsAppIcon } from '@/components/icons/whatsapp-icon';

// 导入基础 UI 组件
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// 定义应用分享的基础 URL 和文案
// 这些常量用于社交媒体分享功能
const SHARE_URL = 'https://hodler.news';
const SHARE_TEXT = "Hodler - 一个免费的，AI驱动的，新闻聚合器。";

// 定义社交媒体分享配置
// 包含每个平台的分享链接生成规则、图标和颜色样式
const SOCIAL_CONFIGS = [
  {
    name: 'X (Twitter)', // 平台名称
    icon: <Twitter className="w-5 h-5" />, // 平台图标
    // 生成分享链接的模板函数，支持自定义文案和 URL
    urlTemplate: (text: string, url: string) => 
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    // 悬停和交互时的颜色样式
    color: 'hover:bg-[#1DA1F2]/10 group-hover:text-[#1DA1F2]'
  },
  // 其他社交平台的配置类似，包括 LinkedIn、Facebook、WhatsApp 和 Messages
  // 每个配置都遵循相似的结构：名称、图标、链接生成模板和交互颜色
  {
    name: 'LinkedIn',
    icon: <Linkedin className="w-5 h-5" />,
    urlTemplate: (_: string, url: string) => 
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    color: 'hover:bg-[#0A66C2]/10 group-hover:text-[#0A66C2]'
  },
  // ... 其他社交平台配置
] as const; // 使用 const 断言，确保类型推断的精确性

// 在文件顶部添加以下类型声明
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

// 扩展 Window 接口
declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
    speechRecognition?: SpeechRecognition;
  }
}

const AppSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const isTopicsPage = pathname === '/topics';
  const isAboutPage = pathname === '/about';
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isVoiceDialogOpen, setIsVoiceDialogOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');

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

  const shareLinks = useMemo(() => 
    SOCIAL_CONFIGS.map(config => ({
      ...config,
      url: config.urlTemplate(SHARE_TEXT, SHARE_URL)
    })), 
    []
  );

  const handleStartRecording = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognitionAPI = window.webkitSpeechRecognition || window.SpeechRecognition;
      if (SpeechRecognitionAPI) {
        const recognition = new SpeechRecognitionAPI();
        window.speechRecognition = recognition;
        recognition.lang = 'zh-CN';
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onstart = () => {
          setIsRecording(true);
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = Array.from(event.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join('');
          setTranscript(transcript);
        };

        recognition.onend = async () => {
          setIsRecording(false);
          if (transcript.length > 5) {
            setIsProcessing(true);
            try {
              const response = await fetch('/api/process-voice', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: transcript }),
              });
              if (response.ok) {
                // 处理响应，更新卡片状态
                const data = await response.json();
                // TODO: 更新卡片状态的逻辑
              }
            } catch (error) {
              console.error('处理语音输入时出错:', error);
            } finally {
              setIsProcessing(false);
              setIsVoiceDialogOpen(false);
              setTranscript('');
            }
          }
        };

        recognition.start();
      }
    } else {
      alert('您的浏览器不支持语音识别功能');
    }
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    window.speechRecognition?.stop();
  };

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
                    <h3 className="font-semibold">欢迎使用Hodler!</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                  An AI-powered hotspot aggregator for crypto retail investors. Stay ahead with real-time updates on KOL opinions and crypto opportunities. Offering balanced and trustworthy insights, it’s designed for fast-paced lifestyles with a sleek, user-friendly interface and exceptional user experience.
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <button
                      onClick={dismissWelcome}
                      className="flex-1 py-1 px-3 bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity"
                    >
                      Get Started
                    </button>
                    <a
                      href="http://59aichat.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={dismissWelcome}
                      className="flex-1 py-1 px-3 bg-secondary text-secondary-foreground rounded-full hover:opacity-90 transition-opacity whitespace-nowrap text-center"
                    >
                      About Hodler
                    </a>
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
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
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
              <span className="font-medium text-sm">HODLer</span>
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
                  <button
                    onClick={() => setIsVoiceDialogOpen(true)}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-muted rounded-full transition-colors"
                    aria-label="语音输入"
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">语音输入</TooltipContent>
              </Tooltip>
            </TooltipProvider>

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
                    <DropdownMenuContent
                      align="end"
                      className="w-56"
                      role="menu"
                      aria-label="Theme options"
                    >
                      <DropdownMenuItem
                        className={cn(
                          "flex items-center gap-3 h-10 focus:bg-accent/50 cursor-pointer transition-colors",
                          theme === "light" && "bg-accent/50"
                        )}
                        onClick={() => setTheme("light")}
                        role="menuitemradio"
                        aria-checked={theme === "light"}
                      >
                        <div className="p-1 rounded-md bg-primary/10">
                          <Sun className="h-4 w-4 text-primary" aria-hidden="true" />
                        </div>
                        <span className="flex-1 font-medium">Light</span>
                        {theme === "light" && (
                          <Check className="h-4 w-4 text-primary" aria-hidden="true" />
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className={cn(
                          "flex items-center gap-3 h-10 focus:bg-accent/50 cursor-pointer transition-colors",
                          theme === "dark" && "bg-accent/50"
                        )}
                        onClick={() => setTheme("dark")}
                        role="menuitemradio"
                        aria-checked={theme === "dark"}
                      >
                        <div className="p-1 rounded-md bg-primary/10">
                          <Moon className="h-4 w-4 text-primary" aria-hidden="true" />
                        </div>
                        <span className="flex-1 font-medium">Dark</span>
                        {theme === "dark" && (
                          <Check className="h-4 w-4 text-primary" aria-hidden="true" />
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className={cn(
                          "flex items-center gap-3 h-10 focus:bg-accent/50 cursor-pointer transition-colors",
                          theme === "system" && "bg-accent/50"
                        )}
                        onClick={() => setTheme("system")}
                        role="menuitemradio"
                        aria-checked={theme === "system"}
                      >
                        <div className="p-1 rounded-md bg-primary/10">
                          <Monitor className="h-4 w-4 text-primary" aria-hidden="true" />
                        </div>
                        <span className="flex-1 font-medium">System</span>
                        {theme === "system" && (
                          <Check className="h-4 w-4 text-primary" aria-hidden="true" />
                        )}
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
                        {theme === "sepia" && (
                          <Check className="h-4 w-4" aria-hidden="true" />
                        )}
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
                        {theme === "high-contrast" && (
                          <Check className="h-4 w-4" aria-hidden="true" />
                        )}
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
                        {theme === "forest" && (
                          <Check className="h-4 w-4" aria-hidden="true" />
                        )}
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
                        {theme === "ocean" && (
                          <Check className="h-4 w-4" aria-hidden="true" />
                        )}
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
                        {theme === "aurora" && (
                          <Check className="h-4 w-4" aria-hidden="true" />
                        )}
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
                        {theme === "volcanic" && (
                          <Check className="h-4 w-4" aria-hidden="true" />
                        )}
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
                        {theme === "cosmos" && (
                          <Check className="h-4 w-4" aria-hidden="true" />
                        )}
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
                        {theme === "desert" && (
                          <Check className="h-4 w-4" aria-hidden="true" />
                        )}
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
                        {theme === "rose" && (
                          <Check className="h-4 w-4" aria-hidden="true" />
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TooltipTrigger>
                <TooltipContent side="top">Theme</TooltipContent>
              </Tooltip>
            </TooltipProvider>

          </div>
        </nav>
      </div>

      <Drawer open={isShareOpen} onOpenChange={setIsShareOpen}>
        <DrawerContent>
          <div className="mx-auto max-w-lg w-full">
            <DrawerHeader>
              <DrawerTitle className="text-center">Share Hodler</DrawerTitle>
              <DrawerDescription className="text-center">
                Share Hodler with your friends and colleagues
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
                    window.open(link.url, "_blank", "width=550,height=435");
                  }}
                  className={cn("rounded-full transition-colors", link.color)}
                  aria-label={link.name}
                >
                  {typeof link.icon === "string" ? (
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
              <DialogTitle className="text-2xl font-semibold tracking-tight">
                Search Hodler
              </DialogTitle>
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

      <Dialog open={isVoiceDialogOpen} onOpenChange={setIsVoiceDialogOpen}>
        <DialogContent className="sm:max-w-[400px] flex flex-col items-center">
          <DialogHeader>
            <DialogTitle>语音输入</DialogTitle>
          </DialogHeader>
          <div className="w-full flex flex-col items-center gap-4 py-8">
            {isProcessing ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-sm text-muted-foreground">正在处理您的语音...</p>
              </div>
            ) : (
              <>
                <button
                  onMouseDown={handleStartRecording}
                  onMouseUp={handleStopRecording}
                  onTouchStart={handleStartRecording}
                  onTouchEnd={handleStopRecording}
                  className={cn(
                    "w-20 h-20 rounded-full flex items-center justify-center transition-all",
                    isRecording
                      ? "bg-red-500 scale-110"
                      : "bg-primary hover:bg-primary/90"
                  )}
                >
                  <Mic className={cn(
                    "w-8 h-8",
                    isRecording ? "text-white animate-pulse" : "text-primary-foreground"
                  )} />
                </button>
                <p className="text-sm text-muted-foreground">
                  {isRecording ? "松开结束录音" : "按住说话"}
                </p>
                {transcript && (
                  <div className="w-full max-w-[300px] mt-4">
                    <p className="text-sm text-center break-words">
                      {transcript}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AppSwitcher; 