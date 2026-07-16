import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  saveCustomEquipmentDB, deleteCustomEquipmentDB, getAllCustomEquipmentDB,
  saveScheduleDB, deleteScheduleDB, getAllSchedulesDB, subscribeToSchedulesDB,
  saveProjectDB, deleteProjectDB, getAllProjectsDB 
} from '../utils/db';

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
      unsubscribeSchedules: null,
      loadSchedules: async () => {
        try {
          // Unsubscribe if already listening
          const { unsubscribeSchedules } = useStore.getState();
          if (unsubscribeSchedules) unsubscribeSchedules();

          // Start listening to real-time changes
          const unsubscribe = subscribeToSchedulesDB((list) => {
            set({ schedules: list });
          });
          set({ unsubscribeSchedules: unsubscribe });
        } catch (error) {
          console.error("Failed to load schedules", error);
        }
      },
      addSchedule: async (schedule) => {
        try {
          const newSchedule = { ...schedule, id: schedule.id || Date.now().toString() };
          await saveScheduleDB(newSchedule);
          // State is updated by onSnapshot listener
        } catch (error) {
          console.error("Failed to add schedule", error);
          throw error;
        }
      },
      updateSchedule: async (id, updatedSchedule) => {
        try {
          const scheduleToUpdate = { ...updatedSchedule, id };
          await saveScheduleDB(scheduleToUpdate);
          // State is updated by onSnapshot listener
        } catch (error) {
          console.error("Failed to update schedule", error);
          throw error;
        }
      },
      deleteSchedule: async (id) => {
        try {
          await deleteScheduleDB(id);
          // State is updated by onSnapshot listener
        } catch (error) {
          console.error("Failed to delete schedule", error);
          throw error;
        }
      },

      // --- Projects State ---
      projects: [],
      loadProjects: async () => {
        try {
          const list = await getAllProjectsDB();
          set({ projects: list });
        } catch (error) {
          console.error("Failed to load projects", error);
        }
      },
      addProject: async (project) => {
        try {
          const newProject = { ...project, id: project.id || Date.now().toString(), createdAt: project.createdAt || new Date().toISOString() };
          await saveProjectDB(newProject);
          set((state) => ({ projects: [...state.projects, newProject] }));
        } catch (error) {
          console.error("Failed to add project", error);
          throw error;
        }
      },
      updateProject: async (id, updatedProject) => {
        try {
          const projectToUpdate = { ...updatedProject, id };
          await saveProjectDB(projectToUpdate);
          set((state) => ({
            projects: state.projects.map(p => p.id === id ? { ...p, ...updatedProject } : p)
          }));
        } catch (error) {
          console.error("Failed to update project", error);
          throw error;
        }
      },
      deleteProject: async (id) => {
        try {
          await deleteProjectDB(id);
          set((state) => ({ projects: state.projects.filter(p => p.id !== id) }));
        } catch (error) {
          console.error("Failed to delete project", error);
          throw error;
        }
      },
    }),
    {
      name: 'equipment-store-persist', 
      partialize: (state) => ({ theme: state.theme, favorites: state.favorites }),
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          document.documentElement.setAttribute('data-theme', state.theme);
        }
      }
    }
  )
);

export default useStore;
