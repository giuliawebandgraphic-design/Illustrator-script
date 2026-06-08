import { useState, ChangeEvent } from "react";
import { Persona, Column } from "../types";
import { Trash2, Plus, Search, Edit2, Columns, Settings, AlertCircle, ArrowRight } from "lucide-react";

interface DataTableProps {
  persone: Persona[];
  columns: Column[];
  onUpdatePersona: (id: string, updatedField: Partial<Persona>) => void;
  onAddPersona: () => void;
  onRemovePersona: (id: string) => void;
  onClearAll: () => void;
  onAddColumn: () => void;
  onRemoveColumn: (columnId: string) => void;
  onUpdateColumnLabel: (columnId: string, newLabel: string) => void;
}

export default function DataTable({
  persone,
  columns,
  onUpdatePersona,
  onAddPersona,
  onRemovePersona,
  onClearAll,
  onAddColumn,
  onRemoveColumn,
  onUpdateColumnLabel,
}: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeEditingCol, setActiveEditingCol] = useState<string | null>(null);

  const handleCellChange = (id: string, field: string, value: string) => {
    onUpdatePersona(id, { [field]: value });
  };

  const filteredPersone = persone.filter((p) => {
    const term = searchTerm.toLowerCase();
    if (!term) return true;
    
    return columns.some((col) => {
      const val = p[col.id] || "";
      return String(val).toLowerCase().includes(term);
    });
  });

  return (
    <div className="bg-white border border-[#e3dcd3] rounded-2xl overflow-hidden shadow-xs flex flex-col mt-4" id="data-table-container">
      {/* Table Header Controls */}
      <div className="p-4 bg-[#fbfaf7] border-b border-[#e3dcd3] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="bg-brand-secondary/10 text-brand-secondary px-2.5 py-1 rounded-md text-xs font-bold font-mono">
            {persone.length} RECORD
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Record Inseriti</h3>
            <p className="text-[11px] text-slate-500">Clicca direttamente su qualsiasi cella o intestazione per modificarla</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          {/* Search Box */}
          <div className="relative w-full sm:w-44">
            <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none">
              <Search className="w-3.5 h-3.5 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="Cerca..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-[#e3dcd3] rounded-lg text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-primary/40 focus:border-brand-primary transition-all"
            />
          </div>

          {/* Action Buttons */}
          <button
            onClick={onAddColumn}
            className="flex items-center gap-1 px-3 py-1.5 border border-[#e3dcd3] hover:border-brand-secondary hover:bg-brand-secondary/5 text-slate-600 hover:text-brand-secondary rounded-lg text-xs font-bold transition shrink-0 cursor-pointer"
            title="Aggiungi una nuova colonna personalizzata"
          >
            <Plus className="w-3 h-3" />
            <span>+ Colonna</span>
          </button>

          <button
            onClick={onAddPersona}
            className="flex items-center gap-1 px-3 py-1.5 bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white rounded-lg text-xs font-bold transition shrink-0 cursor-pointer"
            title="Aggiungi una nuova riga vuota"
          >
            <Plus className="w-3 h-3" />
            <span>+ Nuovo Riga</span>
          </button>
        </div>
      </div>

      {/* Spreadsheet Grid */}
      <div className="overflow-x-auto w-full">
        {filteredPersone.length > 0 ? (
          <table className="w-full text-left border-collapse table-fixed min-w-[700px]">
            <thead>
              <tr className="bg-[#fbfaf7] border-b border-[#e3dcd3] font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none">
                <th className="py-2 px-2.5 w-[50px] text-center border-b border-[#e3dcd3]">#</th>
                {columns.map((col) => (
                  <th key={col.id} className="py-2.5 px-3 border-b border-[#e3dcd3] group relative hover:bg-[#f3efea] transition-colors">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex-1 min-w-0">
                        {activeEditingCol === col.id ? (
                          <input
                            type="text"
                            value={col.label}
                            autoFocus
                            onBlur={() => setActiveEditingCol(null)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") setActiveEditingCol(null);
                            }}
                            onChange={(e) => onUpdateColumnLabel(col.id, e.target.value)}
                            className="w-full bg-white border border-brand-primary rounded px-1 py-0.5 text-xs font-bold text-slate-800 uppercase focus:outline-none focus:ring-1 focus:ring-brand-primary"
                          />
                        ) : (
                          <span
                            onClick={() => setActiveEditingCol(col.id)}
                            className="cursor-pointer block text-slate-700 font-bold uppercase truncate border-b border-dashed border-transparent hover:border-slate-400"
                            title="Doppio clicca o tocca per rinominare"
                          >
                            {col.label}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center shrink-0 ml-1">
                        <button
                          onClick={() => setActiveEditingCol(col.id)}
                          className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-brand-primary transition-opacity cursor-pointer"
                          title="Rinomina questa colonna"
                        >
                          <Edit2 className="w-2.5 h-2.5" />
                        </button>

                        {/* Deny deleting essential columns (nome / cognome) */}
                        {col.id !== "nome" && col.id !== "cognome" && col.id !== "email" && (
                          <button
                            onClick={() => onRemoveColumn(col.id)}
                            className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-rose-600 transition-opacity ml-0.5"
                            title="Elimina questa colonna"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </th>
                ))}
                <th className="py-2 px-2 w-[60px] text-center border-b border-[#e3dcd3]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredPersone.map((p, index) => (
                <tr key={p.id} className="hover:bg-[#faf9f6]/90 transition-colors group">
                  <td className="py-1 px-2.5 text-center text-slate-400 font-mono font-medium text-[11px] select-none border-r border-[#e3dcd3]/30">
                    {index + 1}
                  </td>
                  
                  {columns.map((col) => (
                    <td key={col.id} className="py-1 px-2 border-r border-[#e3dcd3]/30 focus-within:bg-brand-primary/5 transition-colors">
                      <input
                        type="text"
                        value={p[col.id] !== undefined && p[col.id] !== null ? p[col.id] : ""}
                        onChange={(e) => handleCellChange(p.id, col.id, e.target.value)}
                        placeholder="..."
                        className="w-full bg-transparent border-0 focus:outline-none py-1.5 px-1 font-medium text-slate-800 text-[12px] placeholder-slate-300"
                      />
                    </td>
                  ))}

                  <td className="py-1 px-2 text-center">
                    <button
                      onClick={() => onRemovePersona(p.id)}
                      className="p-1 px-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-md transition duration-100 opacity-20 group-hover:opacity-100"
                      title="Elimina riga"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12 px-4 flex flex-col items-center justify-center space-y-3 bg-[#fdfdfc]" id="empty-table-view">
            <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center">
              <Settings className="w-5 h-5 text-slate-300 animate-spin" style={{ animationDuration: "12s" }} />
            </div>
            <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Nessun dato presente</p>
            <p className="text-xs text-slate-400 max-w-sm">
              {searchTerm 
                ? "Nessun record corrisponde ai criteri di ricerca impostati." 
                : "Usa uno dei Preset raccomandati in alto o trascina un file per iniziare."
              }
            </p>
          </div>
        )}
      </div>

      <div className="p-3 bg-[#fbfaf7] border-t border-[#e3dcd3] text-[10px] text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-1">
        <span>* Doppio clic su una cella di testata per rinominare il campo nel segnaposto corrispondente.</span>
        <span>Visualizzati {filteredPersone.length} di {persone.length} record complessivi</span>
      </div>
    </div>
  );
}
