import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { Upload, FileText, Image as ImageIcon, AlertCircle, Sparkles, X, FileSpreadsheet } from "lucide-react";

interface UploadZoneProps {
  onFileSelected: (content: string, mimeType: string, fileName: string, isRawText: boolean) => void;
  isLoading: boolean;
  onClear: () => void;
  fileName: string | null;
}

export default function UploadZone({ onFileSelected, isLoading, onClear, fileName }: UploadZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const processFile = (file: File) => {
    setError(null);
    const validImageTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    const isPDF = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    const isCSV = file.type === "text/csv" || file.name.toLowerCase().endsWith(".csv");
    const isTXT = file.type.startsWith("text/plain") || file.name.toLowerCase().endsWith(".txt");

    if (!validImageTypes.includes(file.type) && !isPDF && !isCSV && !isTXT) {
      setError("Formato non supportato. Seleziona CSV, TXT, PDF o un'immagine (PNG, JPEG, WEBP).");
      return;
    }

    if (file.size > 14 * 1024 * 1024) {
      setError("Il file supera il limite di 14 MB.");
      return;
    }

    const reader = new FileReader();
    
    if (isCSV || isTXT) {
      // Read as text directly for client side parsing
      reader.onload = () => {
        if (typeof reader.result === "string") {
          onFileSelected(reader.result, isCSV ? "text/csv" : "text/plain", file.name, true);
        } else {
          setError("Impossibile leggere il file.");
        }
      };
      reader.onerror = () => {
        setError("Errore durante la lettura del file.");
      };
      reader.readAsText(file);
    } else {
      // Read as base64 data URL for Gemini AI
      reader.onload = () => {
        if (typeof reader.result === "string") {
          const parts = reader.result.split(",");
          const base64Data = parts[1];
          onFileSelected(base64Data, file.type || (isPDF ? "application/pdf" : "image/jpeg"), file.name, false);
        } else {
          setError("Impossibile leggere il file.");
        }
      };
      reader.onerror = () => {
        setError("Errore durante la lettura del file.");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (isLoading) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    if (!isLoading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const getFileIcon = () => {
    if (!fileName) return null;
    const nameLower = fileName.toLowerCase();
    if (nameLower.endsWith(".csv") || nameLower.endsWith(".txt")) {
      return <FileSpreadsheet className="w-8 h-8 text-brand-primary shrink-0" />;
    } else if (nameLower.endsWith(".pdf")) {
      return <FileText className="w-8 h-8 text-rose-500 shrink-0" />;
    } else {
      return <ImageIcon className="w-8 h-8 text-amber-600 shrink-0" />;
    }
  };

  return (
    <div className="w-full" id="upload-zone-wrapper">
      {!fileName ? (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 ${
            isDragActive
              ? "border-brand-primary bg-brand-primary/5 scale-[0.99]"
              : "border-[#e3dcd3] hover:border-brand-primary bg-white hover:bg-slate-50/40"
          }`}
          id="dropzone-box"
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".csv,.txt,.pdf,image/png,image/jpeg,image/jpg,image/webp"
            onChange={handleFileChange}
            disabled={isLoading}
          />
          
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary">
              <Upload className="w-5 h-5 shrink-0" />
            </div>
            
            <div>
              <p className="text-xs font-semibold text-slate-700">
                Trascina qui il tuo file CSV o <span className="text-brand-primary underline hover:text-brand-primary-hover">sfoglia</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                Formati supportati: .csv, .txt (separati da virgola o punto e virgola) o PDF/Immagini per estrazione AI
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] text-slate-500 bg-slate-50 py-1 px-2.5 rounded-md border border-slate-150">
              <span className="flex items-center gap-1 font-semibold text-slate-600">
                <Sparkles className="w-3 h-3 text-brand-secondary" />
                Parser CSV Locale Istantaneo
              </span>
              <span>•</span>
              <span>Estrai con AI da PDF e Foto</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between p-4 bg-[#fbfaf7] border border-[#e3dcd3] rounded-xl" id="file-loaded-pills">
          <div className="flex items-center gap-3">
            {getFileIcon()}
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-700 truncate max-w-[180px] sm:max-w-md">
                {fileName}
              </p>
              <p className="text-[10px] text-brand-primary font-semibold uppercase tracking-wider">Documento Caricato</p>
            </div>
          </div>
          <button
            onClick={onClear}
            disabled={isLoading}
            className="p-1 px-3 flex items-center gap-1 text-[11px] text-brand-primary hover:text-white bg-white hover:bg-brand-primary border border-[#e3dcd3] hover:border-brand-primary rounded-lg shadow-2xs transition active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <X className="w-3 h-3" />
            <span>Rimuovi</span>
          </button>
        </div>
      )}

      {error && (
        <div className="mt-3 flex items-start gap-2 text-2xs text-rose-600 bg-rose-50 border border-rose-100 p-2.5 rounded-lg" id="upload-error-pill">
          <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
