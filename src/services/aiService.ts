export interface AIQuizResponse {
  questions: Array<{
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }>;
}

export const aiService = {
  async generateQuiz(topic: string, mode: 'General' | 'JEE' | 'NEET' | 'NCERT' = 'JEE', count: number = 3): Promise<AIQuizResponse> {
    const res = await fetch('/api/ai/study', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'generate-quiz', topic, mode, count })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to generate quiz');
    return data.data;
  },

  async summarizeLecture(topic: string, notesContext?: string, mode?: string): Promise<string> {
    const res = await fetch('/api/ai/study', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'summarize-lecture', topic, notesContext, mode })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to generate summary');
    return data.summary;
  },

  async solveDoubt(question: string, classroomContext?: string): Promise<string> {
    const res = await fetch('/api/ai/study', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'solve-doubt', question, classroomContext })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to solve doubt');
    return data.solution;
  },

  async extractFormulas(topic: string, mode: string = 'JEE'): Promise<string> {
    const res = await fetch('/api/ai/study', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'extract-formulas', topic, mode })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to extract formulas');
    return data.formulas;
  }
};
