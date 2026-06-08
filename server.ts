import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

// Check for API key and log status (safely, without exposing the key)
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("ATTENZIONE: GEMINI_API_KEY non configurata! Le chiamate API falliranno.");
} else {
  console.log("GEMINI_API_KEY rilevata con successo.");
}

// Initialize Gemini client lazily to conform to startup crash protection guidelines
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("La chiave API GEMINI_API_KEY non è configurata nelle impostazioni.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload limits to support base64 encoded PDFs and images
  app.use(express.json({ limit: "15mb" }));
  app.use(express.urlencoded({ limit: "15mb", extended: true }));

  // API Endpoint - Extract names from PDF or Image
  app.post("/api/extract", async (req, res) => {
    try {
      const { fileData, mimeType, customPrompt } = req.body;

      if (!fileData || !mimeType) {
        return res.status(400).json({ error: "Dati del file o MimeType mancanti." });
      }

      const client = getGeminiClient();

      // Configure prompt
      let prompt = `Analizza questo documento (immagine o PDF) ed estrai la lista completa di persone.
Cerca di identificare per ciascuna persona:
- Nome (First Name, es. Mario)
- Cognome (Last Name / Surname, es. Rossi)
- Email (se presente, altrimenti null o stringa vuota)
- Telefono (se presente, altrimenti null o stringa vuota)
- Ruolo o Note (l'azienda, titolo, classe scolastica, ruolo, o qualunque informazione utile indicata nel documento, altrimenti null o stringa vuota)

Regole di estrazione e pulizia importantissime:
1. Dividi accuratamente Nome e Cognome anche se sono scritti insieme in un'unica colonna (es. "Rossi Mario" o "Mario Rossi" -> Nome: "Mario", Cognome: "Rossi").
2. Correggi le maiuscole e minuscole in modo che i nomi siano scritti in modo elegante e professionale (es. "mario rossi" o "MARIO ROSSI" -> Nome: "Mario", Cognome: "Rossi").
3. Riconosci correttamente i caratteri speciali e gli accenti, correggendoli se ci sono evidenti errori di lettura ottica (OCR).
4. Se una riga non contiene una persona reale o è un'intestazione di tabella, ignorala. Estrai solo persone reali.
5. Se non è presente il cognome (es. solo "Giulia"), inserisci il nome e lascia il cognome vuoto o null.
`;

      if (customPrompt && customPrompt.trim()) {
        prompt += `\nIstruzioni aggiuntive dell'utente:\n${customPrompt}\n`;
      }

      console.log(`Chiamata a Gemini per estrazione dati. MimeType: ${mimeType}, Lunghezza dati: ${fileData.length} caratteri.`);

      // Setup structured JSON response schema
      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          persone: {
            type: Type.ARRAY,
            description: "Lista di persone estratte dal documento.",
            items: {
              type: Type.OBJECT,
              properties: {
                nome: { type: Type.STRING, description: "Nome proprio della persona, formattato correttamente (es. 'Alessandro')." },
                cognome: { type: Type.STRING, description: "Cognome della persona, formattato correttamente (es. 'Verdi')." },
                email: { type: Type.STRING, description: "Email se disponibile nel documento, altrimenti null." },
                telefono: { type: Type.STRING, description: "Telefono o contatto se disponibile nel documento, altrimenti null." },
                ruolo_o_note: { type: Type.STRING, description: "Ruolo, azienda, classe scolastica, titolo o note specifiche sul soggetto, altrimenti null." }
              },
              required: ["nome", "cognome"]
            }
          }
        },
        required: ["persone"]
      };

      // Call Gemini 3.5 Flash (ideal for structured table extraction tasks) with exponential backoff retries to handle transient 503/saturation errors
      let response;
      const maxAttempts = 4;
      let delay = 1500; // start with 1.5s delay

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          console.log(`Tentativo di generazione contenuto ${attempt}/${maxAttempts}...`);
          response = await client.models.generateContent({
            model: "gemini-3.5-flash",
            contents: [
              {
                inlineData: {
                  mimeType: mimeType,
                  data: fileData,
                }
              },
              prompt
            ],
            config: {
              responseMimeType: "application/json",
              responseSchema: responseSchema,
              temperature: 0.1, // low temperature for precise extraction
            },
          });
          // If successful, break out of the retry loop
          break;
        } catch (apiError: any) {
          const errorMsg = (apiError.message || "").toLowerCase();
          const isRateLimitOrSat = errorMsg.includes("503") || errorMsg.includes("unavailable") || errorMsg.includes("high demand") || errorMsg.includes("429") || errorMsg.includes("rate limit");
          
          console.error(`Tentativo ${attempt} fallito. Errore:`, apiError.message || apiError);

          if (isRateLimitOrSat && attempt < maxAttempts) {
            console.log(`Rilevato sovraccarico o temporanea indisponibilità. Attendo ${delay}ms prima del prossimo tentativo...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
            delay *= 2; // exponential backoff
          } else {
            // Throw if it is a non-temporary error or we're out of attempts
            throw apiError;
          }
        }
      }

      if (!response) {
        throw new Error("Impossibile contattare l'intelligenza artificiale dopo molteplici tentativi. Riprova tra poco.");
      }

      const text = response.text;
      if (!text) {
        throw new Error("Nessuna risposta ricevuta da Gemini.");
      }

      // Parse and return JSON
      const parsedData = JSON.parse(text.trim());
      return res.json(parsedData);

    } catch (error: any) {
      console.error("Errore durante l'estrazione dati:", error);
      return res.status(500).json({
        error: error.message || "Si è verificato un errore durante l'estrazione con l'intelligenza artificiale."
      });
    }
  });

  // Serve static assets in production, hook up Vite server in development
  if (process.env.NODE_ENV !== "production") {
    console.log("Avvio in modalità Sviluppo (Vite Middleware)...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Avvio in modalità Produzione (Static Files)...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server web pronto su http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Inizializzazione del server fallita:", err);
});
