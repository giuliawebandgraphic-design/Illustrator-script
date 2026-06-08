import { useState } from "react";
import { Persona, Column, SeparatoreCSV } from "../types";
import { 
  Download, 
  Copy, 
  Check, 
  Sparkles, 
  FileSpreadsheet, 
  FileCode, 
  BookOpen, 
  CheckSquare, 
  Square,
  HelpCircle,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  AlertCircle
} from "lucide-react";

interface ExportPanelProps {
  persone: Persona[];
  columns: Column[];
  activePlaceholder: string;
  setActivePlaceholder: (val: string) => void;
  jsxCodeGenerator: () => string;
}

export default function ExportPanel({
  persone,
  columns,
  activePlaceholder,
  setActivePlaceholder,
  jsxCodeGenerator,
}: ExportPanelProps) {
  // Tabs: 'csv' for standard Data Merge / Stampa Unione, 'jsx' for automated Sequential Script
  const [exportType, setExportType] = useState<"csv" | "jsx">("csv");
  
  // CSV Export Configuration States
  const [csvSeparatore, setCsvSeparatore] = useState<SeparatoreCSV>(";");
  const [fixAccents, setFixAccents] = useState<boolean>(true);
  const [includeHeader, setIncludeHeader] = useState<boolean>(true);
  
  // Selected columns for CSV export
  const [selectedColIds, setSelectedColIds] = useState<string[]>(
    columns.map(c => c.id)
  );
  
  // Custom headers override mapping state
  const [customHeaderLabels, setCustomHeaderLabels] = useState<Record<string, string>>({});

  // UI state actions
  const [copiedCSV, setCopiedCSV] = useState(false);
  const [copiedJSX, setCopiedJSX] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  // Sync columns if a column was added or removed dynamically
  const activeColIds = columns.map(c => c.id);
  const validatedSelectedColIds = selectedColIds.filter(id => activeColIds.includes(id));
  
  // If no columns are checked but columns exist, reset
  const finalSelectedColIds = validatedSelectedColIds.length > 0 
    ? validatedSelectedColIds 
    : activeColIds;

  const handleToggleColumn = (colId: string) => {
    if (finalSelectedColIds.includes(colId)) {
      if (finalSelectedColIds.length > 1) {
        setSelectedColIds(finalSelectedColIds.filter(id => id !== colId));
      }
    } else {
      setSelectedColIds([...finalSelectedColIds, colId]);
    }
  };

  const handleHeaderLabelChange = (colId: string, value: string) => {
    setCustomHeaderLabels(prev => ({
      ...prev,
      [colId]: value
    }));
  };

  // Accents substitution helper to circumvent Illustrator Variable Panel encoding issues
  const ripulisciAccenti = (text: string): string => {
    if (!text) return "";
    return text
      .replace(/[àáâãäå]/g, "a'")
      .replace(/[èéêë]/g, "e'")
      .replace(/[ìíîï]/g, "i'")
      .replace(/[òóôõöø]/g, "o'")
      .replace(/[ùúûü]/g, "u'")
      .replace(/[ÀÁÂÃÄÅ]/g, "A'")
      .replace(/[ÈÉÊË]/g, "E'")
      .replace(/[ÌÍÎÏ]/g, "I'")
      .replace(/[ÒÓÔÕÖØ]/g, "O'")
      .replace(/[ÙÚÛÜ]/g, "U'")
      .replace(/ç/g, "c")
      .replace(/Ç/g, "C")
      .replace(/ñ/g, "n")
      .replace(/Ñ/g, "N");
  };

  // Core structured CSV Generator logic
  const generateCSVContent = (): string => {
    // Collect active selected columns
    const exportColumns = columns.filter(c => finalSelectedColIds.includes(c.id));
    
    // Resolve headers
    const headers = exportColumns.map(c => {
      const customLabel = customHeaderLabels[c.id];
      const finalLabel = customLabel !== undefined && customLabel.trim() !== "" 
        ? customLabel.trim() 
        : c.label;
      return fixAccents ? ripulisciAccenti(finalLabel) : finalLabel;
    });

    // Generate CSV records rows
    const rows = persone.map(p => {
      return exportColumns.map(c => {
        let val = p[c.id] !== undefined && p[c.id] !== null ? String(p[c.id]).trim() : "";
        if (fixAccents) {
          val = ripulisciAccenti(val);
        }
        // Escaping double quotes & wrapping cell in quotes if separator is found
        if (val.includes('"')) {
          val = val.replace(/"/g, '""');
        }
        if (val.includes(csvSeparatore) || val.includes('"') || val.includes("\n") || val.includes("\r") || val.includes(" ")) {
          return `"${val}"`;
        }
        return val;
      }).join(csvSeparatore);
    });

    const fullCSVString = includeHeader 
      ? [headers.join(csvSeparatore), ...rows].join("\r\n")
      : rows.join("\r\n");

    return fullCSVString;
  };

  const handleDownloadCSV = () => {
    if (persone.length === 0) {
      alert("Nessun record presente in tabella da esportare.");
      return;
    }
    const csvContent = generateCSVContent();
    const BOM = "\uFEFF"; // Byte Order Mark for Excel CSV UTF-8 compatibility
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `dati_stampa_unione_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyCSV = () => {
    if (persone.length === 0) return;
    const csvContent = generateCSVContent();
    navigator.clipboard.writeText(csvContent);
    setCopiedCSV(true);
    setTimeout(() => setCopiedCSV(false), 2000);
  };

  const handleDownloadJSX = () => {
    if (persone.length === 0) {
      alert("Nessun record presente in tabella.");
      return;
    }
    const code = jsxCodeGenerator();
    const blob = new Blob([code], { type: "text/javascript;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `unione_dati_illustrator_${activePlaceholder.replace(/[{}]/g, "").trim().toLowerCase()}.jsx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyJSX = () => {
    if (persone.length === 0) return;
    const code = jsxCodeGenerator();
    navigator.clipboard.writeText(code);
    setCopiedJSX(true);
    setTimeout(() => setCopiedJSX(false), 2000);
  };

  return (
    <div className="flex flex-col space-y-6" id="export-panel-wrapper">
      
      {/* EXPORT OPTIONS CARD */}
      <div className="bg-white border border-[#e3dcd3] rounded-[20px] p-5 md:p-6 shadow-2xs space-y-5" id="card-export-panel">
        
        {/* Card Title */}
        <div className="flex items-center justify-between pb-4 border-b border-[#f3efea]" id="export-panel-header">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">2. Opzioni Esportazione</h2>
              <p className="text-[10px] text-slate-400 font-medium">Esporta per Stampa Unione classica o tramite Script</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-slate-500 uppercase bg-[#fbfaf7] border border-[#e3dcd3] px-2.5 py-1 rounded">
            Output
          </span>
        </div>

        {/* Export Method Toggle (Tabs) */}
        <div className="grid grid-cols-2 p-1 bg-[#fcf9f5] border border-[#e3dcd3] rounded-xl" id="export-tabs-toggle">
          <button
            type="button"
            onClick={() => setExportType("csv")}
            className={`py-2 text-xs font-bold rounded-lg transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
              exportType === "csv"
                ? "bg-brand-primary text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Stampa Unione CSV</span>
          </button>
          
          <button
            type="button"
            onClick={() => setExportType("jsx")}
            className={`py-2 text-xs font-bold rounded-lg transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
              exportType === "jsx"
                ? "bg-brand-primary text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Script (.JSX) Automatico</span>
          </button>
        </div>

        {/* TAB 1: CSV EXPORT CONFIG */}
        {exportType === "csv" && (
          <div className="space-y-4 animate-in fade-in duration-200" id="csv-config-box">
            
            {/* General CSV Parameters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#fbfaf7] p-4 border border-[#e3dcd3] rounded-xl">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Dividi colonne con (Separatore):</label>
                <select
                  value={csvSeparatore}
                  onChange={(e) => setCsvSeparatore(e.target.value as SeparatoreCSV)}
                  className="w-full text-xs p-2.5 border border-[#e3dcd3] rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-brand-primary"
                >
                  <option value=";">Punto e virgola (;) - Pref. Excel ITA</option>
                  <option value=",">Virgola (,) - Pref. Lightroom / Illustrator OS ENG</option>
                  <option value="\t">Tabulatore (\t) - File TXT standard</option>
                </select>
              </div>

              <div className="flex flex-col justify-center space-y-2.5">
                {/* Accent Substitution Toggle */}
                <div 
                  onClick={() => setFixAccents(!fixAccents)}
                  className="flex items-center justify-between cursor-pointer select-none group"
                  title="Sostituisce lettere accentate (à->a', è->e', etc.) per evitare errori di codifica in Adobe Illustrator"
                >
                  <div>
                    <span className="block text-xs font-bold text-slate-700">Risolvi lettere accentate</span>
                    <span className="block text-[10px] text-slate-400">Previene errori di codifica in Illustrator</span>
                  </div>
                  {fixAccents ? (
                    <ToggleRight className="w-8 h-8 text-brand-primary" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-slate-300 group-hover:text-slate-400" />
                  )}
                </div>
              </div>
            </div>

            {/* Column toggles list */}
            <div className="space-y-2.5">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Seleziona Colonne da Includere & Mappa Intestazioni:</h4>
              <div className="border border-[#e3dcd3] rounded-xl bg-white overflow-hidden divide-y divide-slate-100">
                {columns.map((col) => {
                  const isChecked = finalSelectedColIds.includes(col.id);
                  const customVal = customHeaderLabels[col.id] || "";
                  
                  return (
                    <div key={col.id} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                      <div 
                        onClick={() => handleToggleColumn(col.id)}
                        className="flex items-center gap-2 cursor-pointer select-none"
                      >
                        {isChecked ? (
                          <div className="w-4 h-4 bg-brand-primary rounded flex items-center justify-center text-white shrink-0">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 border border-[#e3dcd3] rounded shrink-0 bg-white" />
                        )}
                        <div>
                          <span className="text-xs font-bold text-slate-700 uppercase tracking-tight">{col.label}</span>
                          <span className="block text-[9px] font-mono text-slate-400">id: {col.id}</span>
                        </div>
                      </div>

                      {isChecked && (
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <span className="text-[10px] text-slate-400 shrink-0 font-medium">Header CSV:</span>
                          <input
                            type="text"
                            value={customVal}
                            placeholder={col.label}
                            onChange={(e) => handleHeaderLabelChange(col.id, e.target.value)}
                            className="w-full sm:w-44 px-2 py-1.5 text-xs bg-white border border-[#e3dcd3] focus:border-brand-primary rounded-lg focus:outline-none placeholder-slate-300"
                            title="Rinomina questa intestazione specifica all'interno del CSV generato"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Core Export Actions for CSV */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2" id="csv-export-actions">
              <button
                onClick={handleDownloadCSV}
                disabled={persone.length === 0}
                className="w-full flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primary-hover disabled:bg-slate-200 text-white font-bold py-3 px-4 rounded-xl text-xs transition duration-150 shadow-sm cursor-pointer disabled:cursor-not-allowed select-none active:scale-98"
              >
                <Download className="w-4 h-4" />
                <span>Scarica File CSV</span>
              </button>

              <button
                onClick={handleCopyCSV}
                disabled={persone.length === 0}
                className="w-full flex items-center justify-center gap-2 border border-[#e3dcd3] bg-white hover:bg-[#fcf9f5] hover:border-brand-primary text-slate-700 hover:text-brand-primary font-bold py-3 px-4 rounded-xl text-xs transition duration-150 cursor-pointer disabled:cursor-not-allowed select-none active:scale-98"
              >
                {copiedCSV ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600 animate-ping" />
                    <span className="text-emerald-700">CSV Copiato!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copia Dati CSV</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex gap-2 p-3 bg-[#fdfdfc] border border-[#e3dcd3] border-dashed rounded-xl text-[11px] text-slate-500 leading-normal">
              <BookOpen className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
              <span>
                Il file CSV generato supporta la codifica <strong>BOM UTF-8</strong>. È perfetto per la "Stampa Unione" (Mail Merge / Data Merge) nativa delle variabili di Adobe Illustrator o per l'apertura diretta e immediata in Excel!
              </span>
            </div>

          </div>
        )}

        {/* TAB 2: EXTENDSCRIPT JSX EXPORT CONFIG */}
        {exportType === "jsx" && (
          <div className="space-y-4 animate-in fade-in duration-200" id="jsx-config-box">
            
            {/* Guide placeholder config representation matching screenshot style */}
            <div className="space-y-3 p-4 bg-[#fbfaf7] border border-[#e3dcd3] rounded-xl" id="search-placeholder-block-export">
              <div className="space-y-1.5">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Testo segnaposto cercato dallo Script:</h4>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={activePlaceholder}
                    onChange={(e) => setActivePlaceholder(e.target.value)}
                    className="w-full text-center text-base font-mono font-bold text-brand-primary bg-white border border-[#e3dcd3] focus:border-brand-primary py-1.5 px-3 rounded-lg focus:outline-none"
                  />
                </div>
                <p className="text-[10px] text-slate-400 text-center leading-normal">
                  Seleziona o digita il tag (es. <span className="bg-white border border-[#e3dcd3] px-1 font-mono text-brand-primary rounded font-bold text-[11px]">{activePlaceholder}</span>) presente sul tuo modello .AI
                </p>
              </div>

              {/* Clickable token list inside script tab */}
              <div className="pt-2">
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Usa colonna come segnaposto principale:</span>
                <div className="flex flex-wrap gap-1.5">
                  {columns.map((col) => {
                    const tokenText = `{{${col.label}}}`;
                    const isActive = activePlaceholder === tokenText;
                    return (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => setActivePlaceholder(tokenText)}
                        className={`py-1 px-2.5 rounded-lg text-[11px] font-bold transition duration-150 border cursor-pointer ${
                          isActive 
                            ? "bg-brand-secondary border-brand-secondary text-white"
                            : "bg-white border-[#e3dcd3] hover:border-brand-secondary text-slate-600 hover:text-brand-secondary"
                        }`}
                      >
                        {tokenText}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Explanation card for ExtendScript */}
            <div className="p-4 bg-white border border-[#e3dcd3] rounded-xl space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <span className="text-brand-primary">✨</span>
                <span>Come funziona l'unione automatica?</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                Lo script ExtendScript legge la selezione o tutti gli elementi del documento, trova le caselle di testo con il segnaposto, le ordina <strong>dall'alto in basso, da sinistra a destra</strong> e inserisce i record sequenzialmente. Non serve definire pacchetti XML di variabili!
              </p>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="jsx-actions-row">
              <button
                onClick={handleDownloadJSX}
                disabled={persone.length === 0}
                className="w-full flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primary-hover disabled:bg-slate-200 text-white font-bold py-3 px-4 rounded-xl text-xs transition duration-150 shadow-sm cursor-pointer disabled:cursor-not-allowed select-none active:scale-98"
              >
                <Download className="w-4 h-4" />
                <span>Scarica lo script</span>
              </button>

              <button
                onClick={handleCopyJSX}
                disabled={persone.length === 0}
                className="w-full flex items-center justify-center gap-2 border border-[#e3dcd3] bg-white hover:bg-[#fcf9f5] hover:border-brand-primary text-slate-700 hover:text-brand-primary font-bold py-3 px-4 rounded-xl text-xs transition duration-150 cursor-pointer disabled:cursor-not-allowed select-none active:scale-98"
              >
                {copiedJSX ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600 animate-ping" />
                    <span className="text-emerald-700">Script Copiato!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copia Codice Script</span>
                  </>
                )}
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
