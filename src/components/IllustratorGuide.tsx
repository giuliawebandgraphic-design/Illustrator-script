import { useState } from "react";
import { 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  HelpCircle, 
  ExternalLink,
  Layers,
  CheckCircle2,
  FileSpreadsheet,
  AlertCircle
} from "lucide-react";

export default function IllustratorGuide() {
  const [activeStep, setActiveStep] = useState<number | null>(0);

  const steps = [
    {
      title: "1. Crea il segnaposto su Adobe Illustrator",
      icon: <Layers className="w-4 h-4 text-brand-primary" />,
      content: (
        <div className="space-y-2">
          <p className="leading-relaxed">
            Apri il tuo file grafico di Illustrator (partecipazione, menù, badge, etc.). Crea una normale casella di testo nel punto in cui deve comparire il dato variabile e digita il nome del campo racchiuso tra parentesi graffe per creare un segnaposto coerente.
          </p>
          <div className="bg-[#fcf9f5] border border-[#e3dcd3] p-2.5 rounded-lg font-mono text-2xs text-brand-primary flex items-center justify-between">
            <span>Sorgente sul modello: <strong>{"{{Nome}}"} {"{{Cognome}}"}</strong></span>
            <span className="text-[10px] text-slate-400 font-sans">Esempio</span>
          </div>
          <p className="text-[11px] text-slate-400">
            * Nota: Puoi inserire qualsiasi campo presente nel tuo CSV (es: {"{{Tavolo}}"}, {"{{Ruolo}}"}, etc.) e lo script o la stampa unione lo rileverà e lo riempirà.
          </p>
        </div>
      )
    },
    {
      title: "2. Metodo A: Stampa Unione Nativa (Data Merge)",
      icon: <FileSpreadsheet className="w-4 h-4 text-emerald-600" />,
      content: (
        <div className="space-y-2 leading-relaxed">
          <p>
            Questo è il metodo nativo integrato in Adobe Illustrator per unire un record alla volta o creare griglie ripetute:
          </p>
          <ol className="list-decimal pl-4 space-y-1.5 text-xs text-slate-600">
            <li>Scarica il file <strong>CSV</strong> configurato dall'applicazione.</li>
            <li>In Illustrator, apri il pannello <strong>Variabili</strong> andando su: <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px] font-mono text-slate-800">Finestra &gt; Variabili</code>.</li>
            <li>Nel pannello Variabili, fai clic sul pulsante del menu (in alto a destra) e seleziona <strong>Carica libreria di variabili...</strong>.</li>
            <li>Scegli il file CSV scaricato dal nostro software.</li>
            <li>Illustrator caricherà i campi della tabella. Ora seleziona la tua casella di testo sul modello, clicca sul nome della variabile corrispondente nel pannello e fai clic sul pulsante **Collega testo** (icona catena).</li>
            <li>Puoi scorrere i vari record o esportarli in blocco usando la funzione nativa di unione!</li>
          </ol>
        </div>
      )
    },
    {
      title: "3. Metodo B: ExtendScript .JSX Sequenziale (Automatico)",
      icon: <BookOpen className="w-4 h-4 text-amber-600" />,
      content: (
        <div className="space-y-2 leading-relaxed">
          <p>
            Questo metodo automatico non richiede la configurazione manuale delle variabili. Sostituisce i dati sequenzialmente in base all'ordine di lettura naturale (dall'alto in basso, da sinistra a destra):
          </p>
          <ol className="list-decimal pl-4 space-y-1.5 text-xs text-slate-600">
            <li>Scarica lo script <strong>.JSX</strong> dall'applicazione.</li>
            <li>Su Illustrator, apri il tuo modello grafico e assicurati che le caselle di testo contengano il segnaposto (es. <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px] font-mono text-slate-800">{"{{Nome}}"}</code>).</li>
            <li>Seleziona le caselle che desideri unire (oppure deseleziona tutto per applicarlo a tutte le caselle corrispondenti nel foglio).</li>
            <li>Fai clic su: <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px] font-mono text-slate-800">File &gt; Script &gt; Altro script...</code>.</li>
            <li>Seleziona il file <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px] font-mono text-slate-800">.jsx</code> scaricato. Lo script compilerà all'istante le caselle ordinandole geometricamente!</li>
          </ol>
        </div>
      )
    },
    {
      title: "Consigli Utili per Evitare Errori Comuni",
      icon: <HelpCircle className="w-4 h-4 text-purple-600" />,
      content: (
        <div className="space-y-2 leading-relaxed text-xs text-slate-600">
          <div className="flex gap-2 p-2 bg-amber-50 text-amber-800 rounded-lg text-[11px] border border-amber-100">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              <strong>Lettere Accentate:</strong> Illustrator soffre di bug cronici con lettere accentate e caratteri speciali non UTF-8. Usa l'opzione <strong>"Risolvi lettere accentate"</strong> presente nel pannello opzioni per rimpiazzare automaticamente vocali accentate con apostrofi normali!
            </p>
          </div>
          <div className="flex gap-2 p-2 bg-blue-50 text-blue-800 rounded-lg text-[11px] border border-blue-100">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p>
              <strong>Aggiornamenti in tempo reale:</strong> Puoi modificare in qualsiasi istante i nomi degli invitati o aggiungere colonne personalizzate (come "Celiaco", "Intolleranze") nell'applicazione: lo script si rigenererà all'istante includendo i nuovi dati.
            </p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="bg-white border border-[#e3dcd3] rounded-[20px] p-5 md:p-6 shadow-2xs space-y-4" id="illustrator-guide-container">
      
      <div className="flex items-center gap-2 pb-3 border-b border-[#f3efea]" id="guide-header">
        <HelpCircle className="w-5 h-5 text-brand-primary" />
        <div>
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest leading-none">Guida Rapida all'Unione Dati</h3>
          <p className="text-[10px] text-slate-400 font-medium tracking-wide mt-1">Come impostare il file grafico e completare il lavoro</p>
        </div>
      </div>

      <div className="space-y-2" id="accordion-steps-wrapper">
        {steps.map((step, idx) => {
          const isOpen = activeStep === idx;
          return (
            <div 
              key={idx} 
              className="border border-[#e3dcd3] rounded-xl overflow-hidden transition duration-150"
            >
              <button
                type="button"
                onClick={() => setActiveStep(isOpen ? null : idx)}
                className="w-full flex items-center justify-between p-3.5 bg-[#fbfaf7] hover:bg-[#f3efea]/30 transition-colors text-left font-bold text-slate-700 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  {step.icon}
                  <span>{step.title}</span>
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {isOpen && (
                <div className="p-4 bg-white border-t border-[#e3dcd3] text-xs text-slate-650 leading-relaxed space-y-2">
                  {step.content}
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
