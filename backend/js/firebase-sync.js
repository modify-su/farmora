/* ==========================================================================
   🌿 FARMORA OFFICIAL — Firebase Cloud Real-time Sync (firebase-sync.js)
   ==========================================================================
   ระบบซิงค์ฐานข้อมูลคลาวด์แบบ Real-time ข้ามทุกอุปกรณ์ (PC, Mobile, Tablet)
   เชื่อมต่อ Google Cloud Firestore อัปเดตข้อมูลอัตโนมัติทันที
   ========================================================================== */

(function (window) {
  'use strict';

  // 1. คอนฟิกเชื่อมต่อ Firebase โปรเจกต์ farmora-official
  const firebaseConfig = {
    apiKey: "AIzaSyBY2Fj7MEVWLnnx4kzbtK2c_KEPb1QJyoM",
    authDomain: "farmora-official.firebaseapp.com",
    projectId: "farmora-official",
    storageBucket: "farmora-official.firebasestorage.app",
    messagingSenderId: "343855277257",
    appId: "1:343855277257:web:088f511a45fcbb6fe75918"
  };

  // ตรวจสอบว่ามี Firebase SDK หรือไม่
  if (typeof firebase === 'undefined') {
    console.warn('[Farmora Firebase] Firebase SDK is not loaded. Operating in local mode.');
    return;
  }

  // เริ่มต้น Firebase App
  if (!firebase.apps || !firebase.apps.length) {
    try {
      firebase.initializeApp(firebaseConfig);
    } catch (e) {
      console.error('[Farmora Firebase] Error initializing Firebase:', e);
      return;
    }
  }

  const db = firebase.firestore();
  const COLLECTION_NAME = 'farmora_store';

  // รายการคีย์ข้อมูลที่ต้องการซิงค์แบบ Real-time
  const SYNC_KEYS = [
    'farmora_products_v2',
    'farmora_slides_v2',
    'farmora_about_v2',
    'farmora_news_v2',
    'farmora_articles_v2',
    'farmora_theme_v2',
    'farmora_menus_v2',
    'farmora_maintenance_v4',
    'farmora_members_v1'
  ];

  let isRemoteSyncing = false;
  let syncStatus = 'connecting'; // 'connected' | 'connecting' | 'error' | 'permission_denied'

  function updateStatusUI(status) {
    syncStatus = status;
    const badge = document.getElementById('cloudSyncStatusBadge');
    if (!badge) return;

    if (status === 'connected') {
      badge.style.background = '#e8f5e9';
      badge.style.color = '#2e7d32';
      badge.style.borderColor = '#c8e6c9';
      badge.innerHTML = `<span style="width:8px; height:8px; border-radius:50%; background:#2e7d32; display:inline-block;"></span> <i class="fa-solid fa-cloud"></i> <span>คลาวด์เรียลไทม์: เชื่อมต่อแล้ว</span>`;
      badge.title = 'ข้อมูลซิงค์แบบเรียลไทม์กับ Google Cloud Firestore เรียบร้อยแล้ว';
    } else if (status === 'connecting') {
      badge.style.background = '#fff8e1';
      badge.style.color = '#f57f17';
      badge.style.borderColor = '#ffe082';
      badge.innerHTML = `<span style="width:8px; height:8px; border-radius:50%; background:#f57f17; display:inline-block;"></span> <i class="fa-solid fa-cloud-arrow-up"></i> <span>กำลังเชื่อมต่อคลาวด์...</span>`;
    } else if (status === 'permission_denied') {
      badge.style.background = '#ffebee';
      badge.style.color = '#c62828';
      badge.style.borderColor = '#ffcdd2';
      badge.innerHTML = `<span style="width:8px; height:8px; border-radius:50%; background:#c62828; display:inline-block;"></span> <i class="fa-solid fa-triangle-exclamation"></i> <span>รอเปิดสิทธิ์ Firestore Rules</span>`;
      badge.title = 'กรุณาตั้งค่า Firestore Database Rules ใน Firebase Console ให้เปิดอ่าน/เขียนได้';
    } else {
      badge.style.background = '#f5f5f5';
      badge.style.color = '#616161';
      badge.style.borderColor = '#e0e0e0';
      badge.innerHTML = `<span style="width:8px; height:8px; border-radius:50%; background:#757575; display:inline-block;"></span> <i class="fa-solid fa-cloud"></i> <span>โหมดออฟไลน์ (Local)</span>`;
    }
  }

  // 1. รับการเปลี่ยนแปลงแบบ Real-time จาก Cloud Firestore
  function listenRealtime() {
    updateStatusUI('connecting');
    let hasConnectedOnce = false;

    SYNC_KEYS.forEach((key) => {
      db.collection(COLLECTION_NAME).doc(key).onSnapshot((doc) => {
        if (!hasConnectedOnce) {
          hasConnectedOnce = true;
          updateStatusUI('connected');
        }

        if (doc.exists) {
          const cloudData = doc.data();
          if (cloudData && cloudData.payload !== undefined) {
            const cloudJson = JSON.stringify(cloudData.payload);
            const currentLocal = localStorage.getItem(key);

            // ถ้าข้อมูลจากคลาวด์ต่างจากในเครื่อง ให้อัปเดตและแจ้งเตือนหน้าเว็บทันที
            if (cloudJson !== currentLocal) {
              isRemoteSyncing = true;
              localStorage.setItem(key, cloudJson);

              // ยิงอีเวนต์ให้ทุกสคริปต์ในหน้าเว็บรับรู้และ Render ใหม่ทันที
              window.dispatchEvent(new CustomEvent('farmora:dataChanged', {
                detail: { key: key, remote: true, data: cloudData.payload }
              }));

              if (key === 'farmora_theme_v2') {
                window.dispatchEvent(new CustomEvent('farmora:themeChanged', { detail: cloudData.payload }));
              }

              setTimeout(() => { isRemoteSyncing = false; }, 80);
            }
          }
        } else {
          // หากบนคลาวด์ยังไม่มีเอกสารนี้ ให้ดึงข้อมูลเริ่มต้นในเครื่องส่งขึ้นไปสร้างบนคลาวด์ทันที
          const localItem = localStorage.getItem(key);
          if (localItem) {
            try {
              const parsed = JSON.parse(localItem);
              saveToCloud(key, parsed);
            } catch (err) {}
          }
        }
      }, (error) => {
        console.warn(`[Farmora Firebase] Firestore snapshot error (${key}):`, error.message);
        if (error.code === 'permission-denied') {
          updateStatusUI('permission_denied');
        } else {
          updateStatusUI('error');
        }
      });
    });
  }

  // 2. บันทึกข้อมูลขึ้น Cloud Firestore
  function saveToCloud(key, data) {
    if (!db || isRemoteSyncing) return Promise.resolve();
    return db.collection(COLLECTION_NAME).doc(key).set({
      payload: data,
      updatedAt: new Date().toISOString()
    }, { merge: true })
    .then(() => {
      updateStatusUI('connected');
    })
    .catch((err) => {
      console.warn(`[Farmora Firebase] Failed to save ${key} to Firestore:`, err.message);
      if (err.code === 'permission-denied') {
        updateStatusUI('permission_denied');
      }
    });
  }

  // ส่งออก API ให้เรียกใช้
  window.FarmoraFirebase = {
    db: db,
    save: saveToCloud,
    start: listenRealtime,
    getStatus: () => syncStatus
  };

  // เริ่มต้นทำงานทันทีที่โหลดเสร็จ
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      listenRealtime();
    });
  } else {
    listenRealtime();
  }

})(window);
