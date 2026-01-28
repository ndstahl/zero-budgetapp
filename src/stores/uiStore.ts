import { create } from 'zustand';

interface UIState {
  selectedMonth: number;
  selectedYear: number;
  setMonth: (month: number, year: number) => void;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  selectedMonth: new Date().getMonth() + 1,
  selectedYear: new Date().getFullYear(),
  setMonth: (selectedMonth, selectedYear) =>
    set({ selectedMonth, selectedYear }),
  goToPreviousMonth: () => {
    const { selectedMonth, selectedYear } = get();
    if (selectedMonth === 1) {
      set({ selectedMonth: 12, selectedYear: selectedYear - 1 });
    } else {
      set({ selectedMonth: selectedMonth - 1 });
    }
  },
  goToNextMonth: () => {
    const { selectedMonth, selectedYear } = get();
    if (selectedMonth === 12) {
      set({ selectedMonth: 1, selectedYear: selectedYear + 1 });
    } else {
      set({ selectedMonth: selectedMonth + 1 });
    }
  },
}));
