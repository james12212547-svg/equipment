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

// --- Custom Equipment ---

export const saveCustomEquipmentDB = async (equipment) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(CUSTOM_EQ_STORE, 'readwrite');
    const store = tx.objectStore(CUSTOM_EQ_STORE);
    store.put(equipment);
    
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

export const deleteCustomEquipmentDB = async (id) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(CUSTOM_EQ_STORE, 'readwrite');
    const store = tx.objectStore(CUSTOM_EQ_STORE);
    store.delete(id);
    
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

export const getAllCustomEquipmentDB = async () => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(CUSTOM_EQ_STORE, 'readonly');
    const store = tx.objectStore(CUSTOM_EQ_STORE);
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
};

// --- Lab Experiments ---

export const saveLabExperimentDB = async (experiment) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(LAB_EXPERIMENTS_STORE, 'readwrite');
    const store = tx.objectStore(LAB_EXPERIMENTS_STORE);
    store.put(experiment);
    
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

export const deleteLabExperimentDB = async (id) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(LAB_EXPERIMENTS_STORE, 'readwrite');
    const store = tx.objectStore(LAB_EXPERIMENTS_STORE);
    store.delete(id);
    
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

export const getAllLabExperimentsDB = async () => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(LAB_EXPERIMENTS_STORE, 'readonly');
    const store = tx.objectStore(LAB_EXPERIMENTS_STORE);
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
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

// --- WorkLog Database (used by WorkLog.jsx, accessible here for History) ---
const WORKLOG_DB_NAME = 'EngineeringWorkLogDB';
const WORKLOG_STORE_NAME = 'worklogs';

const initWorkLogDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(WORKLOG_DB_NAME, 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(WORKLOG_STORE_NAME)) {
        db.createObjectStore(WORKLOG_STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getWorkLogsDB = async () => {
  const db = await initWorkLogDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(WORKLOG_STORE_NAME, 'readonly');
    const store = tx.objectStore(WORKLOG_STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
};

// --- Quotations ---

export const saveQuotationDB = async (quotation) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(QUOTATIONS_STORE, 'readwrite');
    tx.objectStore(QUOTATIONS_STORE).put(quotation);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

export const getAllQuotationsDB = async () => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(QUOTATIONS_STORE, 'readonly');
    const req = tx.objectStore(QUOTATIONS_STORE).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
};

export const deleteQuotationDB = async (id) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(QUOTATIONS_STORE, 'readwrite');
    tx.objectStore(QUOTATIONS_STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

// --- Inventory ---

export const saveInventoryItemDB = async (item) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(INVENTORY_STORE, 'readwrite');
    tx.objectStore(INVENTORY_STORE).put(item);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

export const getAllInventoryDB = async () => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(INVENTORY_STORE, 'readonly');
    const req = tx.objectStore(INVENTORY_STORE).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
};

export const deleteInventoryItemDB = async (id) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(INVENTORY_STORE, 'readwrite');
    tx.objectStore(INVENTORY_STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};
