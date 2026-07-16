import { db as firestoreDb, storage } from './firebase';
import { collection, doc, setDoc, getDocs, deleteDoc, query, where, onSnapshot } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';

export const DB_NAME = 'EquipmentAppDB';
export const STORE_NAME = 'images';
export const CUSTOM_EQ_STORE = 'custom_equipment';
export const LAB_EXPERIMENTS_STORE = 'lab_experiments';
export const MODELS_STORE = '3d_models';
export const QUOTATIONS_STORE = 'quotations';
export const INVENTORY_STORE = 'inventory';

export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 5);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
      if (!db.objectStoreNames.contains(CUSTOM_EQ_STORE)) {
        db.createObjectStore(CUSTOM_EQ_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(LAB_EXPERIMENTS_STORE)) {
        db.createObjectStore(LAB_EXPERIMENTS_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(MODELS_STORE)) {
        db.createObjectStore(MODELS_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(QUOTATIONS_STORE)) {
        db.createObjectStore(QUOTATIONS_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(INVENTORY_STORE)) {
        db.createObjectStore(INVENTORY_STORE, { keyPath: 'id' });
      }
    };
  });
};

export const saveImage = async (id, base64Data) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(base64Data, id);
    
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(new Error('Transaction aborted'));
  });
};

export const loadImage = async (id) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getAllImages = async () => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    const keysRequest = store.getAllKeys();
    
    request.onsuccess = () => {
      keysRequest.onsuccess = () => {
        const images = {};
        keysRequest.result.forEach((key, index) => {
          images[key] = request.result[index];
        });
        resolve(images);
      };
      keysRequest.onerror = () => reject(keysRequest.error);
    };
    request.onerror = () => reject(request.error);
  });
};

export const saveMultipleImages = async (imagesObj) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    
    Object.keys(imagesObj).forEach(key => {
      store.put(imagesObj[key], key);
    });
    
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

// --- 3D Models (stored as ArrayBuffer) ---

export const saveModelDB = async (model) => {
  // model: { id, name, buffer (ArrayBuffer) }
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(MODELS_STORE, 'readwrite');
    const store = tx.objectStore(MODELS_STORE);
    store.put(model);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

export const deleteModelDB = async (id) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(MODELS_STORE, 'readwrite');
    const store = tx.objectStore(MODELS_STORE);
    store.delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

export const getAllModelsDB = async () => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(MODELS_STORE, 'readonly');
    const store = tx.objectStore(MODELS_STORE);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
};

export const getModelDB = async (id) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(MODELS_STORE, 'readonly');
    const store = tx.objectStore(MODELS_STORE);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const updateModelAnnotationsDB = async (id, annotations) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(MODELS_STORE, 'readwrite');
    const store = tx.objectStore(MODELS_STORE);
    const request = store.get(id);
    
    request.onsuccess = () => {
      const model = request.result;
      if (!model) return reject(new Error('Model not found'));
      model.annotations = annotations;
      const updateRequest = store.put(model);
      updateRequest.onsuccess = () => resolve();
      updateRequest.onerror = () => reject(updateRequest.error);
    };
    request.onerror = () => reject(request.error);
  });
};

// --- Custom Equipment ---
export const saveCustomEquipmentDB = async (equipment) => {
  await setDoc(doc(firestoreDb, 'custom_equipment', equipment.id), equipment);
};

export const deleteCustomEquipmentDB = async (id) => {
  await deleteDoc(doc(firestoreDb, 'custom_equipment', id));
};

export const getAllCustomEquipmentDB = async () => {
  const querySnapshot = await getDocs(collection(firestoreDb, 'custom_equipment'));
  return querySnapshot.docs.map(doc => doc.data());
};

// --- Lab Experiments ---
export const saveLabExperimentDB = async (experiment) => {
  await setDoc(doc(firestoreDb, 'lab_experiments', experiment.id), experiment);
};

export const deleteLabExperimentDB = async (id) => {
  await deleteDoc(doc(firestoreDb, 'lab_experiments', id));
};

export const getAllLabExperimentsDB = async () => {
  const querySnapshot = await getDocs(collection(firestoreDb, 'lab_experiments'));
  return querySnapshot.docs.map(doc => doc.data());
};

// --- WorkLogs ---
export const saveWorkLogDB = async (log) => {
  await setDoc(doc(firestoreDb, 'worklogs', log.id || Date.now().toString()), log);
};

export const getWorkLogsDB = async () => {
  const querySnapshot = await getDocs(collection(firestoreDb, 'worklogs'));
  return querySnapshot.docs.map(doc => doc.data());
};

export const deleteWorkLogDB = async (id) => {
  await deleteDoc(doc(firestoreDb, 'worklogs', id));
};

// --- Quotations ---
export const saveQuotationDB = async (quotation) => {
  await setDoc(doc(firestoreDb, 'quotations', quotation.id), quotation);
};

export const getAllQuotationsDB = async () => {
  const querySnapshot = await getDocs(collection(firestoreDb, 'quotations'));
  return querySnapshot.docs.map(doc => doc.data());
};

export const deleteQuotationDB = async (id) => {
  await deleteDoc(doc(firestoreDb, 'quotations', id));
};

// --- Inventory ---
export const saveInventoryItemDB = async (item) => {
  await setDoc(doc(firestoreDb, 'inventory', item.id), item);
};

export const getAllInventoryDB = async () => {
  const querySnapshot = await getDocs(collection(firestoreDb, 'inventory'));
  return querySnapshot.docs.map(doc => doc.data());
};

export const deleteInventoryItemDB = async (id) => {
  await deleteDoc(doc(firestoreDb, 'inventory', id));
};

// --- Schedules ---
export const saveScheduleDB = async (schedule) => {
  await setDoc(doc(firestoreDb, 'schedules', schedule.id), schedule);
};

export const getAllSchedulesDB = async () => {
  const querySnapshot = await getDocs(collection(firestoreDb, 'schedules'));
  return querySnapshot.docs.map(doc => doc.data());
};

export const subscribeToSchedulesDB = (callback) => {
  const q = collection(firestoreDb, 'schedules');
  return onSnapshot(q, (snapshot) => {
    const schedules = snapshot.docs.map(doc => doc.data());
    callback(schedules);
  });
};

export const deleteScheduleDB = async (id) => {
  await deleteDoc(doc(firestoreDb, 'schedules', id));
};

export const uploadImageToStorage = async (base64String, path) => {
  if (!base64String || !base64String.startsWith('data:image/')) return base64String; // Return original if not a new upload
  try {
    const imageRef = ref(storage, path);
    await uploadString(imageRef, base64String, 'data_url');
    return await getDownloadURL(imageRef);
  } catch (error) {
    console.error("Error uploading image:", error);
    return null;
  }
};

// --- Projects ---
export const saveProjectDB = async (project) => {
  await setDoc(doc(firestoreDb, 'projects', project.id), project);
};

export const getAllProjectsDB = async () => {
  const querySnapshot = await getDocs(collection(firestoreDb, 'projects'));
  return querySnapshot.docs.map(doc => doc.data());
};

export const deleteProjectDB = async (id) => {
  await deleteDoc(doc(firestoreDb, 'projects', id));
};

// --- Users (Technicians) ---
export const getTechniciansDB = async () => {
  try {
    const q1 = query(collection(firestoreDb, 'users'), where('role', '==', 'technician'));
    const q2 = query(collection(firestoreDb, 'user'), where('role', '==', 'technician'));
    
    const [snap1, snap2] = await Promise.all([
      getDocs(q1).catch(() => ({ docs: [] })),
      getDocs(q2).catch(() => ({ docs: [] }))
    ]);

    const usersMap = new Map();
    
    snap1.docs.forEach(doc => {
      usersMap.set(doc.id, { id: doc.id, ...doc.data() });
    });
    
    snap2.docs.forEach(doc => {
      if (!usersMap.has(doc.id)) {
        usersMap.set(doc.id, { id: doc.id, ...doc.data() });
      }
    });

    return Array.from(usersMap.values());
  } catch (error) {
    console.error("Error fetching technicians:", error);
    return [];
  }
};

// --- Inventory Logs ---
export const saveInventoryLogDB = async (log) => {
  await setDoc(doc(firestoreDb, 'inventory_logs', log.id), log);
};

export const getInventoryLogsDB = async () => {
  const querySnapshot = await getDocs(collection(firestoreDb, 'inventory_logs'));
  return querySnapshot.docs.map(doc => doc.data());
};
