import { useState, useRef, useCallback } from "react";
import Icon from "@/components/ui/icon";

interface UploadPageProps {
  onFileLoaded: (lines: string[], fileName: string) => void;
  loadedFileName: string;
  loadedLinesCount: number;
}

export default function Upload({ onFileLoaded, loadedFileName, loadedLinesCount }: UploadPageProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string[]>([]);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setError("");
    if (!file.name.endsWith(".txt")) {
      setError("Поддерживаются только файлы .txt");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length === 0) {
        setError("Файл пустой или не содержит строк");
        return;
      }
      setPreview(lines.slice(0, 5));
      onFileLoaded(lines, file.name);
    };
    reader.readAsText(file, "UTF-8");
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className="min-h-screen bg-grid p-6 md:p-12 animate-fade-in">
      <div className="max-w-2xl mx-auto">

        <div className="mb-10">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-3 uppercase tracking-wide">
            <span className="neon-text-cyan">Загрузка</span> файла
          </h1>
          <p className="text-muted-foreground text-lg">
            Загрузите TXT-файл — каждая строка станет элементом для генерации
          </p>
        </div>

        {/* Drop zone */}
        <div
          onClick={() => fileRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            gradient-border glass rounded-2xl p-12 text-center cursor-pointer transition-all duration-300
            ${isDragging
              ? "bg-purple-500/10 scale-[1.02] neon-glow-purple"
              : "hover:bg-white/5 hover:scale-[1.01]"
            }
          `}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".txt"
            className="hidden"
            onChange={handleFileInput}
          />

          <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center transition-all duration-300 ${isDragging ? "bg-purple-500/30 neon-glow-purple" : "bg-purple-500/15"}`}>
            <Icon name="Upload" size={36} className="text-purple-400" />
          </div>

          <p className="text-xl font-semibold text-white mb-2">
            {isDragging ? "Отпустите файл" : "Перетащите или нажмите"}
          </p>
          <p className="text-muted-foreground">
            Поддерживается формат <span className="neon-text-cyan font-semibold">.txt</span>
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 glass rounded-xl p-4 border border-red-500/30 flex items-center gap-3 animate-slide-up">
            <Icon name="AlertCircle" size={20} className="text-red-400 shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Loaded file info */}
        {loadedFileName && !error && (
          <div className="mt-6 glass gradient-border rounded-2xl p-6 animate-slide-up">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <Icon name="FileText" size={24} className="text-green-400" />
              </div>
              <div>
                <p className="font-semibold text-white">{loadedFileName}</p>
                <p className="text-muted-foreground text-sm">
                  <span className="neon-text-purple font-bold">{loadedLinesCount.toLocaleString()}</span> строк загружено
                </p>
              </div>
              <div className="ml-auto">
                <Icon name="CheckCircle2" size={28} className="text-green-400" />
              </div>
            </div>

            {preview.length > 0 && (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <Icon name="Eye" size={14} className="text-muted-foreground" />
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">Предпросмотр (первые 5 строк)</p>
                </div>
                <div className="space-y-1.5">
                  {preview.map((line, i) => (
                    <div key={i} className="flex items-center gap-3 py-2 px-3 bg-white/3 rounded-lg">
                      <span className="text-xs text-muted-foreground w-5 text-right shrink-0 font-display">{i + 1}</span>
                      <span className="text-sm text-foreground/80 truncate">{line}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Tips */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { icon: "AlignLeft", label: "Одна строка", sub: "= один элемент", color: "text-purple-400" },
            { icon: "Sparkles", label: "UTF-8", sub: "кодировка", color: "text-cyan-400" },
            { icon: "Zap", label: "До 1 млн", sub: "строк поддерживается", color: "text-pink-400" },
          ].map(({ icon, label, sub, color }) => (
            <div key={label} className="glass glass-hover rounded-xl p-4 flex items-center gap-3">
              <Icon name={icon} fallback="Info" size={18} className={color} />
              <div>
                <p className="text-sm font-semibold text-white">{label}</p>
                <p className="text-xs text-muted-foreground">{sub}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}