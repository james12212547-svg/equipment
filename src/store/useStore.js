import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { saveCustomEquipmentDB, deleteCustomEquipmentDB, getAllCustomEquipmentDB } from '../utils/db';

const useStore = create(
  persist(
    (set) => ({
      // --- Theme State ---
      theme: 'dark',
      toggleTheme: () => set((state) => {
        const newTheme = state.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        return { theme: newTheme };
      }),

      // --- Favorites State ---
      favorites: [],
      toggleFavorite: (equipmentId) => set((state) => {
        const isFav = state.favorites.includes(equipmentId);
        let newFavorites;
        if (isFav) {
          newFavorites = state.favorites.filter(id => id !== equipmentId);
        } else {
          newFavorites = [...state.favorites, equipmentId];
        }
        return { favorites: newFavorites };
      }),

      // --- Auth State --- (Manual sessionStorage)
      isAuthenticated: sessionStorage.getItem('auth') === 'true',
      login: () => {
        sessionStorage.setItem('auth', 'true');
        set({ isAuthenticated: true });
      },
      logout: () => {
        sessionStorage.removeItem('auth');
        set({ isAuthenticated: false });
      },

      // --- Custom Equipment State (Memory only, synced to IndexedDB via actions) ---
      customEquipment: [],
      loadCustomEquipment: async () => {
        try {
          const eqList = await getAllCustomEquipmentDB();
          set({ customEquipment: eqList });
        } catch (error) {
          console.error("Failed to load custom equipment:", error);
        }
      },
      addCustomEquipment: async (equipment) => {
        try {
          await saveCustomEquipmentDB(equipment);
          set((state) => {
            const exists = state.customEquipment.some(eq => eq.id === equipment.id);
            if (exists) {
              return { customEquipment: state.customEquipment.map(eq => eq.id === equipment.id ? equipment : eq) };
            }
            return { customEquipment: [...state.customEquipment, equipment] };
          });
        } catch (error) {
          console.error("Failed to add custom equipment:", error);
          throw error;
        }
      },
      deleteCustomEquipment: async (id) => {
        try {
          await deleteCustomEquipmentDB(id);
          set((state) => ({ customEquipment: state.customEquipment.filter(eq => eq.id !== id) }));
        } catch (error) {
          console.error("Failed to delete custom equipment:", error);
          throw error;
        }
      },

      // --- Maintenance Schedule State ---
      schedules: [],
      addSchedule: (schedule) => set((state) => ({ 
        schedules: [...state.schedules, { ...schedule, id: Date.now().toString() }] 
      })),
      updateSchedule: (id, updatedSchedule) => set((state) => ({
        schedules: state.schedules.map(s => s.id === id ? { ...s, ...updatedSchedule } : s)
      })),
      deleteSchedule: (id) => set((state) => ({
        schedules: state.schedules.filter(s => s.id !== id)
      })),
    }),
    {
      name: 'equipment-store-persist', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ theme: state.theme, favorites: state.favorites, schedules: state.schedules }), // Only persist these fields
      onRehydrateStorage: () => (state) => {
        if (state) {
          document.documentElement.setAttribute('data-theme', state.theme);
        }
      }
    }
  )
);

export default useStore;
