import type { IngredientAnalysis } from '../types';
import { analyzeIngredientText as fallbackAnalyze } from './ingredientAnalyzer';

export interface LocalLLMConfig {
  endpoint: string; // e.g. http://localhost:11434
  model: string;    // e.g. llama3, mistral, gemma2, qwen2.5
  enabled: boolean;
}

export const DEFAULT_LOCAL_LLM_CONFIG: LocalLLMConfig = {
  endpoint: 'http://localhost:11434',
  model: 'llama3',
  enabled: false
};

// Check if local LLM service (Ollama or compatible) is reachable
export async function testLocalLLMConnection(config: LocalLLMConfig): Promise<{ success: boolean; models?: string[]; error?: string }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(`${config.endpoint.replace(/\/$/, '')}/api/tags`, {
      method: 'GET',
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const modelNames = data.models ? data.models.map((m: any) => m.name) : [];
      return { success: true, models: modelNames };
    } else {
      return { success: false, error: `Local LLM server responded with HTTP ${res.status}` };
    }
  } catch (err: any) {
    return { 
      success: false, 
      error: 'Cannot reach Ollama at ' + config.endpoint + '. Make sure Ollama is running (`ollama serve`).' 
    };
  }
}

// Prompt Ollama to perform structured ingredient safety analysis
export async function analyzeIngredientsWithLocalLLM(
  text: string, 
  category: string, 
  config: LocalLLMConfig
): Promise<IngredientAnalysis[]> {
  // If not enabled or empty, fallback immediately
  if (!config.enabled || !text.trim()) {
    return fallbackAnalyze(text);
  }

  const systemPrompt = `You are an expert toxicologist, nutrition scientist, and cosmetic safety analyst for SafeScan India.
Analyze the following ingredients for a "${category}" product.
Evaluate against FSSAI, ICMR-NIN 2024, BIS IS:4707, and WHO safety standards.

You MUST respond strictly with a valid JSON array of objects with this schema:
[
  {
    "name": "ingredient name",
    "risk": "green" | "amber" | "red",
    "concernType": "Nutritional" | "Preservative / Additive" | "Allergen / Sensitivity" | "Endocrine / Carcinogen" | "Comedogenic / Irritation" | "General",
    "reason": "Clear explanation of health impact or benefit",
    "source": "FSSAI / BIS / WHO citation",
    "exposureNote": "Contextual usage alert",
    "recommendation": "Practical advice"
  }
]
Do not output markdown code blocks or any other text before or after the JSON.`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000); // 12s timeout for local LLM inference

    const res = await fetch(`${config.endpoint.replace(/\/$/, '')}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: config.model,
        prompt: `Ingredients: ${text}\n\nRespond with JSON array:`,
        system: systemPrompt,
        stream: false,
        format: 'json'
      })
    });
    clearTimeout(timeout);

    if (res.ok) {
      const json = await res.json();
      const responseText = json.response;
      const parsed = JSON.parse(responseText);

      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(item => ({
          name: item.name || 'Unknown',
          risk: item.risk === 'red' || item.risk === 'amber' || item.risk === 'green' ? item.risk : 'green',
          concernType: item.concernType || 'General',
          reason: item.reason || 'Evaluated by Local LLM',
          source: item.source || `Local Model (${config.model})`,
          exposureNote: item.exposureNote || '',
          recommendation: item.recommendation || ''
        }));
      }
    }
  } catch (err) {
    console.warn('Local LLM inference unavailable or timed out, falling back to built-in rules:', err);
  }

  // Graceful fallback to built-in rules
  return fallbackAnalyze(text);
}
