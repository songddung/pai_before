import { create } from 'zustand';
import { Audio } from 'expo-av';
import { Message } from '../../domains/conversation/model/types';

interface ConversationState {
  step: 1 | 2 | 3;
  selectedImage: string | null;
  mode: 'text' | 'voice';
  input: string;
  recording: Audio.Recording | null;
  messages: Message[];

  setStep: (step: 1 | 2 | 3) => void;
  setSelectedImage: (image: string | null) => void;
  setMode: (mode: 'text' | 'voice') => void;
  setInput: (input: string) => void;
  setRecording: (recording: Audio.Recording | null) => void;
  addMessage: (message: Message) => void;
  addMessages: (messages: Message[]) => void;
  clearMessages: () => void;
}

export const useConversationStore = create<ConversationState>((set) => ({
  step: 1,
  selectedImage: null,
  mode: 'text',
  input: '',
  recording: null,
  messages: [],

  setStep: (step) => set({ step }),
  setSelectedImage: (selectedImage) => set({ selectedImage }),
  setMode: (mode) => set({ mode }),
  setInput: (input) => set({ input }),
  setRecording: (recording) => set({ recording }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  addMessages: (newMessages) =>
    set((state) => ({ messages: [...state.messages, ...newMessages] })),
  clearMessages: () => set({ messages: [] }),
}));
