import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Slider } from "@/components/ui/slider";

const AI_URL = "https://functions.poehali.dev/96638dff-c905-460c-8005-3dcd7e4ad887";

interface AiGeneratorProps {
  lines: string[];
  fileName: string;
}

type Status = "idle" | "loading" | "done" | "error";

export default function AiGenerator({ lines, fileName }: AiGeneratorProps) {
  const [count, setCount] = useState(10);
  const [prompt, setPrompt] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const hasFile = lines.length > 0;

  const generate = async () => {
    if (!hasFile) return;
    setStatus("loading");
    setError("");
    setResults([]);

    try {
      const resp = await fetch(AI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phrases: lines, count, prompt }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Ошибка сервера");
      setResults(data.lines || []);
      setStatus("done");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Неизвестная ошибка");
      setStatus("error");
    }
  };

  const copyAll = () => {
    navigator.clipboard.writeText(results.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-grid p-6 md:p-12 animate-fade-in">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="px-2.5 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30">
              <span className="text-xs font-semibold text-purple-300 uppercase tracking-widest">GPT-4o</span>
            </div>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-3 uppercase tracking-wide">
            <span className="neon-text-pink">ИИ</span>-генерация
          </h1>
          <div className="flex items-center gap-3">
            {hasFile ? (
              <>
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse-slow" />
                <p className="text-muted-foreground text-sm">
                  <span className="text-white font-medium">{fileName}</span>
                  {" · "}
                  <span className="neon-text-purple font-semibold">{lines.length.toLocaleString()}</span> строк в базе
                </p>
              </>
            ) : (
              <>
                <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse-slow" />
                <p className="text-muted-foreground text-sm">Сначала загрузи файл на вкладке «Загрузка»</p>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Settings */}
          <div className="lg:col-span-2 space-y-4">

            {/* Count */}
            <div className="glass gradient-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Icon name="Hash" size={16} className="text-pink-400" />
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Количество фраз</p>
              </div>
              <div className="mb-4">
                <span className="font-display text-4xl font-bold" style={{ color: "var(--neon-pink)" }}>{count}</span>
              </div>
              <Slider
                min={1}
                max={50}
                step={1}
                value={[count]}
                onValueChange={(v) => setCount(v[0])}
                className="w-full"
              />
              <div className="flex justify-between mt-2">
                <span className="text-xs text-muted-foreground">1</span>
                <span className="text-xs text-muted-foreground">50</span>
              </div>
            </div>

            {/* Extra prompt */}
            <div className="glass gradient-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Icon name="MessageSquare" size={16} className="text-cyan-400" />
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Уточнение для ИИ</p>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Например: сделай фразы короче, добавь юмор, используй метафоры..."
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-purple-500/60 transition-all resize-none"
              />
            </div>



            {/* How it works */}
            <div className="glass rounded-2xl p-4 space-y-2.5">
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-3">Как работает</p>
              {[
                { icon: "Database", text: "Берёт фразы из файла как образец", color: "text-purple-400" },
                { icon: "Brain", text: "GPT-4o анализирует стиль и смысл", color: "text-pink-400" },
                { icon: "Wand2", text: "Создаёт новые комбинации и перефразировки", color: "text-cyan-400" },
              ].map(({ icon, text, color }) => (
                <div key={icon} className="flex items-start gap-2.5">
                  <Icon name={icon} fallback="Circle" size={14} className={`${color} mt-0.5 shrink-0`} />
                  <p className="text-xs text-muted-foreground leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            <div className="glass gradient-border rounded-2xl h-full min-h-[420px] flex flex-col">
              <div className="flex items-center justify-between p-5 border-b border-white/6">
                <div className="flex items-center gap-2">
                  <Icon name="Sparkles" size={16} className="text-pink-400" />
                  <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Результат ИИ</span>
                  {results.length > 0 && (
                    <span className="ml-1 px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 text-xs font-bold">{results.length}</span>
                  )}
                </div>
                {results.length > 0 && (
                  <button
                    onClick={copyAll}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-muted-foreground hover:text-white transition-all"
                  >
                    <Icon name={copied ? "Check" : "Copy"} size={13} className={copied ? "text-green-400" : ""} />
                    {copied ? "Скопировано!" : "Копировать всё"}
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-4 max-h-[520px]">

                {/* Idle */}
                {status === "idle" && (
                  <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500/15 to-purple-500/15 flex items-center justify-center mb-5 animate-pulse-slow">
                      <Icon name="Sparkles" size={32} className="text-pink-400" />
                    </div>
                    <p className="text-white font-semibold mb-2">Готов к генерации</p>
                    <p className="text-muted-foreground text-sm max-w-xs">
                      ИИ создаст новые фразы на основе загруженного файла
                    </p>
                  </div>
                )}

                {/* Loading skeleton */}
                {status === "loading" && (
                  <div className="space-y-2 py-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-8 rounded-lg bg-white/5 animate-pulse"
                        style={{
                          width: `${60 + Math.random() * 35}%`,
                          animationDelay: `${i * 100}ms`,
                        }}
                      />
                    ))}
                    <div className="flex items-center gap-2 mt-6 text-muted-foreground">
                      <Icon name="Loader2" size={14} className="animate-spin text-pink-400" />
                      <span className="text-xs">GPT-4o обрабатывает фразы...</span>
                    </div>
                  </div>
                )}

                {/* Error */}
                {status === "error" && (
                  <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                    <Icon name="AlertCircle" size={36} className="text-red-400 mb-3" />
                    <p className="text-red-400 font-semibold mb-1">Ошибка</p>
                    <p className="text-muted-foreground text-sm max-w-xs">{error}</p>
                    {error.includes("API") && (
                      <p className="text-xs text-muted-foreground mt-3 max-w-xs">
                        Убедись, что API-ключ OpenAI добавлен в настройки проекта
                      </p>
                    )}
                  </div>
                )}

                {/* Results */}
                {status === "done" && (
                  <div className="space-y-1.5">
                    {results.map((line, i) => (
                      <div
                        key={i}
                        className="result-item flex items-start gap-3 py-2 px-3 rounded-lg hover:bg-white/4 group cursor-default transition-colors"
                        style={{ animationDelay: `${i * 25}ms` }}
                      >
                        <span className="font-display text-xs text-muted-foreground w-6 text-right shrink-0 pt-0.5">{i + 1}</span>
                        <span className="text-sm text-foreground/85 leading-relaxed break-all flex-1">{line}</span>
                        <button
                          onClick={() => navigator.clipboard.writeText(line)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5"
                          title="Копировать"
                        >
                          <Icon name="Copy" size={13} className="text-muted-foreground hover:text-pink-400 transition-colors" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}