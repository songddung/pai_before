import { create } from 'zustand';
import { Answer, Quiz } from '../../domains/quiz/model/types';

interface QuizState {
  currentQuiz: Quiz | null;
  input: string;
  answers: Answer[];
  completed: boolean;
  quizzes: Quiz[];

  setCurrentQuiz: (quiz: Quiz | null) => void;
  setInput: (input: string) => void;
  addAnswer: (answer: Answer) => void;
  setCompleted: (completed: boolean) => void;
  setQuizzes: (quizzes: Quiz[]) => void;
  clearAnswers: () => void;
}

export const useQuizStore = create<QuizState>((set) => ({
  currentQuiz: null,
  input: "",
  answers: [],
  completed: false,
  quizzes: [],

  setCurrentQuiz: (currentQuiz) => set({ currentQuiz }),
  setInput: (input) => set({ input }),
  addAnswer: (answer) => set((state) => ({ answers: [...state.answers, answer] })),
  setCompleted: (completed) => set({ completed }),
  setQuizzes: (quizzes) => set({ quizzes }),
  clearAnswers: () => set({ answers: [] }),
}));