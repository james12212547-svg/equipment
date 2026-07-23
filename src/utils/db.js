import { db as firestoreDb, storage } from './firebase';
import { collection, doc, setDoc, getDocs, deleteDoc, query, where, onSnapshot } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';

// ─── IndexedDB Setup (for offline 3D models) ───────────────────────────────
const DB_NAME = 'EquipmentAppDB';
const MODELS_STORE = '3d_models';

const initDB = () => new Promise((resolve, reject) => {
  const request = indexedDB.open(DB_NAME, 5);
  request.onerror = () => reject(request.error);
  request.onsuccess = () => resolve(request.result);
  request.onupgradeneeded = (e) => {
    const db = e.target.result;
    ['images', 'custom_equipment', 'lab_experiments', '3d_models', 'quotations', 'inventory'].forEach(store => {
      if (!db.objectStoreNames.contains(store)) {
        db.createObjectStore(store, store === 'images' ? undefined : { keyPath: 'id' });
      }
    });
  };
});

// ─── Image (IndexedDB) ────────────────────────────────────────────────────
export const saveImage = async (id, base64Data) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('images', 'readwrite');
    const store = tx.objectStore('images');
    store.put(base64Data, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(new Error('Transaction aborted'));
  });
};

export const loadImage = async (id) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('images', 'readonly');
    const request = tx.objectStore('images').get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getAllImages = async () => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('images', 'readonly');
    const store = tx.objectStore('images');
    const request = store.getAll();
    const keysReq = store.getAllKeys();
    request.onsuccess = () => {
      keysReq.onsuccess = () => {
        const images = {};
        keysReq.result.forEach((key, i) => { images[key] = request.result[i]; });
        resolve(images);
      };
      keysReq.onerror = () => reject(keysReq.error);
    };
    request.onerror = () => reject(request.error);
  });
};

export const saveMultipleImages = async (imagesObj) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('images', 'readwrite');
    const store = tx.objectStore('images');
    Object.keys(imagesObj).forEach(key => store.put(imagesObj[key], key));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

// ─── 3D Models (IndexedDB) ────────────────────────────────────────────────
export const saveModelDB = async (model) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(MODELS_STORE, 'readwrite');
    tx.objectStore(MODELS_STORE).put(model);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

export const deleteModelDB = async (id) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(MODELS_STORE, 'readwrite');
    tx.objectStore(MODELS_STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

export const getAllModelsDB = async () => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(MODELS_STORE, 'readonly');
    const request = tx.objectStore(MODELS_STORE).getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
};

export const getModelDB = async (id) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(MODELS_STORE, 'readonly');
    const request = tx.objectStore(MODELS_STORE).get(id);
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
      store.put(model).onsuccess = () => resolve();
    };
    request.onerror = () => reject(request.error);
  });
};

// ─── Firestore Generic Helpers ────────────────────────────────────────────
const fsGetAll = async (col) => {
  const snap = await getDocs(collection(firestoreDb, col));
  return snap.docs.map(d => d.data());
};
const fsSave = (col, item) => setDoc(doc(firestoreDb, col, item.id), item);
const fsDelete = (col, id) => deleteDoc(doc(firestoreDb, col, id));

// ─── Firestore Collections ────────────────────────────────────────────────

// Custom Equipment
export const saveCustomEquipmentDB = (equipment) => fsSave('custom_equipment', equipment);
export const deleteCustomEquipmentDB = (id) => fsDelete('custom_equipment', id);
export const getAllCustomEquipmentDB = () => fsGetAll('custom_equipment');

// Lab Experiments
export const saveLabExperimentDB = (experiment) => fsSave('lab_experiments', experiment);
export const deleteLabExperimentDB = (id) => fsDelete('lab_experiments', id);
export const getAllLabExperimentsDB = () => fsGetAll('lab_experiments');

// Work Logs (uses dynamic id fallback)
export const saveWorkLogDB = async (log) => {
  await setDoc(doc(firestoreDb, 'worklogs', log.id || Date.now().toString()), log);
};
export const getWorkLogsDB = () => fsGetAll('worklogs');
export const deleteWorkLogDB = (id) => fsDelete('worklogs', id);

// Quotations
export const saveQuotationDB = (quotation) => fsSave('quotations', quotation);
export const getAllQuotationsDB = () => fsGetAll('quotations');
export const deleteQuotationDB = (id) => fsDelete('quotations', id);

// Inventory
export const saveInventoryItemDB = (item) => fsSave('inventory', item);
export const getAllInventoryDB = () => fsGetAll('inventory');
export const deleteInventoryItemDB = (id) => fsDelete('inventory', id);

// Inventory Logs
export const saveInventoryLogDB = (log) => fsSave('inventory_logs', log);
export const getInventoryLogsDB = () => fsGetAll('inventory_logs');

// Schedules (uses merge + realtime)
export const saveScheduleDB = async (schedule) => {
  await setDoc(doc(firestoreDb, 'schedules', schedule.id), schedule, { merge: true });
};
export const getAllSchedulesDB = () => fsGetAll('schedules');
export const deleteScheduleDB = (id) => fsDelete('schedules', id);
export const subscribeToSchedulesDB = (callback) =>
  onSnapshot(collection(firestoreDb, 'schedules'), (snapshot) =>
    callback(snapshot.docs.map(d => d.data()))
  );

// Notifications
export const saveNotificationDB = (notification) => fsSave('notifications', notification);
export const markNotificationReadDB = async (id) => {
  await setDoc(doc(firestoreDb, 'notifications', id), { isRead: true }, { merge: true });
};
export const subscribeToNotificationsDB = (email, callback) => {
  if (!email) return () => {};
  const q = query(collection(firestoreDb, 'notifications'), where('userEmail', '==', email));
  return onSnapshot(q, (snapshot) =>
    callback(snapshot.docs.map(d => d.data()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
  );
};

// Projects
export const saveProjectDB = (project) => fsSave('projects', project);
export const getAllProjectsDB = () => fsGetAll('projects');
export const deleteProjectDB = (id) => fsDelete('projects', id);

// Users / Technicians
export const getTechniciansDB = async () => {
  try {
    const [snap1, snap2] = await Promise.all([
      getDocs(query(collection(firestoreDb, 'users'), where('role', '==', 'technician'))).catch(() => ({ docs: [] })),
      getDocs(query(collection(firestoreDb, 'user'), where('role', '==', 'technician'))).catch(() => ({ docs: [] })),
    ]);
    const usersMap = new Map();
    [...snap1.docs, ...snap2.docs].forEach(d => {
      if (!usersMap.has(d.id)) usersMap.set(d.id, { id: d.id, ...d.data() });
    });
    return Array.from(usersMap.values());
  } catch (error) {
    console.error('Error fetching technicians:', error);
    return [];
  }
};

// ─── Cloud Storage ───────────────────────────────────────────────────────
export const uploadImageToStorage = async (base64String, path) => {
  if (!base64String || !base64String.startsWith('data:image/')) return base64String;
  try {
    const imageRef = ref(storage, path);
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Storage upload timed out.')), 10000)
    );
    await Promise.race([uploadString(imageRef, base64String, 'data_url'), timeout]);
    return await getDownloadURL(imageRef);
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
};

// ─── Security Alerts (Admin Notifications) ───────────────────────────────
export const saveSecurityAlertDB = async (alert) => {
  // Saves a security alert that all admins will see in Notifications
  const id = `sec_${Date.now()}`;
  await setDoc(doc(firestoreDb, 'notifications', id), {
    id,
    type: 'security_alert',
    message: alert.message,
    email: alert.email,
    attempts: alert.attempts,
    createdAt: new Date().toISOString(),
    isRead: false,
    userEmail: 'admin', // broadcast to admin
  });
};
