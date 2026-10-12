/**
 * ==========================================================================
 * 🌿 FARMORA OFFICIAL — Maintenance Mode Controller (maintenance.js)
 * ==========================================================================
 * ระบบควบคุมการระงับการเข้าถึงชั่วคราว / ปิดปรับปรุงระบบ (Maintenance Mode v4)
 * 1. ตรวจสอบสถานะการปิดปรับปรุงจาก localStorage (farmora_maintenance_v4)
 * 2. นำปุ่มเข้าสู่เว็บไซต์ออกทั้งหมด ผู้ชมทั่วไปไม่สามารถกดเข้าสู่เว็บไซต์ได้
 * 3. อนุญาตให้เข้าถึงได้เฉพาะกรณี:
 *    - ผู้ดูแลระบบปิดการปรับปรุงจากหลังบ้าน (เปิดให้เข้าถึงได้ตามปกติ)
 *    - หรือผู้ได้รับอนุญาตที่ใส่รหัสผ่านปลดล็อก (Authorized Passcode)
 *    - หรือเจ้าหน้าที่เข้าสู่ระบบหลังบ้าน (Admin Login Bypass)
 * 4. ไม่บล็อกหน้าหลังบ้าน (/backend/) เพื่อให้ผู้ดูแลระบบเข้าจัดการได้เสมอ
 * 5. ซิงค์สถานะแบบเรียลไทม์ข้ามแท็บ (Cross-tab Real-time Sync)
 * 6. รองรับนาฬิกานับถอยหลัง (Live Countdown Timer)
 * 7. รองรับฟังก์ชัน Live Preview สำหรับทดสอบในหน้าแอดมิน
 * ==========================================================================
 */

(function (window) {
  'use strict';

  const STORAGE_KEY = 'farmora_maintenance_v4';
  const LEGACY_STORAGE_KEYS = ['farmora_maintenance_v3', 'farmora_maintenance_v2'];
  const PASSCODE_SESSION_KEY = 'farmora_maint_authorized';
  let countdownInterval = null;

  // ข้อมูลเริ่มต้น: ปิดปรับปรุงและล็อกหน้าจอ นำปุ่มเข้าเว็บออกทั้งหมด
  const DEFAULT_CONFIG = {
    isActive: true,                   // เปิดใช้งานเป็นค่าเริ่มต้น
    mode: 'lockout',                  // โหมดล็อกทั้งเว็บไซต์ นำปุ่มเข้าเว็บออกทั้งหมด
    iconType: 'stop',                 // ป้ายหยุด 🛑 พร้อมเอฟเฟกต์ไฟเรืองแสง
    badgeText: 'ระงับการเข้าถึงชั่วคราว: กำลังปรับปรุงระบบ',
    title: 'เว็บไซต์ปิดปรับปรุงชั่วคราว',
    message: 'ขออภัยในความไม่สะดวก ขณะนี้เว็บไซต์ฟาร์โมรากำลังอยู่ระหว่างการปิดปรับปรุงและบำรุงรักษาระบบ ไม่อนุญาตให้เข้าชมจนกว่าระบบจะเปิดให้เข้าถึงได้',
    estimatedTime: 'คาดว่าจะเปิดให้บริการในวันที่ 12 ตุลาคม 2569 เวลา 18:00 น.',
    countdownTarget: '',
    emergencyPhone: '02-123-4567',
    emergencyLine: '@farmora',
    allowAdminBypass: true,
    enablePasscode: true,
    accessPasscode: 'farmora2026',
    updatedAt: new Date().toISOString()
  };

  /**
   * ดึงการตั้งค่า Maintenance
   */
  function getConfig() {
    // ตรวจสอบ Query Parameter สำหรับการทดสอบเร่งด่วน เช่น ?maintenance=lockout หรือ ?preview=1
    const search = window.location.search || '';
    if (search.includes('maintenance=preview') || search.includes('preview=1')) {
      return { ...DEFAULT_CONFIG, isActive: true, mode: 'lockout' };
    }
    if (search.includes('maintenance=1')) {
      return { ...DEFAULT_CONFIG, isActive: true, mode: 'lockout' };
    }

    try {
      // 1. อ่านจากเวอร์ชัน v4
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
      }

      // 2. ถ้ายังไม่มี v4 ให้อ่านจากเวอร์ชันเดิมแล้วอัปเกรดเป็น v4 (บังคับ mode: lockout)
      for (const legacyKey of LEGACY_STORAGE_KEYS) {
        const legacyStored = localStorage.getItem(legacyKey);
        if (legacyStored) {
          const legacy = JSON.parse(legacyStored);
          const migrated = { ...DEFAULT_CONFIG, ...legacy, mode: 'lockout', isActive: true };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
          return migrated;
        }
      }

      // 3. ถ้าไม่มีเลย ให้บันทึกค่าเริ่มต้นลงใน localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CONFIG));
    } catch (e) {
      console.warn('Error reading maintenance config:', e);
    }
    return DEFAULT_CONFIG;
  }

  /**
   * ตรวจสอบว่าหน้าปัจจุบันคือหน้าหลังบ้าน (Backend Admin) หรือไม่
   */
  function isBackendPage() {
    if (document.getElementById('adminSidebar') || 
        document.getElementById('authOverlay') || 
        document.getElementById('pane-overview') ||
        document.getElementById('pane-maintenance')) {
      return true;
    }
    const path = (window.location.pathname || '').toLowerCase();
    const href = (window.location.href || '').toLowerCase();
    return path.includes('backend') || href.includes('backend');
  }

  /**
   * สร้าง HTML ของไอคอนตาม iconType
   */
  function renderIconHtml(iconType) {
    switch (iconType) {
      case 'warning':
        return `
          <div class="maint-sign-warning">
            <i class="fa-solid fa-triangle-exclamation"></i>
          </div>
        `;
      case 'construction':
        return `
          <div class="maint-sign-construction">
            <i class="fa-solid fa-traffic-cone"></i>
          </div>
        `;
      case 'wrench':
        return `
          <div class="maint-sign-wrench">
            <i class="fa-solid fa-screwdriver-wrench"></i>
          </div>
        `;
      case 'stop':
      default:
        return `
          <div class="maint-sign-stop">
            <i class="fa-solid fa-hand"></i>
            <span class="stop-text">STOP</span>
          </div>
        `;
    }
  }

  /**
   * แสดงหรืออัปเดตหน้าต่าง Maintenance Modal
   */
  function renderModal(config, isPreview = false) {
    let overlay = document.getElementById('farmoraMaintenanceOverlay');

    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'farmoraMaintenanceOverlay';
      overlay.className = 'farmora-maint-overlay';
      document.body.appendChild(overlay);
    }

    const isStopIcon = config.iconType === 'stop';
    // คำนวณลิงก์สำหรับเข้าสู่ระบบหลังบ้าน
    const isRoot = !(/[\\/]frontend[\\/]html/i.test(window.location.pathname || window.location.href));
    const backendUrl = isRoot ? 'backend/index.html' : '../../backend/index.html';

    overlay.innerHTML = `
      <div class="farmora-maint-card">
        <!-- แถบลายสะท้อนแสงเตือนภัย -->
        <div class="farmora-maint-hazard-strip ${isStopIcon ? 'stop-hazard' : ''}"></div>

        <!-- ปุ่มกากบาทปิด (เฉพาะกรณีทดสอบ Preview ในหน้าแอดมินเท่านั้น) -->
        ${isPreview ? `
          <button type="button" class="farmora-maint-close-btn" id="btnDismissMaintTop" aria-label="ปิดการแสดงตัวอย่าง">
            <i class="fa-solid fa-xmark"></i>
          </button>
        ` : ''}

        <div class="farmora-maint-body">
          <!-- สัญลักษณ์เตือนหลัก / ป้ายหยุด -->
          <div class="farmora-maint-icon-wrap">
            ${renderIconHtml(config.iconType)}
          </div>

          <!-- แคปซูล Badge -->
          <div>
            <span class="farmora-maint-badge ${isStopIcon ? 'badge-danger' : ''}">
              <span class="farmora-maint-badge-dot"></span>
              <span>${config.badgeText || 'ระงับการเข้าถึงชั่วคราว: กำลังปรับปรุงระบบ'}</span>
            </span>
          </div>

          <!-- หัวข้อหลักและคำอธิบาย -->
          <h2 class="farmora-maint-title">${config.title || 'เว็บไซต์ปิดปรับปรุงชั่วคราว'}</h2>
          <p class="farmora-maint-desc">${config.message || 'ขออภัยในความไม่สะดวก ขณะนี้เว็บไซต์ฟาร์โมรากำลังอยู่ระหว่างการปิดปรับปรุงและบำรุงรักษาระบบ ไม่อนุญาตให้เข้าชมจนกว่าระบบจะเปิดให้เข้าถึงได้'}</p>

          <!-- กล่องเวลากำหนดเปิดให้บริการ -->
          ${config.estimatedTime ? `
            <div class="farmora-maint-time-box">
              <i class="fa-regular fa-clock"></i>
              <div class="farmora-maint-time-text">
                <span>กำหนดเปิดให้บริการ:</span>
                <strong>${config.estimatedTime}</strong>
              </div>
            </div>
          ` : ''}

          <!-- นาฬิกานับถอยหลัง (ถ้ามีกำหนด Countdown Target) -->
          <div class="farmora-maint-countdown" id="maintCountdownWrap" style="display: none;">
            <div class="maint-count-unit">
              <span class="maint-count-num" id="maintDays">00</span>
              <span class="maint-count-lbl">วัน</span>
            </div>
            <div class="maint-count-unit">
              <span class="maint-count-num" id="maintHours">00</span>
              <span class="maint-count-lbl">ชั่วโมง</span>
            </div>
            <div class="maint-count-unit">
              <span class="maint-count-num" id="maintMins">00</span>
              <span class="maint-count-lbl">นาที</span>
            </div>
            <div class="maint-count-unit">
              <span class="maint-count-num" id="maintSecs">00</span>
              <span class="maint-count-lbl">วินาที</span>
            </div>
          </div>

          <!-- ช่องทางติดต่อฉุกเฉิน -->
          <div class="farmora-maint-contacts">
            ${config.emergencyPhone ? `
              <a href="tel:${config.emergencyPhone.replace(/[^0-9]/g, '')}" class="maint-btn-contact maint-btn-tel">
                <i class="fa-solid fa-phone"></i>
                <span>${config.emergencyPhone}</span>
              </a>
            ` : ''}
            ${config.emergencyLine ? `
              <a href="https://line.me/ti/p/~${config.emergencyLine.replace('@', '')}" target="_blank" rel="noopener" class="maint-btn-contact maint-btn-line">
                <i class="fa-brands fa-line"></i>
                <span>LINE: ${config.emergencyLine}</span>
              </a>
            ` : ''}
          </div>
        </div>

        <!-- ส่วนท้าย: นำปุ่มเข้าสู่เว็บไซต์ออกทั้งหมด / ให้เฉพาะช่องทางที่ได้รับอนุญาต -->
        <div class="farmora-maint-footer">
          ${isPreview ? `
            <button type="button" class="farmora-maint-btn-dismiss" id="btnDismissMaintBottom">
              <i class="fa-solid fa-xmark"></i>
              <span>ปิดหน้าต่างตัวอย่าง (Close Preview)</span>
            </button>
          ` : `
            <div class="farmora-maint-lockout-actions">
              <div style="font-size: 13px; color: #c62828; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 6px;">
                <i class="fa-solid fa-lock"></i> ระงับการเข้าถึงชั่วคราว — ไม่อนุญาตให้เข้าชมจนกว่าจะเปิดให้บริการ
              </div>

              ${config.allowAdminBypass !== false ? `
                <a href="${backendUrl}" class="farmora-maint-admin-bypass">
                  <i class="fa-solid fa-shield-halved"></i> สำหรับเจ้าหน้าที่ / เข้าสู่ระบบหลังบ้าน (Admin Login)
                </a>
              ` : ''}

              ${config.enablePasscode !== false ? `
                <button type="button" class="farmora-maint-passcode-toggle-btn" id="btnTogglePasscode" onclick="window.FarmoraMaintenance.togglePasscode()">
                  <i class="fa-solid fa-key"></i> ใส่รหัสสำหรับผู้ได้รับอนุญาต
                </button>
                <div class="farmora-maint-passcode-box" id="passcodeBox" style="display: none;">
                  <form class="farmora-maint-passcode-form" onsubmit="window.FarmoraMaintenance.submitPasscode(event)">
                    <input type="password" id="maintPasscodeInput" class="farmora-maint-passcode-input" placeholder="กรอกรหัสผ่านเพื่อเข้าชม..." autocomplete="off">
                    <button type="submit" class="farmora-maint-passcode-submit">
                      <i class="fa-solid fa-unlock-keyhole"></i> ปลดล็อก
                    </button>
                  </form>
                  <div class="farmora-maint-passcode-error" id="passcodeError" style="display: none;">
                    <i class="fa-solid fa-circle-exclamation"></i> รหัสผ่านไม่ถูกต้อง หรือไม่ได้รับอนุญาตให้เข้าถึง
                  </div>
                </div>
              ` : ''}
            </div>
          `}
        </div>
      </div>
    `;

    // ผูก Event Listener เฉพาะกรณี Preview
    if (isPreview) {
      const closeTop = overlay.querySelector('#btnDismissMaintTop');
      const closeBottom = overlay.querySelector('#btnDismissMaintBottom');
      if (closeTop) closeTop.onclick = () => dismissModal(true);
      if (closeBottom) closeBottom.onclick = () => dismissModal(true);
      overlay.onclick = (e) => {
        if (e.target === overlay) dismissModal(true);
      };
    } else {
      // โหมดจริง: ไม่อนุญาตให้คลิกพื้นหลังเพื่อปิด
      overlay.onclick = null;
    }

    // จัดการ Countdown Timer
    startCountdown(config.countdownTarget);

    // ล็อกหน้าจอ ไม่ให้เลื่อนดูเนื้อหาด้านล่าง
    document.body.style.overflow = 'hidden';

    // บังคับให้แสดงผลทันทีแบบไม่มีข้อผิดพลาด
    overlay.style.display = 'flex';
    overlay.style.zIndex = '9999999';
    overlay.classList.add('active');
    overlay.style.opacity = '1';
    overlay.style.visibility = 'visible';

    const card = overlay.querySelector('.farmora-maint-card');
    if (card) {
      card.style.transform = 'translateY(0) scale(1)';
    }
  }

  /**
   * เริ่มนับถอยหลัง Countdown Timer
   */
  function startCountdown(targetDateTime) {
    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }

    const wrap = document.getElementById('maintCountdownWrap');
    if (!wrap) return;

    if (!targetDateTime) {
      wrap.style.display = 'none';
      return;
    }

    const target = new Date(targetDateTime).getTime();
    if (isNaN(target)) {
      wrap.style.display = 'none';
      return;
    }

    wrap.style.display = 'flex';

    function tick() {
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        const daysEl = document.getElementById('maintDays');
        const hrsEl = document.getElementById('maintHours');
        const minEl = document.getElementById('maintMins');
        const secEl = document.getElementById('maintSecs');
        if (daysEl) daysEl.textContent = '00';
        if (hrsEl) hrsEl.textContent = '00';
        if (minEl) minEl.textContent = '00';
        if (secEl) secEl.textContent = '00';
        clearInterval(countdownInterval);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      const daysEl = document.getElementById('maintDays');
      const hrsEl = document.getElementById('maintHours');
      const minEl = document.getElementById('maintMins');
      const secEl = document.getElementById('maintSecs');

      if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
      if (hrsEl) hrsEl.textContent = String(hours).padStart(2, '0');
      if (minEl) minEl.textContent = String(mins).padStart(2, '0');
      if (secEl) secEl.textContent = String(secs).padStart(2, '0');
    }

    tick();
    countdownInterval = setInterval(tick, 1000);
  }

  /**
   * ปิดหน้าต่าง Maintenance Modal
   */
  function dismissModal(isPreview = false) {
    const overlay = document.getElementById('farmoraMaintenanceOverlay');
    if (overlay) {
      overlay.classList.remove('active');
      overlay.style.opacity = '0';
      overlay.style.visibility = 'hidden';
      setTimeout(() => {
        overlay.remove();
        document.body.style.overflow = '';
      }, 300);
    }
  }

  /**
   * ฟังก์ชันหลักในการตรวจสอบและเปิดทำงาน
   */
  function initMaintenance() {
    // ถ้าเป็นหน้าหลังบ้าน (Backend Admin) ไม่ต้องล็อกหน้าจอเด็ดขาด
    if (isBackendPage()) {
      const overlay = document.getElementById('farmoraMaintenanceOverlay');
      if (overlay) overlay.remove();
      document.body.style.overflow = '';
      return;
    }

    const config = getConfig();

    // 1. ถ้าไม่ได้เปิดใช้งาน (แอดมินเปิดให้เข้าถึงได้ตามปกติ)
    if (!config.isActive) {
      const overlay = document.getElementById('farmoraMaintenanceOverlay');
      if (overlay) overlay.remove();
      document.body.style.overflow = '';
      return;
    }

    // 2. ถ้าผู้ใช้ได้รับการอนุญาตผ่านรหัสผ่านในเซสชันนี้แล้ว
    const isAuthorized = sessionStorage.getItem(PASSCODE_SESSION_KEY) === 'true';
    if (isAuthorized) {
      const overlay = document.getElementById('farmoraMaintenanceOverlay');
      if (overlay) overlay.remove();
      document.body.style.overflow = '';
      return;
    }

    // 3. แสดงหน้าต่างระงับการเข้าถึง (นำปุ่มเข้าเว็บออกทั้งหมด)
    renderModal(config, false);
  }

  // ป้องกันการกด Escape เพื่อปิดหน้าต่างในโหมดจริง
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const overlay = document.getElementById('farmoraMaintenanceOverlay');
      const previewBtn = overlay?.querySelector('#btnDismissMaintBottom');
      if (previewBtn && previewBtn.textContent.includes('Preview')) {
        dismissModal(true);
      }
    }
  });

  // รันเมื่อ DOM พร้อม
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMaintenance);
  } else {
    initMaintenance();
  }

  // ดักจับการเปลี่ยนแปลงแบบเรียลไทม์ (เมื่อแอดมินเปิด/ปิดในแท็บอื่น)
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY || LEGACY_STORAGE_KEYS.includes(e.key)) {
      initMaintenance();
    }
  });

  window.addEventListener('farmora:maintenanceChanged', () => {
    initMaintenance();
  });

  // ส่งออกฟังก์ชันสู่ Global Scope
  window.FarmoraMaintenance = {
    check: initMaintenance,
    dismiss: dismissModal,
    show: () => {
      sessionStorage.removeItem(PASSCODE_SESSION_KEY);
      renderModal({ ...getConfig(), isActive: true }, false);
    },
    showPreview: (customConfig) => {
      const merged = { ...getConfig(), ...customConfig, isActive: true };
      renderModal(merged, true);
    },
    togglePasscode: () => {
      const box = document.getElementById('passcodeBox');
      const input = document.getElementById('maintPasscodeInput');
      const error = document.getElementById('passcodeError');
      if (box) {
        const isHidden = box.style.display === 'none' || !box.style.display;
        box.style.display = isHidden ? 'block' : 'none';
        if (error) error.style.display = 'none';
        if (isHidden && input) {
          setTimeout(() => input.focus(), 60);
        }
      }
    },
    submitPasscode: (e) => {
      if (e && e.preventDefault) e.preventDefault();
      const input = document.getElementById('maintPasscodeInput');
      const error = document.getElementById('passcodeError');
      const entered = (input ? input.value : '').trim();
      const config = getConfig();
      const targetPass = config.accessPasscode || 'farmora2026';

      if (entered && entered === targetPass) {
        sessionStorage.setItem(PASSCODE_SESSION_KEY, 'true');
        dismissModal(false);

        // แสดงแถบแจ้งเตือนว่าได้รับสิทธิ์การเข้าถึงแล้ว
        const toast = document.createElement('div');
        toast.style.cssText = 'position:fixed;top:24px;left:50%;transform:translateX(-50%);background:#00a64c;color:#fff;padding:12px 24px;border-radius:30px;font-family:Kanit,sans-serif;font-size:14px;font-weight:600;box-shadow:0 6px 20px rgba(0,0,0,0.25);z-index:9999999;display:flex;align-items:center;gap:8px;';
        toast.innerHTML = '<i class="fa-solid fa-circle-check"></i> ปลดล็อกสิทธิ์สำเร็จ — ยินดีต้อนรับเข้าสู่เว็บไซต์ Farmora';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
      } else {
        if (error) error.style.display = 'flex';
        if (input) {
          input.style.borderColor = '#e53935';
          input.focus();
          input.select();
        }
      }
    }
  };

})(window);
