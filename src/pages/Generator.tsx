import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import { Slider } from "@/components/ui/slider";

interface GeneratorPageProps {
  lines: string[];
  fileName: string;
}

export default function Generator({ lines, fileName }: GeneratorPageProps) {
  const [count, setCount] = useState(10);
  const [minLen, setMinLen] = useState(0);
  const [maxLen, setMaxLen] = useState(500);
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [generated, setGenerated] = useState(false);

  const filtered = useMemo(() => {
    return lines.filter((line) => {
      const len = line.length;
      if (len < minLen || (maxLen > 0 && len > maxLen)) return false;
      if (keyword.trim() && !line.toLowerCase().includes(keyword.toLowerCase())) return false;
      return true;
    });
  }, [lines, minLen, maxLen, keyword]);

  const generate = () => {
    if (filtered.length === 0) {
      setResults([]);
      setGenerated(true);
      return;
    }
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    setResults(shuffled.slice(0, Math.min(count, filtered.length)));
    setGenerated(true);
  };

  const copyAll = () => {
    navigator.clipboard.writeText(results.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasFile = lines.length > 0;

  return (
    <div className="min-h-screen bg-grid p-6 md:p-12 animate-fade-in">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-3 uppercase tracking-wide">
            <span className="neon-text-purple">Генератор</span> строк
          </h1>
          <div className="flex items-center gap-3">
            {hasFile ? (
              <>
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse-slow" />
                <p className="text-muted-foreground text-sm">
                  Файл: <span className="text-white font-medium">{fileName}</span>
                  {" · "}
                  <span className="neon-text-purple font-semibold">{lines.length.toLocaleString()}</span> строк
                </p>
              </>
            ) : (
              <>
                <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse-slow" />
                <p className="text-muted-foreground text-sm">Файл не загружен — перейди на вкладку «Загрузка»</p>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Settings panel */}
          <div className="lg:col-span-2 space-y-4">

            {/* Count */}
            <div className="glass gradient-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Icon name="Hash" size={16} className="text-purple-400" />
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Количество строк</p>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <span className="font-display text-4xl font-bold neon-text-purple">{count}</span>
                <span className="text-muted-foreground text-sm">из {filtered.length.toLocaleString()} подходящих</span>
              </div>
              <Slider
                min={1}
                max={Math.max(Math.min(lines.length, 1000), 1)}
                step={1}
                value={[count]}
                onValueChange={(v) => setCount(v[0])}
                className="w-full"
              />
              <div className="flex justify-between mt-2">
                <span className="text-xs text-muted-foreground">1</span>
                <span className="text-xs text-muted-foreground">{Math.max(Math.min(lines.length, 1000), 1).toLocaleString()}</span>
              </div>
            </div>

            {/* Keyword filter */}
            <div className="glass gradient-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Icon name="Search" size={16} className="text-cyan-400" />
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Ключевое слово</p>
              </div>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Введите слово..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-purple-500/60 focus:bg-white/8 transition-all"
              />
              {keyword && (
                <p className="mt-2 text-xs text-cyan-400">
                  Найдено строк: <span className="font-bold">{filtered.length.toLocaleString()}</span>
                </p>
              )}
            </div>

            {/* Length filter */}
            <div className="glass gradient-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Icon name="Ruler" size={16} className="text-pink-400" />
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Длина строки</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Минимум</label>
                  <input
                    type="number"
                    min={0}
                    value={minLen}
                    onChange={(e) => setMinLen(Math.max(0, +e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/60 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Максимум</label>
                  <input
                    type="number"
                    min={0}
                    value={maxLen}
                    onChange={(e) => setMaxLen(Math.max(0, +e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/60 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Generate button */}
            <button
              onClick={generate}
              disabled={!hasFile}
              className={`
                w-full py-4 rounded-2xl font-display text-lg font-semibold uppercase tracking-wider transition-all duration-300
                ${hasFile
                  ? "bg-gradient-to-r from-purple-600 to-cyan-500 text-white hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] active:scale-[0.98] neon-glow-purple"
                  : "bg-white/5 text-muted-foreground cursor-not-allowed"
                }
              `}
            >
              <span className="flex items-center justify-center gap-2">
                <Icon name="Zap" size={20} />
                Генерировать
              </span>
            </button>

          </div>

          {/* Results panel */}
          <div className="lg:col-span-3">
            <div className="glass gradient-border rounded-2xl h-full min-h-[400px] flex flex-col">
              <div className="flex items-center justify-between p-5 border-b border-white/6">
                <div className="flex items-center gap-2">
                  <Icon name="List" size={16} className="text-purple-400" />
                  <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Результат</span>
                  {results.length > 0 && (
                    <span className="ml-1 px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold">{results.length}</span>
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

              <div className="flex-1 overflow-y-auto p-4 space-y-1.5 max-h-[520px]">
                {!generated && (
                  <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                    <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mb-4 animate-pulse-slow">
                      <Icon name="Sparkles" size={28} className="text-purple-400" />
                    </div>
                    <p className="text-muted-foreground text-sm">Нажми «Генерировать»<br />чтобы получить результат</p>
                  </div>
                )}

                {generated && results.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                    <Icon name="SearchX" size={32} className="text-muted-foreground mb-3" />
                    <p className="text-muted-foreground text-sm">Ни одна строка не прошла фильтр.<br />Попробуй изменить условия.</p>
                  </div>
                )}

                {results.map((line, i) => (
                  <div
                    key={i}
                    className="result-item flex items-start gap-3 py-2 px-3 rounded-lg hover:bg-white/4 group cursor-default transition-colors"
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <span className="font-display text-xs text-muted-foreground w-6 text-right shrink-0 pt-0.5">{i + 1}</span>
                    <span className="text-sm text-foreground/85 leading-relaxed break-all">{line}</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(line)}
                      className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5"
                      title="Копировать строку"
                    >
                      <Icon name="Copy" size={13} className="text-muted-foreground hover:text-purple-400 transition-colors" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
