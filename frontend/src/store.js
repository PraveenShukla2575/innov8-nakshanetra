import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  currentUser: { id: 1, name: 'Ravi (Citizen)', role: 'citizen' },
  usersList: [],
  setCurrentUser: (user) => set({ currentUser: user }),
  setUsersList: (users) => set({ usersList: users }),
}));
