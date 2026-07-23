import { saveWorkLogDB, saveNotificationDB } from './db';
import toast from 'react-hot-toast';

const DB_NAME = 'EquipmentOfflineDB';
const DB_VERSION = 1;
const STORE_PENDING = 'pendingSyncQueue';

// Open IndexedDB
const openOfflineDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_PENDING)) {
        db.createObjectStore(STORE_PENDING, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Save Item to Offline Queue
export const saveOfflineQueueItem = async (type, payload) => {
  try {
    const db = await openOfflineDB();
    const tx = db.transaction(STORE_PENDING, 'readwrite');
    const store = tx.objectStore(STORE_PENDING);

    const item = {
      id: `offline_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      type, // 'worklog' | 'checkin' | 'schedule'
      payload,
      timestamp: new Date().toISOString(),
    };

    store.put(item);
    toast.success('📴 ไม่พบสัญญาณเน็ต: บันทึกข้อมูลลงเครื่องแบบออฟไลน์แล้ว!');
    return item.id;
  } catch (err) {
    console.error('Failed to save offline item:', err);
  }
};

// Get All Pending Offline Items
export const getOfflineQueue = async () => {
  try {
    const db = await openOfflineDB();
    const tx = db.transaction(STORE_PENDING, 'readonly');
    const store = tx.objectStore(STORE_PENDING);

    return new Promise((resolve) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    });
  } catch (err) {
    console.error('Failed to fetch offline queue:', err);
    return [];
  }
};

// Clear Item from Offline Queue
export const removeOfflineQueueItem = async (id) => {
  try {
    const db = await openOfflineDB();
    const tx = db.transaction(STORE_PENDING, 'readwrite');
    const store = tx.objectStore(STORE_PENDING);
    store.delete(id);
  } catch (err) {
    console.error('Failed to delete offline queue item:', err);
  }
};

// Sync Pending Items to Firebase Cloud when Online
export const syncOfflineQueueToCloud = async () => {
  if (!navigator.onLine) return;

  const items = await getOfflineQueue();
  if (items.length === 0) return;

  const toastId = toast.loading(`📶 เชื่อมต่ออินเทอร์เน็ตแล้ว! กำลังซิงค์ข้อมูล ${items.length} รายการขึ้นคลาวด์...`);

  let count = 0;
  for (const item of items) {
    try {
      if (item.type === 'worklog') {
        await saveWorkLogDB(item.payload);
      } else if (item.type === 'checkin' || item.type === 'schedule') {
        await saveNotificationDB({
          type: 'technician_checkin',
          title: '📍 ซิงค์พิกัดเช็คอินออฟไลน์เรียบร้อย',
          message: `พิกัดเช็คอินช่างซิงค์แล้วจากออฟไลน์เมื่อ ${new Date(item.timestamp).toLocaleTimeString('th-TH')}`,
          createdAt: new Date().toISOString(),
          isRead: false,
        });
      }
      await removeOfflineQueueItem(item.id);
      count++;
    } catch (err) {
      console.error('Failed to sync item:', item, err);
    }
  }

  if (count > 0) {
    toast.success(`✅ ซิงค์ข้อมูลออฟไลน์ ${count} รายการขึ้นคลาวด์เรียบร้อยแล้ว!`, { id: toastId });
  } else {
    toast.dismiss(toastId);
  }
};

// Auto Listen to Network Online/Offline Events
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    syncOfflineQueueToCloud();
  });
  window.addEventListener('offline', () => {
    toast('📴 เข้าสู่โหมดออฟไลน์ (ไร้สัญญาณเน็ต) ระบบจะบันทึกลงเครื่องให้อัตโนมัติ', { icon: '📶', duration: 4000 });
  });
}
