/* ==========================================================================
   🌿 FARMORA OFFICIAL — Member System Logic (member.js)
   ==========================================================================
   ระบบจัดการสมาชิก: สมัครสมาชิก, เข้าสู่ระบบ, โปรไฟล์, ลืมรหัสผ่าน/รีเซ็ต และซิงค์ข้ามอุปกรณ์
   ========================================================================== */

(function (window) {
  'use strict';

  const STORAGE_KEY_MEMBERS = 'farmora_members_v1';
  const STORAGE_KEY_ACTIVE = 'farmora_active_member';

  // สมาชิกตัวอย่างตั้งต้น
  const DEFAULT_MEMBERS = [
    {
      id: 'm_demo_1',
      name: 'สมชาย เกษตรพัฒนา',
      phone: '0812345678',
      pass: '123456',
      type: 'farmer',
      typeName: 'เกษตรกรผู้ปลูก',
      crops: 'นาข้าว, ข้าวโพด',
      province: 'นครราชสีมา',
      points: 150,
      createdAt: '2026-10-01'
    },
    {
      id: 'm_demo_2',
      name: 'สมหญิง การเกษตร',
      phone: '0898765432',
      pass: '123456',
      type: 'dealer',
      typeName: 'ร้านค้าตัวแทน',
      crops: 'ไม้ผล, ทุเรียน',
      province: 'จันทบุรี',
      points: 320,
      createdAt: '2026-10-15'
    }
  ];

  let currentForgotPhone = '';
  let generatedOTP = '123456';

  function getMembersList() {
    if (window.FarmoraDataStore && window.FarmoraDataStore.Members && typeof window.FarmoraDataStore.Members.getAll === 'function') {
      return window.FarmoraDataStore.Members.getAll();
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY_MEMBERS);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return DEFAULT_MEMBERS;
  }

  function saveMembersList(list) {
    try {
      localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(list));
      if (window.FarmoraFirebase && typeof window.FarmoraFirebase.save === 'function') {
        window.FarmoraFirebase.save(STORAGE_KEY_MEMBERS, list);
      }
      window.dispatchEvent(new CustomEvent('farmora:dataChanged', { detail: { key: STORAGE_KEY_MEMBERS } }));
    } catch (e) {}
  }

  function getActiveMember() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ACTIVE);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return null;
  }

  function setActiveMember(member) {
    try {
      if (member) {
        localStorage.setItem(STORAGE_KEY_ACTIVE, JSON.stringify(member));
      } else {
        localStorage.removeItem(STORAGE_KEY_ACTIVE);
      }
      updateNavbarUserIcon();
    } catch (e) {}
  }

  // ── 1. สร้าง Modal ในหน้าเว็บอัตโนมัติ (DOM Injection) ────────────
  function injectMemberModalDOM() {
    if (document.getElementById('memberModalBackdrop')) return;

    const modalHTML = `
      <div class="member-modal-backdrop" id="memberModalBackdrop" onclick="if(event.target===this) FarmoraMember.closeModal()">
        <div class="member-modal-dialog">
          
          <!-- Header -->
          <div class="member-modal-header">
            <button type="button" class="member-close-btn" onclick="FarmoraMember.closeModal()" aria-label="ปิด">&times;</button>
            <div class="member-brand-badge">
              <i class="fa-solid fa-leaf"></i> FARMORA MEMBER
            </div>
            <h3 class="member-modal-title" id="memberModalHeading">ระบบสมาชิก ฟาร์โมรา</h3>
            <p class="member-modal-subtitle" id="memberModalSubheading">เข้าสู่ระบบเพื่อรับสิทธิพิเศษและข้อมูลเกษตรเฉพาะคุณ</p>
          </div>

          <!-- Tabs (แสดงเฉพาะเมื่ออยู่ในหน้า Sign In / Register) -->
          <div class="member-tabs" id="memberTabsNav">
            <button type="button" class="member-tab-btn active" id="tabBtnSignIn" onclick="FarmoraMember.switchTab('signin')">
              <i class="fa-solid fa-arrow-right-to-bracket"></i> เข้าสู่ระบบ
            </button>
            <button type="button" class="member-tab-btn" id="tabBtnRegister" onclick="FarmoraMember.switchTab('register')">
              <i class="fa-solid fa-user-plus"></i> สมัครสมาชิกใหม่
            </button>
          </div>

          <!-- Body -->
          <div class="member-modal-body">
            
            <!-- Pane 1: เข้าสู่ระบบ (Sign In) -->
            <div class="member-form-pane active" id="memberPaneSignIn">
              <form onsubmit="FarmoraMember.handleSignIn(event)">
                <div class="member-form-group">
                  <label class="member-form-label">เบอร์โทรศัพท์มือถือ *</label>
                  <div class="member-input-wrap">
                    <i class="fa-solid fa-mobile-screen-button member-input-icon"></i>
                    <input type="tel" id="memberLoginUser" class="member-form-input" required placeholder="เช่น 0812345678" maxlength="10" autocomplete="username">
                  </div>
                </div>

                <div class="member-form-group">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <label class="member-form-label" style="margin: 0;">รหัสผ่าน *</label>
                    <a href="javascript:void(0)" onclick="FarmoraMember.switchTab('forgot')" style="font-size: 12.5px; color: #006837; text-decoration: none; font-weight: 600;">
                      <i class="fa-solid fa-key" style="font-size: 11px;"></i> ลืมรหัสผ่าน?
                    </a>
                  </div>
                  <div class="member-input-wrap">
                    <i class="fa-solid fa-lock member-input-icon"></i>
                    <input type="password" id="memberLoginPass" class="member-form-input" required placeholder="ระบุรหัสผ่านของคุณ" autocomplete="current-password">
                    <button type="button" class="member-password-toggle" onclick="FarmoraMember.togglePasswordVisibility('memberLoginPass', this)">
                      <i class="fa-regular fa-eye"></i>
                    </button>
                  </div>
                </div>

                <button type="submit" class="btn-member-submit">
                  <i class="fa-solid fa-arrow-right-to-bracket"></i> เข้าสู่ระบบสมาชิก
                </button>

                <div class="member-form-footer">
                  ยังไม่มีบัญชีสมาชิก? <a href="javascript:void(0)" onclick="FarmoraMember.switchTab('register')">สมัครสมาชิกฟรีที่นี่</a>
                </div>
              </form>
            </div>

            <!-- Pane 2: สมัครสมาชิก (Register) -->
            <div class="member-form-pane" id="memberPaneRegister">
              <form onsubmit="FarmoraMember.handleRegister(event)">
                <div class="member-form-group">
                  <label class="member-form-label">ชื่อ - นามสกุล *</label>
                  <div class="member-input-wrap">
                    <i class="fa-solid fa-user member-input-icon"></i>
                    <input type="text" id="regName" class="member-form-input" required placeholder="เช่น นายสมชาย เกษตรก้าวหน้า">
                  </div>
                </div>

                <div class="member-form-group">
                  <label class="member-form-label">เบอร์โทรศัพท์ (ใช้เป็นชื่อผู้ใช้) *</label>
                  <div class="member-input-wrap">
                    <i class="fa-solid fa-phone member-input-icon"></i>
                    <input type="tel" id="regPhone" class="member-form-input" required placeholder="เช่น 0812345678" maxlength="10">
                  </div>
                </div>

                <div class="member-form-group">
                  <label class="member-form-label">ประเภทสมาชิก *</label>
                  <div class="member-type-grid">
                    <label class="member-type-option">
                      <input type="radio" name="regMemberType" value="farmer" checked>
                      <div class="member-type-card">
                        <i class="fa-solid fa-seedling"></i>
                        <span>เกษตรกร</span>
                      </div>
                    </label>
                    <label class="member-type-option">
                      <input type="radio" name="regMemberType" value="dealer">
                      <div class="member-type-card">
                        <i class="fa-solid fa-store"></i>
                        <span>ร้านค้าตัวแทน</span>
                      </div>
                    </label>
                    <label class="member-type-option">
                      <input type="radio" name="regMemberType" value="general">
                      <div class="member-type-card">
                        <i class="fa-solid fa-user-tag"></i>
                        <span>บุคคลทั่วไป</span>
                      </div>
                    </label>
                  </div>
                </div>

                <div class="member-form-group">
                  <label class="member-form-label">พืชหลักที่ปลูก หรือความสนใจ</label>
                  <div class="member-input-wrap">
                    <i class="fa-solid fa-wheat-awn member-input-icon"></i>
                    <input type="text" id="regCrops" class="member-form-input" placeholder="เช่น นาข้าว, มันสำปะหลัง, อ้อย, ไม้ผล">
                  </div>
                </div>

                <div class="member-form-group">
                  <label class="member-form-label">กำหนดรหัสผ่าน (อย่างน้อย 6 ตัวอักษร) *</label>
                  <div class="member-input-wrap">
                    <i class="fa-solid fa-lock member-input-icon"></i>
                    <input type="password" id="regPass" class="member-form-input" required minlength="6" placeholder="สร้างรหัสผ่านอย่างน้อย 6 ตัว">
                    <button type="button" class="member-password-toggle" onclick="FarmoraMember.togglePasswordVisibility('regPass', this)">
                      <i class="fa-regular fa-eye"></i>
                    </button>
                  </div>
                </div>

                <button type="submit" class="btn-member-submit">
                  <i class="fa-solid fa-user-check"></i> ยืนยันการสมัครสมาชิก
                </button>

                <div class="member-form-footer">
                  มีบัญชีอยู่แล้ว? <a href="javascript:void(0)" onclick="FarmoraMember.switchTab('signin')">เข้าสู่ระบบที่นี่</a>
                </div>
              </form>
            </div>

            <!-- Pane 3: ลืมรหัสผ่าน / รีเซ็ตรหัสผ่าน (Forgot Password) -->
            <div class="member-form-pane" id="memberPaneForgot">
              
              <!-- ขั้นที่ 1: ตรวจสอบเบอร์โทร -->
              <div id="forgotStepPhone">
                <div class="member-alert-box info">
                  <i class="fa-solid fa-shield-halved"></i>
                  <span>กรุณากรอกหมายเลขโทรศัพท์มือถือที่ลงทะเบียนไว้ เพื่อขอรับรหัส OTP สำหรับตั้งรหัสผ่านใหม่</span>
                </div>

                <div class="member-form-group">
                  <label class="member-form-label">เบอร์โทรศัพท์ที่ลงทะเบียนไว้ *</label>
                  <div class="member-input-wrap">
                    <i class="fa-solid fa-mobile-screen-button member-input-icon"></i>
                    <input type="tel" id="forgotPhone" class="member-form-input" required placeholder="เช่น 0812345678" maxlength="10">
                  </div>
                </div>

                <button type="button" class="btn-member-submit" onclick="FarmoraMember.requestForgotOTP()">
                  <i class="fa-solid fa-paper-plane"></i> ขอรับรหัส OTP ยืนยันตัวตน
                </button>
              </div>

              <!-- ขั้นที่ 2: กรอก OTP และตั้งรหัสใหม่ -->
              <div id="forgotStepVerify" style="display: none;">
                <div class="member-alert-box">
                  <i class="fa-solid fa-circle-check"></i>
                  <div>
                    ส่งรหัส OTP 6 หลักไปยังเบอร์ <strong id="forgotTargetPhone">-</strong> เรียบร้อยแล้ว
                    <div style="font-size: 11.5px; color: #15803d; margin-top: 2px;">
                      รหัสทดสอบ: <strong id="forgotOtpCodeHint" style="font-size: 13px; color: #006837;">123456</strong>
                    </div>
                  </div>
                </div>

                <div class="member-form-group">
                  <label class="member-form-label">รหัสยืนยัน OTP (6 หลัก) *</label>
                  <div class="member-input-wrap">
                    <i class="fa-solid fa-key member-input-icon"></i>
                    <input type="text" id="forgotOTP" class="member-form-input" maxlength="6" placeholder="เช่น 123456" style="letter-spacing: 4px; font-weight: 700; text-align: center;">
                  </div>
                </div>

                <div class="member-form-group">
                  <label class="member-form-label">กำหนดรหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร) *</label>
                  <div class="member-input-wrap">
                    <i class="fa-solid fa-lock member-input-icon"></i>
                    <input type="password" id="forgotNewPass" class="member-form-input" required minlength="6" placeholder="รหัสผ่านใหม่">
                    <button type="button" class="member-password-toggle" onclick="FarmoraMember.togglePasswordVisibility('forgotNewPass', this)">
                      <i class="fa-regular fa-eye"></i>
                    </button>
                  </div>
                </div>

                <div class="member-form-group">
                  <label class="member-form-label">ยืนยันรหัสผ่านใหม่อีกครั้ง *</label>
                  <div class="member-input-wrap">
                    <i class="fa-solid fa-lock member-input-icon"></i>
                    <input type="password" id="forgotConfirmPass" class="member-form-input" required minlength="6" placeholder="พิมพ์รหัสผ่านใหม่อีกครั้ง">
                  </div>
                </div>

                <button type="button" class="btn-member-submit" onclick="FarmoraMember.confirmForgotReset()">
                  <i class="fa-solid fa-floppy-disk"></i> บันทึกและตั้งรหัสผ่านใหม่
                </button>
              </div>

              <div class="member-form-footer">
                จำรหัสผ่านได้แล้ว? <a href="javascript:void(0)" onclick="FarmoraMember.switchTab('signin')">กลับไปหน้าเข้าสู่ระบบ</a>
              </div>
            </div>

            <!-- Pane 4: โปรไฟล์สมาชิกเมื่อเข้าสู่ระบบแล้ว (Member Profile) -->
            <div class="member-form-pane" id="memberPaneProfile">
              <div class="member-profile-card">
                <div class="member-avatar-lg" id="profileAvatarLetter">F</div>
                <h4 class="member-profile-name" id="profileName">คุณสมชาย เกษตรพัฒนา</h4>
                <div class="member-profile-badge" id="profileTypeBadge">
                  <i class="fa-solid fa-circle-check"></i> <span>เกษตรกรผู้ปลูก</span>
                </div>

                <div class="member-stats-box">
                  <div>
                    <div class="member-stat-val" id="profilePoints">150</div>
                    <div class="member-stat-lbl">คะแนนสะสม (Points)</div>
                  </div>
                  <div>
                    <div class="member-stat-val" id="profilePhone">081-xxx-xxxx</div>
                    <div class="member-stat-lbl">เบอร์โทรศัพท์</div>
                  </div>
                </div>

                <!-- เมนูลัดเปลี่ยนรหัสผ่าน -->
                <div class="member-profile-section">
                  <button type="button" class="btn-member-outline-sm" onclick="FarmoraMember.toggleChangePassBox()">
                    <i class="fa-solid fa-key"></i> เปลี่ยนรหัสผ่านของฉัน
                  </button>

                  <div id="profileChangePassBox" style="display: none; margin-top: 14px; text-align: left;">
                    <form onsubmit="FarmoraMember.handleChangePassword(event)">
                      <div class="member-form-group">
                        <label class="member-form-label">รหัสผ่านปัจจุบัน *</label>
                        <input type="password" id="changeOldPass" class="member-form-input" required placeholder="รหัสผ่านเดิม">
                      </div>
                      <div class="member-form-group">
                        <label class="member-form-label">รหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร) *</label>
                        <input type="password" id="changeNewPass" class="member-form-input" required minlength="6" placeholder="รหัสผ่านใหม่">
                      </div>
                      <button type="submit" class="btn-member-submit" style="padding: 9px 16px; font-size: 13px; margin-top: 6px;">
                        <i class="fa-solid fa-check"></i> อัปเดตรหัสผ่าน
                      </button>
                    </form>
                  </div>
                </div>

                <button type="button" class="btn-member-logout" onclick="FarmoraMember.handleLogout()">
                  <i class="fa-solid fa-arrow-right-from-bracket"></i> ออกจากระบบสมาชิก
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  // ── 2. Modal Controls & Tabs ─────────────────────────────────────
  function openModal(defaultTab = 'signin') {
    injectMemberModalDOM();
    const backdrop = document.getElementById('memberModalBackdrop');
    if (!backdrop) return;

    const active = getActiveMember();
    if (active) {
      renderProfileData(active);
      switchTab('profile');
    } else {
      switchTab(defaultTab);
    }

    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    const backdrop = document.getElementById('memberModalBackdrop');
    if (backdrop) {
      backdrop.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  function switchTab(tab) {
    const tabsNav = document.getElementById('memberTabsNav');
    const heading = document.getElementById('memberModalHeading');
    const subheading = document.getElementById('memberModalSubheading');

    document.querySelectorAll('.member-form-pane').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.member-tab-btn').forEach(b => b.classList.remove('active'));

    if (tab === 'profile') {
      if (tabsNav) tabsNav.style.display = 'none';
      if (heading) heading.textContent = 'ข้อมูลสมาชิก ฟาร์โมรา';
      if (subheading) subheading.textContent = 'ยินดีต้อนรับสู่ครอบครัวเกษตรกรฟาร์โมรา';
      const pane = document.getElementById('memberPaneProfile');
      if (pane) pane.classList.add('active');
      return;
    }

    if (tab === 'forgot') {
      if (tabsNav) tabsNav.style.display = 'none';
      if (heading) heading.textContent = 'ลืมรหัสผ่าน / ตั้งรหัสใหม่';
      if (subheading) subheading.textContent = 'ยืนยันเบอร์โทรศัพท์เพื่อรับรหัส OTP สำหรับตั้งรหัสผ่านใหม่';
      const pane = document.getElementById('memberPaneForgot');
      if (pane) pane.classList.add('active');
      resetForgotForm();
      return;
    }

    if (tabsNav) tabsNav.style.display = 'flex';

    if (tab === 'signin') {
      document.getElementById('memberPaneSignIn')?.classList.add('active');
      document.getElementById('tabBtnSignIn')?.classList.add('active');
      if (heading) heading.textContent = 'เข้าสู่ระบบสมาชิก';
      if (subheading) subheading.textContent = 'เข้าสู่ระบบเพื่อรับสิทธิพิเศษและข้อมูลสินค้าเฉพาะคุณ';
    } else if (tab === 'register') {
      document.getElementById('memberPaneRegister')?.classList.add('active');
      document.getElementById('tabBtnRegister')?.classList.add('active');
      if (heading) heading.textContent = 'สมัครสมาชิกใหม่';
      if (subheading) subheading.textContent = 'ร่วมเป็นครอบครัวฟาร์โมรา รับสิทธิประโยชน์และคะแนนสะสม';
    }
  }

  function togglePasswordVisibility(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const isPass = input.type === 'password';
    input.type = isPass ? 'text' : 'password';
    const icon = btn.querySelector('i');
    if (icon) {
      icon.className = isPass ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';
    }
  }

  // ── 3. Handle Sign In & Register ─────────────────────────────────
  function handleSignIn(e) {
    if (e) e.preventDefault();
    const userVal = document.getElementById('memberLoginUser')?.value.trim();
    const passVal = document.getElementById('memberLoginPass')?.value.trim();

    if (!userVal || !passVal) {
      alert('กรุณากรอกเบอร์โทรศัพท์และรหัสผ่าน');
      return;
    }

    const members = getMembersList();
    const found = members.find(m => (m.phone === userVal || m.id === userVal) && m.pass === passVal);

    if (found) {
      setActiveMember(found);
      renderProfileData(found);
      switchTab('profile');
      alert(`🎉 ยินดีต้อนรับคุณ ${found.name} เข้าสู่ระบบสมาชิก Farmora เรียบร้อยแล้ว!`);
      closeModal();
    } else {
      alert('⚠️ เบอร์โทรศัพท์หรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง หรือกด "ลืมรหัสผ่าน?"');
    }
  }

  function handleRegister(e) {
    if (e) e.preventDefault();
    const name = document.getElementById('regName')?.value.trim();
    const phone = document.getElementById('regPhone')?.value.trim();
    const pass = document.getElementById('regPass')?.value.trim();
    const crops = document.getElementById('regCrops')?.value.trim();
    const typeRadio = document.querySelector('input[name="regMemberType"]:checked');
    const type = typeRadio ? typeRadio.value : 'farmer';

    const typeNames = {
      farmer: 'เกษตรกรผู้ปลูก',
      dealer: 'ร้านค้าตัวแทนจำหน่าย',
      general: 'บุคคลทั่วไป'
    };

    if (!name || !phone || !pass) {
      alert('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
      return;
    }

    if (phone.length < 9) {
      alert('กรุณาระบุหมายเลขโทรศัพท์ให้ถูกต้อง (9-10 หลัก)');
      return;
    }

    const members = getMembersList();
    if (members.some(m => m.phone === phone)) {
      alert('⚠️ หมายเลขโทรศัพท์นี้มีบัญชีสมาชิกในระบบแล้ว กรุณาเข้าสู่ระบบ หรือกดลืมรหัสผ่าน');
      switchTab('signin');
      return;
    }

    const newMember = {
      id: 'm_' + Date.now(),
      name: name,
      phone: phone,
      pass: pass,
      type: type,
      typeName: typeNames[type] || 'สมาชิกทั่วไป',
      crops: crops || 'พืชสวน / พืชไร่',
      points: 100, // คะแนนต้อนรับสมาชิกใหม่
      createdAt: new Date().toISOString()
    };

    if (window.FarmoraDataStore && window.FarmoraDataStore.Members && typeof window.FarmoraDataStore.Members.save === 'function') {
      window.FarmoraDataStore.Members.save(newMember);
    } else {
      members.unshift(newMember);
      saveMembersList(members);
    }

    setActiveMember(newMember);
    renderProfileData(newMember);
    switchTab('profile');

    alert(`🎊 สมัครสมาชิกสำเร็จ! ยินดีต้อนรับคุณ ${name}\nคุณได้รับคะแนนสะสมต้อนรับ 100 Points`);
    closeModal();
  }

  function handleLogout() {
    if (confirm('คุณต้องการออกจากระบบสมาชิกใช่หรือไม่?')) {
      setActiveMember(null);
      switchTab('signin');
      closeModal();
      alert('ออกจากระบบสมาชิกเรียบร้อยแล้ว');
    }
  }

  // ── 4. Forgot Password & Reset ──────────────────────────────────
  function resetForgotForm() {
    const p1 = document.getElementById('forgotStepPhone');
    const p2 = document.getElementById('forgotStepVerify');
    if (p1) p1.style.display = 'block';
    if (p2) p2.style.display = 'none';
    const otpInput = document.getElementById('forgotOTP');
    if (otpInput) otpInput.value = '';
    const newPass = document.getElementById('forgotNewPass');
    if (newPass) newPass.value = '';
    const confirmPass = document.getElementById('forgotConfirmPass');
    if (confirmPass) confirmPass.value = '';
  }

  function requestForgotOTP() {
    const phoneInput = document.getElementById('forgotPhone');
    const phone = (phoneInput ? phoneInput.value : '').trim();
    if (!phone || phone.length < 9) {
      alert('กรุณากรอกหมายเลขโทรศัพท์ให้ถูกต้อง (9-10 หลัก)');
      return;
    }

    const members = getMembersList();
    const member = members.find(m => m.phone === phone);
    if (!member) {
      alert('⚠️ ไม่พบหมายเลขโทรศัพท์นี้ในระบบสมาชิก กรุณาตรวจสอบอีกครั้ง หรือกดสมัครสมาชิกใหม่');
      return;
    }

    currentForgotPhone = phone;
    // สร้างรหัส OTP สุ่ม 6 หลัก
    generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();

    const targetEl = document.getElementById('forgotTargetPhone');
    if (targetEl) targetEl.textContent = phone;
    const otpNotice = document.getElementById('forgotOtpCodeHint');
    if (otpNotice) otpNotice.textContent = generatedOTP;

    document.getElementById('forgotStepPhone').style.display = 'none';
    document.getElementById('forgotStepVerify').style.display = 'block';

    alert(`📲 ส่งรหัส OTP 6 หลักไปยังเบอร์ ${phone} เรียบร้อยแล้ว!\n\n(รหัส OTP ยืนยันตัวตนคือ: ${generatedOTP})`);
  }

  function confirmForgotReset() {
    const otp = (document.getElementById('forgotOTP')?.value || '').trim();
    const newPass = (document.getElementById('forgotNewPass')?.value || '').trim();
    const confirmPass = (document.getElementById('forgotConfirmPass')?.value || '').trim();

    if (!otp) {
      alert('กรุณากรอกรหัสยืนยัน OTP');
      return;
    }

    if (otp !== generatedOTP && otp !== '123456') {
      alert('⚠️ รหัส OTP ไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง');
      return;
    }

    if (!newPass || newPass.length < 6) {
      alert('กรุณากำหนดรหัสผ่านใหม่อย่างน้อย 6 ตัวอักษร');
      return;
    }

    if (newPass !== confirmPass) {
      alert('⚠️ รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    const members = getMembersList();
    const idx = members.findIndex(m => m.phone === currentForgotPhone);
    if (idx === -1) {
      alert('เกิดข้อผิดพลาด ไม่พบข้อมูลสมาชิก');
      return;
    }

    if (window.FarmoraDataStore && window.FarmoraDataStore.Members && typeof window.FarmoraDataStore.Members.resetPassword === 'function') {
      window.FarmoraDataStore.Members.resetPassword(members[idx].id, newPass);
    } else {
      members[idx].pass = newPass;
      members[idx].updatedAt = new Date().toISOString();
      saveMembersList(members);
    }

    alert('🎉 เปลี่ยนรหัสผ่านสำเร็จเรียบร้อยแล้ว!\nกรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่');

    const loginUser = document.getElementById('memberLoginUser');
    if (loginUser) loginUser.value = currentForgotPhone;
    const loginPass = document.getElementById('memberLoginPass');
    if (loginPass) {
      loginPass.value = '';
      loginPass.focus();
    }

    switchTab('signin');
  }

  // ── 5. Change Password within Profile ───────────────────────────
  function toggleChangePassBox() {
    const box = document.getElementById('profileChangePassBox');
    if (!box) return;
    box.style.display = box.style.display === 'none' ? 'block' : 'none';
  }

  function handleChangePassword(e) {
    if (e) e.preventDefault();
    const active = getActiveMember();
    if (!active) {
      alert('กรุณาเข้าสู่ระบบก่อนดำเนินการ');
      return;
    }

    const oldPass = (document.getElementById('changeOldPass')?.value || '').trim();
    const newPass = (document.getElementById('changeNewPass')?.value || '').trim();

    if (oldPass !== active.pass) {
      alert('⚠️ รหัสผ่านปัจจุบันไม่ถูกต้อง');
      return;
    }

    if (newPass.length < 6) {
      alert('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }

    if (window.FarmoraDataStore && window.FarmoraDataStore.Members && typeof window.FarmoraDataStore.Members.resetPassword === 'function') {
      window.FarmoraDataStore.Members.resetPassword(active.id, newPass);
    } else {
      const members = getMembersList();
      const idx = members.findIndex(m => m.id === active.id);
      if (idx >= 0) {
        members[idx].pass = newPass;
        members[idx].updatedAt = new Date().toISOString();
        saveMembersList(members);
      }
    }

    active.pass = newPass;
    setActiveMember(active);

    alert('✅ บันทึกรหัสผ่านใหม่เรียบร้อยแล้ว');
    const oldP = document.getElementById('changeOldPass');
    if (oldP) oldP.value = '';
    const newP = document.getElementById('changeNewPass');
    if (newP) newP.value = '';
    toggleChangePassBox();
  }

  function renderProfileData(member) {
    if (!member) return;
    const nameEl = document.getElementById('profileName');
    const badgeEl = document.getElementById('profileTypeBadge');
    const pointsEl = document.getElementById('profilePoints');
    const phoneEl = document.getElementById('profilePhone');
    const avatarEl = document.getElementById('profileAvatarLetter');

    if (nameEl) nameEl.textContent = member.name;
    if (badgeEl) badgeEl.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>${member.typeName || 'สมาชิก'}</span>`;
    if (pointsEl) pointsEl.textContent = (member.points || 100).toLocaleString('th-TH');
    if (phoneEl) phoneEl.textContent = member.phone || '-';
    if (avatarEl) avatarEl.textContent = (member.name || 'F').charAt(0).toUpperCase();
  }

  // ── 6. อัปเดตไอคอนผู้ใช้บน Navbar ให้สวยงาม ────────────────────────
  function updateNavbarUserIcon() {
    const memberBtn = document.getElementById('memberNavBtn');
    if (!memberBtn) return;

    const active = getActiveMember();
    if (active) {
      memberBtn.classList.add('member-logged-in');
      memberBtn.title = `บัญชีของคุณ: ${active.name} (${active.typeName || 'สมาชิก'})`;
    } else {
      memberBtn.classList.remove('member-logged-in');
      memberBtn.title = 'เข้าสู่ระบบสมาชิก / สมัครสมาชิก';
    }
  }

  // ── 7. ส่งออก API และรันเมื่อ DOM พร้อม ──────────────────────────
  window.FarmoraMember = {
    openModal: openModal,
    closeModal: closeModal,
    switchTab: switchTab,
    handleSignIn: handleSignIn,
    handleRegister: handleRegister,
    handleLogout: handleLogout,
    requestForgotOTP: requestForgotOTP,
    confirmForgotReset: confirmForgotReset,
    toggleChangePassBox: toggleChangePassBox,
    handleChangePassword: handleChangePassword,
    getActiveMember: getActiveMember,
    togglePasswordVisibility: togglePasswordVisibility,
    updateNavbarUserIcon: updateNavbarUserIcon
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      injectMemberModalDOM();
      updateNavbarUserIcon();
    });
  } else {
    injectMemberModalDOM();
    updateNavbarUserIcon();
  }

})(window);