import { GoogleGenAI } from '@google/genai';

export interface QuizGenerationParams {
  topic: string;
  gradeLevel?: string;
  count?: number;
  mode?: 'General' | 'JEE' | 'NEET' | 'NCERT';
}

export interface SummaryParams {
  topic: string;
  notesContext: string;
  mode?: 'quick_recap' | 'detailed_notes' | 'formulas';
}

export interface DoubtParams {
  question: string;
  classroomContext?: string;
}

export interface AIProvider {
  name: string;
  generateQuiz(params: QuizGenerationParams): Promise<any>;
  summarizeLecture(params: SummaryParams): Promise<string>;
  solveDoubt(params: DoubtParams): Promise<string>;
  extractFormulas(topic: string, mode?: string): Promise<string>;
}

export class GoogleGeminiProvider implements AIProvider {
  name = 'Google Gemini (Official @google/genai)';
  private client: GoogleGenAI | null = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
      try {
        this.client = new GoogleGenAI({ apiKey });
      } catch (err) {
        console.warn('[GeminiProvider] Initialization notice:', err);
      }
    }
  }

  async generateQuiz(params: QuizGenerationParams): Promise<any> {
    const { topic, mode = 'General', count = 3 } = params;
    if (!this.client) {
      // Fallback deterministic academic quiz generator if no API key configured
      return {
        questions: [
          {
            id: 'q1',
            question: `In the study of ${topic}, what is the foundational governing principle?`,
            options: [
              'Conservation of Energy & Mass balance',
              'Spontaneous entropy reduction without work',
              'Non-relativist divergence at singularity',
              'Infinite thermal efficiency limit'
            ],
            correctIndex: 0,
            explanation: 'The conservation laws form the cornerstone of classical and modern analysis in this subject.'
          },
          {
            id: 'q2',
            question: `When analyzing instantaneous rates of change in ${topic}, which tool is applied?`,
            options: [
              'Differential Calculus (df/dt)',
              'Matrix Inversion only',
              'Static Equilibrium projection',
              'Empirical rounding'
            ],
            correctIndex: 0,
            explanation: 'Derivatives calculate the instantaneous rate of variation with respect to independent variables.'
          },
          {
            id: 'q3',
            question: `Which critical condition must be satisfied for steady-state resonance in ${topic}?`,
            options: [
              'Driving frequency equals system natural frequency (ω = ω₀)',
              'Damping factor exceeds critical limit',
              'Phase angle approaches 180 degrees',
              'Zero net amplitude response'
            ],
            correctIndex: 0,
            explanation: 'Resonance occurs when the applied external frequency matches the inherent natural oscillation frequency.'
          }
        ]
      };
    }

    const prompt = `You are a top exam teacher for ${mode} exam preparation.
Generate exactly ${count} multiple choice questions (MCQ) on the topic: "${topic}".
Format your response as valid JSON with no markdown formatting or backticks:
{
  "questions": [
    {
      "id": "q1",
      "question": "question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Clear explanation of why this answer is correct."
    }
  ]
}`;

    const response = await this.client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const text = response.text || '';
    try {
      return JSON.parse(text);
    } catch {
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleaned);
    }
  }

  async summarizeLecture(params: SummaryParams): Promise<string> {
    const { topic, notesContext, mode = 'quick_recap' } = params;
    if (!this.client) {
      return `### 📌 StudyLive Lecture Summary: ${topic}\n\n- **Core Concept**: Comprehensive study of ${topic} emphasizing first principles and exam-relevant mechanics.\n- **Key Takeaway**: High-yield problem patterns require consistent dimensional analysis and boundary conditions.\n- **Action Item**: Review standard textbook derivations and attempt timed exercise questions.`;
    }

    const prompt = `You are an elite academic tutor summarizing a live classroom session on "${topic}".
Session context or notes:
${notesContext || 'Standard curriculum session'}
Mode requested: ${mode}

Provide a structured, beautifully formatted markdown summary with:
1. 🎯 3 Key Takeaways
2. 📐 Critical Equations / Principles
3. ⚠️ Common Traps & Mistakes to Avoid
4. 📝 Practice Recommendation`;

    const response = await this.client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    return response.text || 'Summary generation completed.';
  }

  async solveDoubt(params: DoubtParams): Promise<string> {
    const { question, classroomContext } = params;
    if (!this.client) {
      return `**Doubt Solver Response**: For "${question}":\n\n1. **Concept**: Apply fundamental governing definitions first.\n2. **Step-by-Step**: Identify given parameters, write equations of motion/balance, and solve for target variables.\n3. **Sanity Check**: Ensure units and dimensional parity align before finalizing.`;
    }

    const prompt = `You are a patient, brilliant professor assisting a student during a live lecture.
Student Doubt: "${question}"
Classroom context: "${classroomContext || 'General academic study'}"

Provide a concise, direct, and encouraging step-by-step resolution. Highlight formulas and key intuitions clearly.`;

    const response = await this.client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    return response.text || 'Unable to generate resolution at this time.';
  }

  async extractFormulas(topic: string, mode: string = 'JEE'): Promise<string> {
    if (!this.client) {
      return `### 📐 Formula Sheet: ${topic} (${mode})\n\n1. **Standard Relation**: $F = ma$, $\\Delta p = F \\cdot \\Delta t$\n2. **Energy Conservation**: $E_k + E_p = \\text{constant}$\n3. **Power Output**: $P = \\frac{dW}{dt} = \\vec{F} \\cdot \\vec{v}$\n4. **Work-Energy Theorem**: $W_{\\text{net}} = \\Delta K$`;
    }

    const prompt = `Extract an authoritative formula cheat sheet for "${topic}" curated for the ${mode} syllabus.
Include symbol definitions, units, and conditions of applicability in crisp markdown tables or lists.`;

    const response = await this.client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    return response.text || 'Formulas extracted.';
  }
}

// Extensible factory
export function getAIProvider(providerName: string = 'gemini'): AIProvider {
  switch (providerName.toLowerCase()) {
    case 'gemini':
    default:
      return new GoogleGeminiProvider();
  }
}
