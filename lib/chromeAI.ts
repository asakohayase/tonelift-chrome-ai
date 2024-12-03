// app/lib/chromeAI.ts

export type Situation = 'client' | 'customer_service' | 'external_comms' | 
                     'feedback_to_team' | 'feedback_to_management' | 
                     'personal' | 'complaint' | 'other';

export type Formality = 'formal' | 'casual';

export interface TransformResponse {
original_text: string;
transformed_text: string;
improvements: string[];
}

export interface ChromeAIService {
initialize(): Promise<boolean>;
transformText(text: string, options: {
  situation: Situation;
  formality: Formality;
  additionalContext?: string;
}): Promise<TransformResponse>;
destroy(): void;
}

interface AIRewriter {
rewrite(text: string, options: { context: string }): Promise<string>;
destroy(): void;
}

interface AILanguageModel {
prompt(text: string): Promise<string>;
destroy(): void;
}

interface AILanguageModelCapabilities {
available: 'readily' | 'after-download' | 'no';
defaultTopK: number;
maxTopK: number;
defaultTemperature: number;
}

interface AIWindow extends Window {
ai: {
  rewriter: {
    create(): Promise<AIRewriter>;
  };
  languageModel: {
    create(options?: {
      systemPrompt?: string;
      temperature?: number;
      topK?: number;
    }): Promise<AILanguageModel>;
    capabilities(): Promise<AILanguageModelCapabilities>;
  };
};
}

export class ChromeAIServiceImpl implements ChromeAIService {
private rewriter: AIRewriter | null = null;
private languageModel: AILanguageModel | null = null;

private readonly situationContexts: Record<Situation, string> = {
  'client': "Transform into professional, empathetic business communication",
  'customer_service': "Convert to helpful, empathetic customer service response",
  'external_comms': "Change to clear, professional brand communication",
  'feedback_to_team': "Change to constructive, supportive team feedback",
  'feedback_to_management': "Adapt to respectful, solution-focused upward feedback",
  'personal': "Modify to caring, considerate personal message",
  'complaint': "Modify to caring, considerate personal message",
  'other': "Transform to professional, empathetic communication"
};

async initialize(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  
  try {
    const aiWindow = window as unknown as AIWindow;
    
    // Initialize rewriter
    this.rewriter = await aiWindow.ai.rewriter.create();
    
    // Get capabilities first
    const capabilities = await aiWindow.ai.languageModel.capabilities();
    
    // Initialize language model with default parameters
    this.languageModel = await aiWindow.ai.languageModel.create({
      topK: capabilities.defaultTopK,
      temperature: capabilities.defaultTemperature,
      systemPrompt: "You analyze text improvements and output only in JSON array format"
    });

    return true;
  } catch (error) {
    console.error("Chrome AI initialization error:", error);
    return false;
  }
}

async transformText(text: string, options: {
  situation: Situation;
  formality: Formality;
  additionalContext?: string;
}): Promise<TransformResponse> {
  if (!this.rewriter || !this.languageModel) {
    throw new Error("AI service not initialized");
  }

  try {
    const context = `${this.situationContexts[options.situation]}. 
                    Make it ${options.formality === 'formal' ? 'professional and polite' : 'friendly and warm'}. 
                    Use empathetic language. Show understanding. Focus on solutions.
                    Respond in English only.
                    ${options.additionalContext || ''}`;
    
    const rewrittenText = await this.rewriter.rewrite(text, { context });

    const analysisPrompt = `
      Analyze these two versions and output exactly 3 improvements.
      Original: "${text}"
      Improved: "${rewrittenText}"
      
      Output format must be a JSON array like: ["Improvement 1", "Improvement 2", "Improvement 3"]
      Output ONLY the JSON array with no other text.`;

    const improvementsText = await this.languageModel.prompt(analysisPrompt);
    
    let improvements: string[];
    try {
      // Find the first line that starts with [ and parse it
      const jsonLine = improvementsText
        .split('\n')
        .find(line => line.trim().startsWith('[')) || '[]';
      improvements = JSON.parse(jsonLine).slice(0, 3);
    } catch {
      improvements = ['Enhanced tone', 'Improved clarity', 'Added empathy'];
    }

    return {
      original_text: text,
      transformed_text: rewrittenText,
      improvements
    };
  } catch (error) {
    console.error("Transformation error:", error);
    throw error;
  }
}

destroy(): void {
  this.rewriter?.destroy();
  this.languageModel?.destroy();
  this.rewriter = null;
  this.languageModel = null;
}
}