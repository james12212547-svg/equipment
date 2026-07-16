import { saveCustomEquipmentDB, saveLabExperimentDB, saveQuotationDB, saveInventoryItemDB, saveWorkLogDB, saveScheduleDB, saveProjectDB } from './db';
import toast from 'react-hot-toast';

const migrateFromStore = (dbName, storeName, saveFunction) => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName);
    request.onsuccess = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(storeName)) {
        resolve(0); // Store doesn't exist, nothing to migrate
        return;
      }
      
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const allReq = store.getAll();
      
      allReq.onsuccess = async () => {
        const items = allReq.result || [];
        for (const item of items) {
          try {
            await saveFunction(item);
          } catch (err) {
            console.error(`Failed to migrate item in ${storeName}`, err);
          }
        }
        resolve(items.length);
      };
      allReq.onerror = () => reject(allReq.error);
    };
    request.onerror = () => reject(request.error);
  });
};

export const migrateLocalDataToCloud = async () => {
  if (localStorage.getItem('has_migrated_to_firebase') === 'true') {
    return true;
  }

  try {
    toast.loading('กำลังย้ายข้อมูลขึ้น Cloud...', { id: 'migration' });
    
    // EquipmentAppDB
    await migrateFromStore('EquipmentAppDB', 'custom_equipment', saveCustomEquipmentDB);
    await migrateFromStore('EquipmentAppDB', 'lab_experiments', saveLabExperimentDB);
    await migrateFromStore('EquipmentAppDB', 'quotations', saveQuotationDB);
    await migrateFromStore('EquipmentAppDB', 'inventory', saveInventoryItemDB);
    
    // EngineeringWorkLogDB
    await migrateFromStore('EngineeringWorkLogDB', 'worklogs', saveWorkLogDB);
    
    // LocalStorage (Zustand)
    const zustandDataStr = localStorage.getItem('equipment-store-persist');
    if (zustandDataStr) {
      try {
        const zustandData = JSON.parse(zustandDataStr);
        if (zustandData.state) {
          if (zustandData.state.schedules) {
            for (const sch of zustandData.state.schedules) {
              await saveScheduleDB(sch);
            }
          }
          if (zustandData.state.projects) {
            for (const proj of zustandData.state.projects) {
              await saveProjectDB(proj);
            }
          }
        }
      } catch (err) {
        console.error("Error parsing zustand localstorage", err);
      }
    }
    
    // Mark as migrated
    localStorage.setItem('has_migrated_to_firebase', 'true');
    
    toast.success('ย้ายข้อมูลขึ้น Cloud สำเร็จแล้ว!', { id: 'migration' });
    return true;
  } catch (error) {
    console.error('Migration failed', error);
    toast.error('เกิดข้อผิดพลาดในการย้ายข้อมูล', { id: 'migration' });
    return false;
  }
};
