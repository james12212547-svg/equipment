import { create } from 'zustand';
import { saveLabExperimentDB, deleteLabExperimentDB, getAllLabExperimentsDB } from '../utils/db';

export const useLabStore = create((set) => ({
  experiments: [],
  
  loadExperiments: async () => {
    try {
      const expList = await getAllLabExperimentsDB();
      set({ experiments: expList });
    } catch (error) {
      console.error("Failed to load lab experiments:", error);
    }
  },
  
  addExperiment: async (experimentData) => {
    try {
      const newExp = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        ...experimentData
      };
      await saveLabExperimentDB(newExp);
      set((state) => ({
        experiments: [...state.experiments, newExp]
      }));
    } catch (error) {
      console.error("Failed to add experiment:", error);
      throw error;
    }
  },
  
  updateExperiment: async (id, updatedData) => {
    try {
      set((state) => {
        const existingExp = state.experiments.find(exp => exp.id === id);
        if (!existingExp) return state;
        
        const newExp = { ...existingExp, ...updatedData, updatedAt: new Date().toISOString() };
        saveLabExperimentDB(newExp); // fire and forget or await
        
        return {
          experiments: state.experiments.map(exp => 
            exp.id === id ? newExp : exp
          )
        };
      });
    } catch (error) {
      console.error("Failed to update experiment:", error);
      throw error;
    }
  },
  
  deleteExperiment: async (id) => {
    try {
      await deleteLabExperimentDB(id);
      set((state) => ({
        experiments: state.experiments.filter(exp => exp.id !== id)
      }));
    } catch (error) {
      console.error("Failed to delete experiment:", error);
      throw error;
    }
  }
}));
