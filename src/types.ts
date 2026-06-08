export interface Persona {
  id: string; // Unico sul client per gestire le chiavi React e operazioni di editing/rimozione
  nome: string;
  cognome: string;
  email: string | null;
  telefono: string | null;
  ruolo_o_note: string | null;
  [key: string]: any; // Abilita l'indicizzazione per colonne dinamiche
}

export interface Column {
  id: string;
  label: string;
}

export type SeparatoreCSV = "," | ";" | "\t";

export interface ConfigEsportazione {
  separatore: SeparatoreCSV;
  includiIntestazione: boolean;
  mappaCampi: {
    nome: string;
    cognome: string;
    email: string;
    telefono: string;
    ruolo_o_note: string;
  };
}

