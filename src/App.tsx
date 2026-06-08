import { useState, useEffect } from "react";
import { Persona, Column } from "./types";
import { 
  Sparkles, 
  FileSpreadsheet, 
  Send, 
  AlertOctagon, 
  Heart, 
  RefreshCw, 
  RotateCcw, 
  Download, 
  Mail, 
  Tag, 
  Coffee, 
  Grid
} from "lucide-react";
import UploadZone from "./components/UploadZone";
import DataTable from "./components/DataTable";
import ExportPanel from "./components/ExportPanel";
import IllustratorGuide from "./components/IllustratorGuide";

export default function App() {
  const [fileData, setFileData] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Columns state
  const [columns, setColumns] = useState<Column[]>([
    { id: "nome", label: "Nome" },
    { id: "cognome", label: "Cognome" },
    { id: "email", label: "Email" },
    { id: "telefono", label: "Telefono" },
    { id: "ruolo_o_note", label: "Ruolo / Note" }
  ]);
  
  // Table rows list state
  const [persone, setPersone] = useState<Persona[]>([]);

  // Configurator placeholder for the automated script target
  const [activePlaceholder, setActivePlaceholder] = useState("{{Nome}}");

  // Load the standard Wedding Partecipazioni Demo Data on first load to make app visual instantly
  useEffect(() => {
    caricaPreset("partecipazioni");
  }, []);

  // Preset data loader
  const caricaPreset = (type: "partecipazioni" | "menu" | "segnaposto" | "tableau") => {
    setError(null);
    if (type === "partecipazioni") {
      setColumns([
        { id: "nome", label: "Nome" },
        { id: "cognome", label: "Cognome" },
        { id: "tavolo", label: "Tavolo" },
        { id: "menu", label: "Menù" }
      ]);
      setPersone([
        { id: "p1", nome: "Giacomo", cognome: "Berti", tavolo: "Tavolo 1", menu: "Standard" },
        { id: "p2", nome: "Emanuele", cognome: "Pozzi", tavolo: "Tavolo 1", menu: "Vegano" },
        { id: "p3", nome: "Tommaso", cognome: "Ferri", tavolo: "Tavolo 2", menu: "Standard" },
        { id: "p4", nome: "Giulia", cognome: "Rossi", tavolo: "Tavolo 2", menu: "Celiaco" },
        { id: "p5", nome: "Sofia", cognome: "Bianchi", tavolo: "Tavolo 3", menu: "Standard" }
      ]);
      setFileName("esempio_partecipazioni_wedding.csv");
      setActivePlaceholder("{{Nome}}");
    } else if (type === "menu") {
      setColumns([
        { id: "giorno", label: "Giorno" },
        { id: "piatto", label: "Piatto Principale" },
        { id: "dessert", label: "Dessert" },
        { id: "vino", label: "Vino Abbinato" }
      ]);
      setPersone([
        { id: "m1", giorno: "Lunedì", piatto: "Risotto allo Zafferano", dessert: "Tiramisù Classico", vino: "Nebbiolo" },
        { id: "m2", giorno: "Martedì", piatto: "Filetto di Branzino", dessert: "Millefoglie ai Frutti di Bosco", vino: "Pinot Bianco" },
        { id: "m3", giorno: "Mercoledì", piatto: "Tortelli di Zucca", dessert: "Sfogliatella Napoletana", vino: "Valpolicella" }
      ]);
      setFileName("esempio_menu_ristorante.csv");
      setActivePlaceholder("{{Giorno}}");
    } else if (type === "segnaposto") {
      setColumns([
        { id: "nome", label: "Nome" },
        { id: "cognome", label: "Cognome" },
        { id: "ruolo_o_note", label: "Ruolo" }
      ]);
      setPersone([
        { id: "s1", nome: "Giacomo", cognome: "Berti", ruolo_o_note: "Invitato" },
        { id: "s2", nome: "Emanuele", cognome: "P.", ruolo_o_note: "Testimone" },
        { id: "s3", nome: "Tommaso", cognome: "F.", ruolo_o_note: "Sposo" },
        { id: "s4", nome: "Beatrice", cognome: "L.", ruolo_o_note: "Sposa" },
        { id: "s5", nome: "Alessandro", cognome: "G.", ruolo_o_note: "Damigella" }
      ]);
      setFileName("esempio_segnaposto_cena.csv");
      setActivePlaceholder("{{Nome}}");
    } else if (type === "tableau") {
      setColumns([
        { id: "tavolo", label: "Tavolo" },
        { id: "ospiti", label: "Membri Invitati" },
        { id: "posizione", label: "Posizione Sala" }
      ]);
      setPersone([
        { id: "t1", tavolo: "Tavolo Imperiale", ospiti: "Sposi e Genitori", posizione: "Centro Sala" },
        { id: "t2", tavolo: "Tavolo Prosecco", ospiti: "Amici dello Sposo", posizione: "Lato Destro" },
        { id: "t3", tavolo: "Tavolo Amarone", ospiti: "Colleghi Sposa", posizione: "Lato Sinistro" },
        { id: "t4", tavolo: "Tavolo Barbera", ospiti: "Parenti Sposo", posizione: "Terrazza Esterna" }
      ]);
      setFileName("esempio_tableau_sala.csv");
      setActivePlaceholder("{{Tavolo}}");
    }
  };

  // Schema guide CSV downloader for manual filling
  const handleDownloadGuidaCSV = () => {
    const separator = ";";
    const headerStr = columns.map(c => c.label).join(separator);
    const sampleRows = persone.map(p => columns.map(c => p[c.id] || "").join(separator)).join("\n");
    const fullContent = `${headerStr}\n${sampleRows}`;
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + fullContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "schema_guida_illustrator.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Upload callback: local parsing vs remote AI extraction
  const handleFileSelected = (content: string, mime: string, name: string, isRawText: boolean) => {
    setError(null);
    if (isRawText) {
      try {
        const lines = content.split(/\r?\n/).map(l => l.trim()).filter(l => l !== "");
        if (lines.length === 0) {
          setError("Il file selezionato appare vuoto.");
          return;
        }

        // Detect separator
        let separator: string = ",";
        if (lines[0].includes(";")) {
          separator = ";";
        } else if (lines[0].includes("\t")) {
          separator = "\t";
        }

        const rawHeaders = lines[0].split(separator).map(h => h.trim().replace(/^["']|["']$/g, ""));
        const newCols: Column[] = rawHeaders.map((headerText, index) => {
          let cleanId = headerText.toLowerCase().replace(/[^a-z0-9_]/g, "");
          if (!cleanId) cleanId = `col_${index}`;
          if (cleanId === "id") cleanId = "id_field";
          return {
            id: cleanId,
            label: headerText || `Campo ${index + 1}`
          };
        });

        const newRecords: Persona[] = lines.slice(1).map((line, rIndex) => {
          const values = line.split(separator).map(v => v.trim().replace(/^["']|["']$/g, ""));
          const record: Persona = {
            id: `row-${rIndex}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            nome: "",
            cognome: "",
            email: "",
            telefono: "",
            ruolo_o_note: ""
          };

          newCols.forEach((col, colIdx) => {
            const val = values[colIdx] || "";
            record[col.id] = val;
            
            const labelLower = col.label.toLowerCase();
            if (labelLower === "nome") record.nome = val;
            else if (labelLower === "cognome") record.cognome = val;
            else if (labelLower === "email" || labelLower === "e-mail" || labelLower === "mail") record.email = val;
            else if (labelLower === "telefono" || labelLower === "tel" || labelLower === "cell") record.telefono = val;
            else if (labelLower === "ruolo" || labelLower === "note") record.ruolo_o_note = val;
          });

          return record;
        });

        setColumns(newCols);
        setPersone(newRecords);
        setFileName(name);
        if (newCols.length > 0) {
          setActivePlaceholder(`{{${newCols[0].label}}}`);
        }
      } catch (err) {
        console.error("Local parsing failed:", err);
        setError("Impossibile analizzare il file CSV. Verificalo o prova come immagine/PDF con l'estrazione AI.");
      }
    } else {
      setFileData(content);
      setMimeType(mime);
      setFileName(name);
    }
  };

  const handleClearFile = () => {
    setFileData(null);
    setMimeType(null);
    setFileName(null);
  };

  // extraction using Gemini AI with structured schema representation
  const analizzaDocumento = async () => {
    if (!fileData || !mimeType) {
      setError("Seleziona prima un'immagine o un file PDF.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileData, mimeType, customPrompt }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Errore HTTP: ${response.status}`);
      }

      const parsed = await response.json();
      if (parsed && Array.isArray(parsed.persone)) {
        setColumns([
          { id: "nome", label: "Nome" },
          { id: "cognome", label: "Cognome" },
          { id: "email", label: "Email" },
          { id: "telefono", label: "Telefono" },
          { id: "ruolo_o_note", label: "Ruolo / Note" }
        ]);

        const mapped: Persona[] = parsed.persone.map((p: any, index: number) => ({
          id: `ai-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 4)}`,
          nome: p.nome || "",
          cognome: p.cognome || "",
          email: p.email || "",
          telefono: p.telefono || "",
          ruolo_o_note: p.ruolo_o_note || "",
        }));

        setPersone(mapped);
        setActivePlaceholder("{{Nome}}");
      } else {
        throw new Error("La risposta dell'IA non contiene l'elenco atteso.");
      }
    } catch (err: any) {
      console.error("AI extraction error:", err);
      setError(err.message || "Impossibile completare l'estrazione dati con l'AI. Riprova.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePersona = (id: string, updatedField: Partial<Persona>) => {
    setPersone((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedField } : p))
    );
  };

  const handleAddPersona = () => {
    const nuova: Persona = {
      id: `manual-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      nome: "",
      cognome: "",
      email: "",
      telefono: "",
      ruolo_o_note: "",
    };
    columns.forEach(col => {
      nuova[col.id] = "";
    });
    setPersone((prev) => [...prev, nuova]);
  };

  const handleRemovePersona = (id: string) => {
    setPersone((prev) => prev.filter((p) => p.id !== id));
  };

  const handleAddColumn = () => {
    const nameStr = window.prompt("Inserisci il nome del nuovo campo / colonna:", "Qualifica");
    if (!nameStr || !nameStr.trim()) return;
    
    const label = nameStr.trim();
    const cleanId = label.toLowerCase().replace(/[^a-z0-9_]/g, "_") + "_" + Math.random().toString(36).substr(2, 3);
    
    setColumns((prev) => [...prev, { id: cleanId, label }]);
  };

  const handleRemoveColumn = (id: string) => {
    if (window.confirm("Sei sicuro di voler eliminare questa colonna e tutti i suoi dati associati?")) {
      setColumns((prev) => prev.filter((c) => c.id !== id));
      setPersone((prev) => 
        prev.map((p) => {
          const clone = { ...p };
          delete clone[id];
          return clone;
        })
      );
    }
  };

  const handleUpdateColumnLabel = (id: string, newLabel: string) => {
    setColumns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, label: newLabel } : c))
    );
    const oldCol = columns.find(c => c.id === id);
    if (oldCol && activePlaceholder === `{{${oldCol.label}}}`) {
      setActivePlaceholder(`{{${newLabel}}}`);
    }
  };

  const handleClearAll = () => {
    if (window.confirm("Sei sicuro di voler svuotare tutta la tabella dei record attuali?")) {
      setPersone([]);
      setFileName(null);
      setFileData(null);
      setMimeType(null);
      setError(null);
    }
  };

  const handleFullReset = () => {
    if (window.confirm("Sei sicuro di voler ripristinare il programma allo stato iniziale?")) {
      setPersone([]);
      setFileName(null);
      setFileData(null);
      setMimeType(null);
      setError(null);
      setCustomPrompt("");
      setColumns([
        { id: "nome", label: "Nome" },
        { id: "cognome", label: "Cognome" },
        { id: "email", label: "Email" },
        { id: "telefono", label: "Telefono" },
        { id: "ruolo_o_note", label: "Ruolo / Note" }
      ]);
      setActivePlaceholder("{{Nome}}");
    }
  };

  // JSX Script generation helper passed to Export Panel
  const generateJSXCode = () => {
    const listRecords = persone.map(p => {
      const rowItem: any = {};
      columns.forEach(c => {
        rowItem[c.id] = p[c.id] !== undefined && p[c.id] !== null ? p[c.id] : "";
      });
      return rowItem;
    });

    const colsList = columns.map(c => ({ id: c.id, label: c.label }));
    const cleanRawPlaceholder = activePlaceholder.replace(/[{}]/g, "").trim();

    return `/**
 * ILLUSTRATOR SCRIPT PRO - SEVENTIAL VARIABLE MERGE AUTOMATION
 * Generato il: ${new Date().toLocaleDateString("it-IT")}
 * 
 * Istruzioni d'uso:
 * 1. Apri il tuo template grafico su Adobe Illustrator (.ai)
 * 2. Assicurati che una o più caselle contengano il segnaposto principale: "${activePlaceholder}"
 * 3. Seleziona le caselle che vuoi personalizzare (oppure non selezionare nulla per aggiornarle tutte nel documento)
 * 4. Vai su: File > Script > Altro script... e seleziona questo file .jsx scaricato.
 */

#target illustrator

function eseguiUnioneDatiSequenziale() {
  if (app.documents.length === 0) {
    alert("ERRORE: Nessun documento aperto in Adobe Illustrator! Apri un template prima di avviare lo script.");
    return;
  }

  var doc = app.activeDocument;
  var data = ${JSON.stringify(listRecords, null, 2)};
  var columns = ${JSON.stringify(colsList, null, 2)};
  var searchVariable = "${activePlaceholder}";
  var cleanVarName = "${cleanRawPlaceholder}";

  if (data.length === 0) {
    alert("ERRORE: Non ci sono dati all'interno di questo script. Compila la tabella nell'applicazione web.");
    return;
  }

  // Cerca ricorsivamente le caselle di testo
  var textFramesStruttura = [];
  function estraiTextFramesRecurse(items) {
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      if (item.typename === "TextFrame") {
        textFramesStruttura.push(item);
      } else if (item.typename === "GroupItem") {
        estraiTextFramesRecurse(item.pageItems);
      }
    }
  }

  // Opera sulla selezione se presente, altrimenti su tutti gli oggetti del documento
  if (doc.selection.length > 0) {
    estraiTextFramesRecurse(doc.selection);
  } else {
    estraiTextFramesRecurse(doc.pageItems);
  }

  if (textFramesStruttura.length === 0) {
    alert("Non ho trovato nessun oggetto di tipo Casella di Testo da poter unire.");
    return;
  }

  // Filtra solo quelle contenenti il segnaposto principale (es. {{Nome}})
  var validTargets = [];
  for (var k = 0; k < textFramesStruttura.length; k++) {
    var tfObj = textFramesStruttura[k];
    if (tfObj.contents.indexOf(searchVariable) !== -1 || tfObj.contents.indexOf("{" + cleanVarName + "}") !== -1) {
      validTargets.push(tfObj);
    }
  }

  if (validTargets.length === 0) {
    alert("Nessuna casella di testo contiene il segnaposto da cercare: " + searchVariable + "\\n\\nVerifica l'esatta corrispondenza sul template di Illustrator (comprese le parentesi parentesi graffe d'apertura e chiusura).");
    return;
  }

  // ORDINAMENTO GEOMETRICO (dall'alto in basso, da sinistra a destra)
  // Illustrator ha le coordinate Y basate su righello cartesiano (Y cresce verso l'alto).
  // Coordiniamo con tolleranza di 15pt per catturare la stessa riga logica.
  validTargets.sort(function(a, b) {
    var diffY = b.top - a.top; 
    if (Math.abs(diffY) > 15) {
      return diffY; // Righe superiori prima (Y decrescente)
    }
    return a.left - b.left; // Da sinistra a destra (X crescente)
  });

  // Esegue l'unione dei dati cella per cella
  var recordSostituitiCount = 0;
  for (var index = 0; index < validTargets.length; index++) {
    if (index >= data.length) {
      break; // Non ci sono più record a disposizione
    }
    
    var targetFrame = validTargets[index];
    var currentRecord = data[index];
    var stringContent = targetFrame.contents;

    // Sostituisce i segnaposti di ogni singola colonna nel testo di questa casella
    for (var cIdx = 0; cIdx < columns.length; cIdx++) {
      var colObject = columns[cIdx];
      var rawReplacementValue = currentRecord[colObject.id];
      var replacementValue = (rawReplacementValue !== undefined && rawReplacementValue !== null) ? String(rawReplacementValue) : "";

      // Supporta svariate notazioni popolari per massima flessibilità
      var patternsToReplace = [
        "{{" + colObject.label + "}}",
        "{{" + colObject.id + "}}",
        "{{" + colObject.label.toLowerCase() + "}}",
        "{{" + colObject.label.toUpperCase() + "}}",
        "{" + colObject.label + "}",
        "{" + colObject.id + "}"
      ];

      for (var p = 0; p < patternsToReplace.length; p++) {
        var pattern = patternsToReplace[p];
        while (stringContent.indexOf(pattern) !== -1) {
          stringContent = stringContent.replace(pattern, replacementValue);
        }
      }
    }

    targetFrame.contents = stringContent;
    recordSostituitiCount++;
  }

  alert("COMPLETATO CON SUCCESSO!\\n\\n• Caselle di testo personalizzate: " + recordSostituitiCount + "\\n• Record applicati: " + Math.min(recordSostituitiCount, data.length) + " di " + data.length + " totali.");
}

eseguiUnioneDatiSequenziale();`;
  };

  return (
    <div className="min-h-screen bg-bg-warm flex flex-col font-sans antialiased text-[#3f3a36]" id="app-royal-root">
      
      {/* Top Main Banner Header */}
      <header className="bg-white border-b border-[#e3dcd3] py-4 px-6 md:px-12 shrink-0 select-none shadow-2xs" id="top-navbar-main">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center shrink-0 shadow-sm text-white relative overflow-visible">
              <span className="font-sans text-sm font-black tracking-tight">AI</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-300 absolute -top-1 -right-1 fill-amber-300" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-800 tracking-wider font-sans uppercase flex items-center gap-1.5 leading-none">
                ILLUSTRATOR SCRIPT <span className="text-brand-primary font-bold text-xs uppercase bg-brand-primary/10 px-1.5 py-0.5 rounded">PRO</span>
              </h1>
              <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mt-1">
                AUTOMAZIONE & UNIONE DATI
              </p>
            </div>
          </div>
          
          {/* Quick Upper Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleFullReset}
              className="py-1.5 px-4 bg-white border border-[#e3dcd3] hover:border-slate-300 text-slate-500 hover:text-slate-800 text-2xs font-extrabold tracking-wider rounded-md transition duration-150 uppercase flex items-center gap-1 cursor-pointer"
              title="Resetta l'applicazione allo stato iniziale"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Azzera Tutto</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Workspace */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 py-6 md:px-8 space-y-6" id="workspace-container">
        
        {/* Core Bento Grid Configurator layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="bento-configuration-grid">
          
          {/* Left Block (col-span-7) for loading, defining, editing, verifying */}
          <div className="lg:col-span-7 flex flex-col space-y-6" id="configurator-input-side">
            
            {/* Card 1: Dati Automazione */}
            <div className="bg-white border border-[#e3dcd3] rounded-[20px] p-5 md:p-6 shadow-2xs space-y-6" id="card-dati-automazione">
              
              {/* Card Header Tag & Label */}
              <div className="flex items-center justify-between pb-4 border-b border-[#f3efea]" id="card-dati-header">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">1. Dati Automazione</h2>
                    <p className="text-[10px] text-slate-400 font-medium">Carica la tua sorgente o seleziona un preset consigliato</p>
                  </div>
                </div>
                <div className="bg-[#fcf9f5] border border-[#e3dcd3] rounded-md px-2.5 py-1 text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                  {persone.length} record
                </div>
              </div>

              {/* Preset buttons layout with elegant rounded icons */}
              <div className="space-y-2.5" id="preset-rack-container">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Preset Raccomandati</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5" id="presets-grid-row">
                  <button
                    type="button"
                    onClick={() => caricaPreset("partecipazioni")}
                    className="py-2 px-3 bg-white hover:bg-brand-secondary/5 border border-[#e3dcd3] hover:border-brand-secondary rounded-xl flex items-center gap-2 transition duration-200 text-left cursor-pointer group"
                  >
                    <div className="w-6 h-6 bg-slate-50 group-hover:bg-brand-secondary/10 rounded-full flex items-center justify-center shrink-0 transition text-slate-500 group-hover:text-brand-secondary">
                      <Mail className="w-3 h-3" />
                    </div>
                    <span className="text-2xs font-extrabold text-slate-700 uppercase tracking-tight truncate">Partecipazioni</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => caricaPreset("menu")}
                    className="py-2 px-3 bg-white hover:bg-brand-secondary/5 border border-[#e3dcd3] hover:border-brand-secondary rounded-xl flex items-center gap-2 transition duration-200 text-left cursor-pointer group"
                  >
                    <div className="w-6 h-6 bg-slate-50 group-hover:bg-brand-secondary/10 rounded-full flex items-center justify-center shrink-0 transition text-slate-500 group-hover:text-brand-secondary">
                      <Coffee className="w-3 h-3" />
                    </div>
                    <span className="text-2xs font-extrabold text-slate-700 uppercase tracking-tight truncate">Menu Ristoranti</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => caricaPreset("segnaposto")}
                    className="py-2 px-3 bg-white hover:bg-brand-secondary/5 border border-[#e3dcd3] hover:border-brand-secondary rounded-xl flex items-center gap-2 transition duration-200 text-left cursor-pointer group"
                  >
                    <div className="w-6 h-6 bg-slate-50 group-hover:bg-brand-secondary/10 rounded-full flex items-center justify-center shrink-0 transition text-slate-500 group-hover:text-brand-secondary">
                      <Tag className="w-3 h-3" />
                    </div>
                    <span className="text-2xs font-extrabold text-slate-700 uppercase tracking-tight truncate">Segnaposto</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => caricaPreset("tableau")}
                    className="py-2 px-3 bg-white hover:bg-brand-secondary/5 border border-[#e3dcd3] hover:border-brand-secondary rounded-xl flex items-center gap-2 transition duration-200 text-left cursor-pointer group"
                  >
                    <div className="w-6 h-6 bg-slate-50 group-hover:bg-brand-secondary/10 rounded-full flex items-center justify-center shrink-0 transition text-slate-500 group-hover:text-brand-secondary">
                      <Grid className="w-3 h-3" />
                    </div>
                    <span className="text-2xs font-extrabold text-slate-700 uppercase tracking-tight truncate">Tableau</span>
                  </button>
                </div>
              </div>

              {/* Excel guidelines download box */}
              <div className="p-3 bg-[#fdfdfc] border border-[#e3dcd3] border-dashed rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs" id="excel-guideline-alert">
                <span className="text-[11px] text-slate-500 leading-normal text-center sm:text-left">
                  Hai già un foglio Excel da compilare? Scarica lo schema prefincato come csv.
                </span>
                <button
                  onClick={handleDownloadGuidaCSV}
                  className="py-1 px-3 border border-brand-secondary/30 hover:bg-brand-secondary/5 hover:border-brand-secondary text-brand-secondary text-[10px] font-extrabold tracking-wider uppercase rounded-lg transition duration-200 shrink-0 cursor-pointer"
                >
                  Scarica Modello CSV
                </button>
              </div>

              {/* File input Upload Zone */}
              <UploadZone
                onFileSelected={handleFileSelected}
                isLoading={isLoading}
                onClear={handleClearFile}
                fileName={fileName}
              />

              {/* Gemini AI extraction configuration prompt (Shown only if a Base64 file e.g. PDF/Image is waiting) */}
              {fileData && (
                <div className="bg-[#fbfaf7] border border-[#e3dcd3] py-4 px-5 rounded-xl space-y-4" id="ai-extract-prompt-row">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wide">
                    <Sparkles className="w-4 h-4 text-brand-primary animate-bounce" />
                    <span>Configura Estrazione AI con Gemini</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Hai caricato un documento! L'AI di Gemini estrarrà e strutturerà tutti i contatti in righe e colonne per te. Inserisci indicazioni speciali se vuoi escludere righe o ritarare il formato.
                  </p>
                  
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="es. Filtra escludendo le intestazioni decorative, ordina per cognome..."
                    disabled={isLoading}
                    className="w-full text-xs p-3 bg-white border border-[#e3dcd3] focus:border-brand-primary rounded-lg h-20 resize-none focus:outline-none transition-colors"
                  />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <div className="flex flex-wrap gap-1">
                      <button
                        type="button"
                        onClick={() => setCustomPrompt("Ordina in ordine alfabetico per cognome.")}
                        className="bg-white hover:bg-slate-50 border border-[#e3dcd3] text-slate-600 text-[10px] px-2 py-1 rounded transition font-medium"
                      >
                        Ordina per Cognome
                      </button>
                      <button
                        type="button"
                        onClick={() => setCustomPrompt("Ignora chiunque non contenga recapito email.")}
                        className="bg-white hover:bg-slate-50 border border-[#e3dcd3] text-slate-600 text-[10px] px-2 py-1 rounded transition font-medium"
                      >
                        Ignora senza Email
                      </button>
                    </div>

                    <button
                      onClick={analizzaDocumento}
                      disabled={isLoading}
                      className="flex items-center justify-center gap-1.5 py-1.5 px-4 bg-brand-primary hover:bg-brand-primary-hover disabled:bg-slate-200 text-white text-xs font-bold uppercase rounded-lg transition shadow-xs cursor-pointer"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>Lettura in corso...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3 h-3" />
                          <span>Estrai con AI</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Render dynamic DataTable right here inside the first section */}
              <div className="pt-2" id="card-table-integrated">
                <DataTable
                  persone={persone}
                  columns={columns}
                  onUpdatePersona={handleUpdatePersona}
                  onAddPersona={handleAddPersona}
                  onRemovePersona={handleRemovePersona}
                  onClearAll={handleClearAll}
                  onAddColumn={handleAddColumn}
                  onRemoveColumn={handleRemoveColumn}
                  onUpdateColumnLabel={handleUpdateColumnLabel}
                />
              </div>

            </div>

            {/* Error alerts banner */}
            {error && (
              <div className="flex items-start gap-3 bg-rose-50 border border-rose-200 p-4 rounded-xl text-xs text-rose-800 shadow-xs" id="quick-error-alert">
                <AlertOctagon className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold uppercase tracking-wide">Errore di elaborazione</p>
                  <p className="leading-relaxed">{error}</p>
                </div>
              </div>
            )}

          </div>

          {/* Right Block (col-span-5) for placeholder selector & generator triggers */}
          <div className="lg:col-span-5 flex flex-col space-y-6" id="generator-output-side">
            
            {/* EXPORT OPTIONS PANEL */}
            <ExportPanel
              persone={persone}
              columns={columns}
              activePlaceholder={activePlaceholder}
              setActivePlaceholder={setActivePlaceholder}
              jsxCodeGenerator={generateJSXCode}
            />

            {/* ILLUSTRATOR STEP-BY-STEP GUIDE */}
            <IllustratorGuide />

          </div>

        </div>

      </main>

      {/* Styled Footer */}
      <footer className="bg-white border-t border-[#e3dcd3] py-6 text-center text-xs select-none mt-12 shrink-0 shadow-2xs" id="footer-copyright-main">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-slate-400">
          <span className="font-bold uppercase tracking-wider text-slate-500 text-[10px]">ILLUSTRATOR SCRIPT PRO © All Rights Reserved.</span>
          <span className="hidden sm:inline text-slate-300">•</span>
          <span className="flex items-center gap-1">
            Semplificando il flusso di lavoro dei grafici professionisti <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 shrink-0" />
          </span>
        </div>
      </footer>

    </div>
  );
}
