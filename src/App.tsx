import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Icon from "@/components/ui/icon";
import Generator from "./pages/Generator";
import Upload from "./pages/Upload";

const queryClient = new QueryClient();

type Tab = "generator" | "upload";

const App = () => {
  const [tab, setTab] = useState<Tab>("generator");
  const [lines, setLines] = useState<string[]>([]);
  const [fileName, setFileName] = useState("");

  const handleFileLoaded = (newLines: string[], name: string) => {
    setLines(newLines);
    setFileName(name);
    setTimeout(() => setTab("generator"), 300);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <div className="min-h-screen bg-background flex flex-col">

          {/* Top nav */}
          <header className="sticky top-0 z-50 glass border-b border-white/6">
            <div className="max-w-5xl mx-auto px-6 py-0 flex items-center gap-0">

              {/* Logo */}
              <div className="flex items-center gap-2.5 mr-8 py-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center">
                  <Icon name="Shuffle" size={16} className="text-white" />
                </div>
                <span className="font-display text-lg font-bold uppercase tracking-wider text-white">StringGen</span>
              </div>

              {/* Tabs */}
              <nav className="flex items-stretch h-full">
                {([
                  { id: "generator", label: "Генератор", icon: "Zap" },
                  { id: "upload", label: "Загрузка", icon: "Upload" },
                ] as { id: Tab; label: string; icon: string }[]).map(({ id, label, icon }) => (
                  <button
                    key={id}
                    onClick={() => setTab(id)}
                    className={`
                      flex items-center gap-2 px-5 py-4 text-sm font-semibold transition-all duration-200 border-b-2 relative
                      ${tab === id
                        ? "text-white border-purple-400"
                        : "text-muted-foreground border-transparent hover:text-white hover:border-white/20"
                      }
                    `}
                  >
                    <Icon name={icon} fallback="Circle" size={15} />
                    {label}
                    {id === "upload" && lines.length > 0 && (
                      <span className="ml-1 w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse-slow" />
                    )}
                  </button>
                ))}
              </nav>

              {/* Stats */}
              {lines.length > 0 && (
                <div className="ml-auto flex items-center gap-2 py-4">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/25">
                    <Icon name="Database" size={12} className="text-purple-400" />
                    <span className="text-xs text-purple-300 font-semibold">{lines.length.toLocaleString()} строк</span>
                  </div>
                </div>
              )}
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1">
            {tab === "generator" && <Generator lines={lines} fileName={fileName} />}
            {tab === "upload" && (
              <Upload
                onFileLoaded={handleFileLoaded}
                loadedFileName={fileName}
                loadedLinesCount={lines.length}
              />
            )}
          </main>

          {/* Footer */}
          <footer className="border-t border-white/6 py-4 px-6 text-center">
            <p className="text-xs text-muted-foreground">
              StringGen · Генератор строк из файла
            </p>
          </footer>

        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
