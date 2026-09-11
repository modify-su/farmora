/* ==========================================================================
   🌿 FARMORA OFFICIAL — Shopping Cart & Checkout System (cart.js)
   ==========================================================================
   ระบบจัดการตะกร้าสินค้าและขั้นตอนการสั่งซื้อ (Cart Drawer & Checkout System)
   คุณสมบัติ:
   1. จัดเก็บตะกร้าสินค้าผ่าน localStorage ('farmora_cart_v2')
   2. Auto-inject Drawer DOM รองรับการทำงานได้ทันทีทุกหน้าเว็บ (Root & Subfolders)
   3. Stepper เพิ่ม/ลด/ลบ รายการสินค้า พร้อมคำนวณราคาสด
   4. Free Shipping Bar คำนวณโปรส่งฟรีเมื่อครบ 3,000 บาท (ค่าจัดส่งปกติ 100 บาท)
   5. Checkout Modal ป้อนข้อมูลผู้รับ, ที่อยู่จัดส่ง, เลือกชำระเงิน (โอนเงิน/เก็บปลายทาง)
   6. บันทึกคำสั่งซื้อลงฐานข้อมูล 'farmora_orders_v2' ให้ระบบหลังบ้าน (Backend Admin) ดึงไปจัดการได้ทันที
   7. เชื่อมต่อระบบสั่งซื้อด่วนผ่าน LINE Official พร้อมสรุปรายการสินค้า
   ========================================================================== */

(function (window, document) {
  'use strict';

  const STORAGE_KEY_CART = 'farmora_cart_v2';
  const STORAGE_KEY_ORDERS = 'farmora_orders_v2';
  const FREE_SHIPPING_THRESHOLD = 3000;
  const STANDARD_SHIPPING_FEE = 100;

  // ── Helper: ตรวจจับและปรับ Path ของรูปภาพให้ถูกต้องตามโฟลเดอร์ของหน้า ──
  function resolveCartImg(src) {
    if (!src) return '';
    if (src.startsWith('data:') || src.startsWith('http://') || src.startsWith('https://')) {
      return src;
    }
    const isSubDir = window.location.pathname.includes('/frontend/html/') || 
                     window.location.pathname.includes('\\frontend\\html\\');
    
    let clean = src.replace(/^\.\.\/frontend\//, '')
                   .replace(/^\.\.\//, '')
                   .replace(/^frontend\//, '');
    
    if (isSubDir) {
      return '../' + clean;
    } else {
      return 'frontend/' + clean;
    }
  }

  // ── Core Cart State Management ──
  function getCartItems() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_CART);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn('[FarmoraCart] Error reading cart data:', e);
      return [];
    }
  }

  function saveCartItems(items) {
    try {
      localStorage.setItem(STORAGE_KEY_CART, JSON.stringify(items));
      window.dispatchEvent(new CustomEvent('farmora:cartChanged', { detail: items }));
      updateCartBadge();
    } catch (e) {
      console.error('[FarmoraCart] Error saving cart data:', e);
    }
  }

  // ── Auto-Inject Cart Drawer & Modals HTML ──
  function injectCartDOM() {
    if (document.getElementById('farmora-cart-wrapper')) return;

    const wrapper = document.createElement('div');
    wrapper.id = 'farmora-cart-wrapper';
    wrapper.innerHTML = `
      <!-- Cart Backdrop -->
      <div id="farmora-cart-backdrop" class="farmora-cart-backdrop"></div>

      <!-- Cart Drawer -->
      <aside id="farmora-cart-drawer" class="farmora-cart-drawer" aria-label="ตะกร้าสินค้า">
        <!-- Header -->
        <div class="farmora-cart-header">
          <h3 class="farmora-cart-title">
            <i class="fa-solid fa-bag-shopping"></i>
            <span>ตะกร้าสินค้าของคุณ</span>
            <span id="farmora-cart-badge-count" class="farmora-cart-badge">0</span>
          </h3>
          <button type="button" id="farmora-cart-btn-close" class="farmora-cart-close" aria-label="ปิดตะกร้า">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- Free Shipping Progress -->
        <div class="farmora-shipping-bar">
          <div id="farmora-shipping-text" class="farmora-shipping-text">
            <i class="fa-solid fa-truck-fast"></i>
            <span>ช้อปเพิ่มอีก <strong>฿3,000</strong> เพื่อจัดส่งฟรี!</span>
          </div>
          <div class="farmora-progress-track">
            <div id="farmora-progress-fill" class="farmora-progress-fill"></div>
          </div>
        </div>

        <!-- Body / Items List -->
        <div id="farmora-cart-body" class="farmora-cart-body">
          <!-- Rendered dynamically -->
        </div>

        <!-- Footer / Checkout Summary -->
        <div id="farmora-cart-footer" class="farmora-cart-footer">
          <div class="farmora-summary-row">
            <span>ยอดรวมสินค้า</span>
            <span id="farmora-subtotal-text">฿0</span>
          </div>
          <div class="farmora-summary-row">
            <span>ค่าจัดส่ง</span>
            <span id="farmora-shipping-text-fee">฿0</span>
          </div>
          <div class="farmora-summary-row total">
            <span>ยอดสุทธิทั้งสิ้น</span>
            <span id="farmora-total-text" class="farmora-total-amount">฿0</span>
          </div>

          <div class="farmora-cart-actions">
            <button type="button" id="farmora-btn-to-checkout" class="farmora-btn-checkout">
              <i class="fa-solid fa-credit-card"></i> สั่งซื้อสินค้า (Checkout)
            </button>
            <button type="button" id="farmora-btn-line-checkout" class="farmora-btn-line-order">
              <i class="fa-brands fa-line"></i> สั่งซื้อด่วนผ่าน LINE
            </button>
            <button type="button" id="farmora-btn-clear-cart" class="farmora-cart-clear-link">
              <i class="fa-regular fa-trash-can"></i> ล้างสินค้าทั้งหมดในตะกร้า
            </button>
          </div>
        </div>
      </aside>

      <!-- Checkout Modal -->
      <div id="farmora-checkout-modal-overlay" class="farmora-modal-overlay">
        <div class="farmora-checkout-modal">
          <div class="farmora-modal-header">
            <h3><i class="fa-solid fa-file-invoice-dollar"></i> กรอกข้อมูลจัดส่งและชำระเงิน</h3>
            <button type="button" id="farmora-checkout-close" class="farmora-modal-close" aria-label="ปิด">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <form id="farmora-checkout-form" class="farmora-modal-body">
            <div class="farmora-form-section-title">
              <i class="fa-solid fa-user-check"></i> ข้อมูลผู้รับสินค้า
            </div>
            <div class="farmora-form-row">
              <div class="farmora-form-group">
                <label for="checkout-name">ชื่อ-นามสกุล <span class="required">*</span></label>
                <input type="text" id="checkout-name" class="farmora-form-control" placeholder="เช่น คุณสมศักดิ์ ปลูกผักดี" required>
              </div>
              <div class="farmora-form-group">
                <label for="checkout-phone">เบอร์โทรศัพท์ <span class="required">*</span></label>
                <input type="tel" id="checkout-phone" class="farmora-form-control" placeholder="เช่น 081-234-5678" required>
              </div>
            </div>

            <div class="farmora-form-group">
              <label for="checkout-line">LINE ID (สำหรับรับเลขพัสดุและใบเสร็จ)</label>
              <input type="text" id="checkout-line" class="farmora-form-control" placeholder="เช่น farmora_customer">
            </div>

            <div class="farmora-form-section-title" style="margin-top: 16px;">
              <i class="fa-solid fa-location-dot"></i> ที่อยู่จัดส่งสินค้า
            </div>
            <div class="farmora-form-group">
              <label for="checkout-address">ที่อยู่โดยละเอียด (บ้านเลขที่, หมู่, ตำบล, อำเภอ, จังหวัด, รหัสไปรษณีย์) <span class="required">*</span></label>
              <textarea id="checkout-address" class="farmora-form-control" placeholder="ระบุบ้านเลขที่ ซอย ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์" required></textarea>
            </div>
            <div class="farmora-form-group">
              <label for="checkout-note">หมายเหตุเพิ่มเติมถึงผู้จัดส่ง (ถ้ามี)</label>
              <input type="text" id="checkout-note" class="farmora-form-control" placeholder="เช่น ฝากไว้ที่ป้อมยาม, โทรหาก่อนส่ง">
            </div>

            <div class="farmora-form-section-title" style="margin-top: 16px;">
              <i class="fa-solid fa-wallet"></i> วิธีการชำระเงิน
            </div>
            <div class="farmora-payment-options">
              <label class="farmora-payment-card selected" id="label-pay-transfer">
                <input type="radio" name="payment_method" value="bank_transfer" checked>
                <div class="farmora-payment-card-info">
                  <span class="farmora-payment-card-title"><i class="fa-solid fa-building-columns"></i> โอนเงินผ่านธนาคาร</span>
                  <span class="farmora-payment-card-sub">แนบสลิป/แจ้งยืนยันยอด</span>
                </div>
              </label>
              <label class="farmora-payment-card" id="label-pay-cod">
                <input type="radio" name="payment_method" value="cod">
                <div class="farmora-payment-card-info">
                  <span class="farmora-payment-card-title"><i class="fa-solid fa-hand-holding-dollar"></i> เก็บเงินปลายทาง (COD)</span>
                  <span class="farmora-payment-card-sub">ชำระเงินเมื่อรับของที่แปลง</span>
                </div>
              </label>
            </div>

            <!-- Bank Details Box -->
            <div id="farmora-bank-box" class="farmora-bank-box active">
              <div style="font-weight: 600; color: #006837; margin-bottom: 4px;">
                <i class="fa-solid fa-circle-info"></i> บัญชีสำหรับโอนเงิน:
              </div>
              <div><strong>ธนาคารกสิกรไทย (KBANK)</strong></div>
              <div>ชื่อบัญชี: <strong>บริษัท ฟาร์โมรา (ประเทศไทย) จำกัด</strong></div>
              <div>เลขที่บัญชี: <strong>123-4-56789-0</strong></div>
              <div style="font-size: 0.8rem; color: #666; margin-top: 4px;">
                * เมื่อสั่งซื้อเสร็จสิ้น เจ้าหน้าที่จะติดต่อยืนยันยอดหรือท่านสามารถส่งสลิปผ่านทาง LINE ได้ทันที
              </div>
            </div>

            <!-- Order Summary Preview in Modal -->
            <div class="farmora-checkout-summary-box">
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 0.88rem; color: #555;">
                <span>จำนวนสินค้า:</span>
                <span id="modal-summary-count">0 ชิ้น</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 0.88rem; color: #555;">
                <span>ค่าจัดส่ง:</span>
                <span id="modal-summary-shipping">฿0</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 1.05rem; font-weight: 700; color: #092615; border-top: 1px dashed #ccd; padding-top: 6px; margin-top: 6px;">
                <span>ยอดชำระทั้งสิ้น:</span>
                <span id="modal-summary-total" style="color: #006837;">฿0</span>
              </div>
            </div>

            <div class="farmora-modal-footer">
              <button type="button" id="farmora-checkout-cancel" class="farmora-btn-cancel">ยกเลิก</button>
              <button type="submit" id="farmora-checkout-submit" class="farmora-btn-submit-order">
                <i class="fa-solid fa-check"></i> ยืนยันการสั่งซื้อ
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Success Modal -->
      <div id="farmora-success-modal-overlay" class="farmora-modal-overlay">
        <div class="farmora-checkout-modal" style="width: 480px;">
          <div class="farmora-modal-header" style="background: linear-gradient(135deg, #00a64c, #006837);">
            <h3><i class="fa-solid fa-circle-check"></i> สั่งซื้อสำเร็จเรียบร้อย!</h3>
            <button type="button" id="farmora-success-close" class="farmora-modal-close" aria-label="ปิด">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <div class="farmora-modal-body farmora-success-content">
            <div class="farmora-success-icon">
              <i class="fa-solid fa-check"></i>
            </div>
            <h3 style="margin: 0 0 6px 0; color: #092615; font-size: 1.3rem;">ขอบคุณสำหรับคำสั่งซื้อของคุณ</h3>
            <p style="color: #666; font-size: 0.92rem; margin: 0;">ระบบได้บันทึกคำสั่งซื้อเข้าสู่ระบบเรียบร้อยแล้ว</p>
            <div class="farmora-success-order-id" id="farmora-success-order-id">ORD-2026-XXXX</div>
            
            <div id="farmora-success-details" style="background: #fdfdfd; border: 1px solid #e1ebe2; border-radius: 10px; padding: 14px; text-align: left; font-size: 0.88rem; margin-bottom: 20px;">
              <!-- Dynamic order details -->
            </div>

            <div style="display: flex; flex-direction: column; gap: 10px;">
              <a id="farmora-success-line-btn" href="#" target="_blank" class="farmora-btn-line-order" style="text-decoration: none;">
                <i class="fa-brands fa-line"></i> แจ้งชำระเงิน / ติดต่อผ่าน LINE
              </a>
              <button type="button" id="farmora-success-done-btn" class="farmora-btn-checkout" style="justify-content: center;">
                <i class="fa-solid fa-basket-shopping"></i> กลับไปเลือกซื้อสินค้าต่อ
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Toast Container -->
      <div id="farmora-toast-container" class="farmora-toast-container"></div>
    `;

    document.body.appendChild(wrapper);
    bindCartEvents();
  }

  // ── Toast Notification ──
  function showToast(message, icon = 'fa-solid fa-circle-check') {
    const container = document.getElementById('farmora-toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'farmora-toast';
    toast.innerHTML = `<i class="${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(15px)';
      setTimeout(() => toast.remove(), 300);
    }, 2600);
  }

  // ── Update Navbar & Drawer Badge ──
  function updateCartBadge() {
    const items = getCartItems();
    const totalCount = items.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);

    // Navbar Badge
    const navBadge = document.getElementById('cart-count');
    if (navBadge) {
      if (totalCount > 0) {
        navBadge.textContent = totalCount > 99 ? '99+' : totalCount;
        navBadge.style.display = 'flex';
      } else {
        navBadge.textContent = '0';
        navBadge.style.display = 'none';
      }
    }

    // Drawer Header Badge
    const drawerBadge = document.getElementById('farmora-cart-badge-count');
    if (drawerBadge) {
      drawerBadge.textContent = totalCount;
    }
  }

  // ── Render Items Inside Cart Drawer ──
  function renderCartDrawer() {
    const items = getCartItems();
    const body = document.getElementById('farmora-cart-body');
    const footer = document.getElementById('farmora-cart-footer');
    const subtotalText = document.getElementById('farmora-subtotal-text');
    const shippingText = document.getElementById('farmora-shipping-text-fee');
    const totalText = document.getElementById('farmora-total-text');
    const shippingProgressText = document.getElementById('farmora-shipping-text');
    const progressFill = document.getElementById('farmora-progress-fill');

    if (!body) return;

    if (items.length === 0) {
      body.innerHTML = `
        <div class="farmora-cart-empty">
          <div class="farmora-cart-empty-icon">
            <i class="fa-solid fa-cart-arrow-down"></i>
          </div>
          <h4>ยังไม่มีสินค้าในตะกร้า</h4>
          <p>เลือกซื้อปุ๋ย สารกำจัดศัตรูพืช และเมล็ดพันธุ์คุณภาพสูงจาก Farmora ได้เลยตอนนี้</p>
          <a href="products.html" class="farmora-btn-shop-now" id="farmora-empty-btn-shop">
            <i class="fa-solid fa-seedling"></i> เลือกซื้อสินค้าทันที
          </a>
        </div>
      `;
      if (footer) footer.style.display = 'none';

      // Progress bar 0%
      if (progressFill) progressFill.style.width = '0%';
      if (shippingProgressText) {
        shippingProgressText.classList.remove('achieved');
        shippingProgressText.innerHTML = `
          <i class="fa-solid fa-truck-fast"></i>
          <span>ช้อปเพิ่มอีก <strong>฿${FREE_SHIPPING_THRESHOLD.toLocaleString('th-TH')}</strong> เพื่อจัดส่งฟรี!</span>
        `;
      }
      return;
    }

    // มีสินค้าในตะกร้า
    if (footer) footer.style.display = 'block';

    let subtotal = 0;
    body.innerHTML = items.map((item, index) => {
      const price = Number(item.price) || 0;
      const qty = Number(item.qty) || 1;
      const lineTotal = price * qty;
      subtotal += lineTotal;

      const imgSrc = resolveCartImg(item.image || 'frontend/images/product-fertilizer.jpg');

      return `
        <div class="farmora-cart-item" data-id="${item.id}">
          <img src="${imgSrc}" alt="${item.name}" class="farmora-cart-item-img" onerror="this.src='https://placehold.co/100x100?text=Farmora'">
          
          <div class="farmora-cart-item-info">
            <h4 class="farmora-cart-item-title" title="${item.name}">${item.name}</h4>
            <div class="farmora-cart-item-unitprice">
              <span>฿${price.toLocaleString('th-TH')}</span> ${item.unit || ''}
            </div>
            
            <div class="farmora-qty-stepper">
              <button type="button" class="farmora-qty-btn btn-minus" data-id="${item.id}" ${qty <= 1 ? 'disabled' : ''}>
                <i class="fa-solid fa-minus"></i>
              </button>
              <input type="text" class="farmora-qty-input" value="${qty}" readonly>
              <button type="button" class="farmora-qty-btn btn-plus" data-id="${item.id}">
                <i class="fa-solid fa-plus"></i>
              </button>
            </div>
          </div>

          <div class="farmora-cart-item-right">
            <button type="button" class="farmora-cart-item-remove" data-id="${item.id}" title="ลบสินค้านี้">
              <i class="fa-regular fa-trash-can"></i>
            </button>
            <div class="farmora-cart-item-total">฿${lineTotal.toLocaleString('th-TH')}</div>
          </div>
        </div>
      `;
    }).join('');

    // คำนวณค่าส่ง & ยอดสุทธิ
    const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
    const shippingFee = isFreeShipping ? 0 : STANDARD_SHIPPING_FEE;
    const netTotal = subtotal + shippingFee;

    if (subtotalText) subtotalText.textContent = `฿${subtotal.toLocaleString('th-TH')}`;
    if (shippingText) {
      shippingText.innerHTML = isFreeShipping 
        ? '<span class="farmora-shipping-free-tag"><i class="fa-solid fa-check"></i> จัดส่งฟรี</span>' 
        : `฿${shippingFee.toLocaleString('th-TH')}`;
    }
    if (totalText) totalText.textContent = `฿${netTotal.toLocaleString('th-TH')}`;

    // Free shipping bar calculation
    if (progressFill && shippingProgressText) {
      const pct = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
      progressFill.style.width = `${pct}%`;

      if (isFreeShipping) {
        shippingProgressText.classList.add('achieved');
        shippingProgressText.innerHTML = `
          <i class="fa-solid fa-circle-check" style="color: #00a64c;"></i>
          <span><strong>ยินดีด้วย! คุณได้รับสิทธิ์จัดส่งฟรีเรียบร้อยแล้ว</strong></span>
        `;
      } else {
        shippingProgressText.classList.remove('achieved');
        const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
        shippingProgressText.innerHTML = `
          <i class="fa-solid fa-truck-fast"></i>
          <span>ช้อปเพิ่มอีก <strong>฿${remaining.toLocaleString('th-TH')}</strong> เพื่อจัดส่งฟรี! (ครบ ฿${FREE_SHIPPING_THRESHOLD.toLocaleString('th-TH')})</span>
        `;
      }
    }
  }

  // ── Drawer Open / Close Controls ──
  function openDrawer() {
    injectCartDOM();
    renderCartDrawer();
    const backdrop = document.getElementById('farmora-cart-backdrop');
    const drawer = document.getElementById('farmora-cart-drawer');
    if (backdrop && drawer) {
      backdrop.classList.add('active');
      drawer.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeDrawer() {
    const backdrop = document.getElementById('farmora-cart-backdrop');
    const drawer = document.getElementById('farmora-cart-drawer');
    if (backdrop && drawer) {
      backdrop.classList.remove('active');
      drawer.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  // ── Checkout Modal Controls ──
  function openCheckout() {
    const items = getCartItems();
    if (items.length === 0) {
      showToast('กรุณาเลือกสินค้าลงตะกร้าก่อนทำการสั่งซื้อ', 'fa-solid fa-triangle-exclamation');
      return;
    }

    closeDrawer();

    const overlay = document.getElementById('farmora-checkout-modal-overlay');
    if (!overlay) return;

    // คำนวณสรุปในโมดอล
    const subtotal = items.reduce((sum, item) => sum + ((Number(item.price) || 0) * (Number(item.qty) || 1)), 0);
    const totalCount = items.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
    const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
    const netTotal = subtotal + shippingFee;

    const countEl = document.getElementById('modal-summary-count');
    const shippingEl = document.getElementById('modal-summary-shipping');
    const totalEl = document.getElementById('modal-summary-total');

    if (countEl) countEl.textContent = `${totalCount} ชิ้น (${items.length} รายการ)`;
    if (shippingEl) shippingEl.textContent = shippingFee === 0 ? 'ฟรี (โปรโมชั่น)' : `฿${shippingFee.toLocaleString('th-TH')}`;
    if (totalEl) totalEl.textContent = `฿${netTotal.toLocaleString('th-TH')}`;

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeCheckout() {
    const overlay = document.getElementById('farmora-checkout-modal-overlay');
    if (overlay) {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  // ── Submit Order ──
  function submitCheckout(e) {
    e.preventDefault();

    const items = getCartItems();
    if (items.length === 0) return;

    const name = document.getElementById('checkout-name')?.value.trim();
    const phone = document.getElementById('checkout-phone')?.value.trim();
    const lineId = document.getElementById('checkout-line')?.value.trim() || '-';
    const address = document.getElementById('checkout-address')?.value.trim();
    const note = document.getElementById('checkout-note')?.value.trim() || '-';
    const payMethodEl = document.querySelector('input[name="payment_method"]:checked');
    const payMethod = payMethodEl ? payMethodEl.value : 'bank_transfer';

    if (!name || !phone || !address) {
      alert('กรุณากรอกชื่อ เบอร์โทรศัพท์ และที่อยู่จัดส่งให้ครบถ้วน');
      return;
    }

    const subtotal = items.reduce((sum, item) => sum + ((Number(item.price) || 0) * (Number(item.qty) || 1)), 0);
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
    const total = subtotal + shipping;

    const orderId = `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = {
      id: orderId,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      customer: {
        name,
        phone,
        lineId,
        address
      },
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        price: Number(item.price) || 0,
        unit: item.unit || '',
        qty: Number(item.qty) || 1,
        total: (Number(item.price) || 0) * (Number(item.qty) || 1),
        image: item.image || ''
      })),
      subtotal,
      shipping,
      total,
      paymentMethod: payMethod,
      paymentMethodName: payMethod === 'cod' ? 'เก็บเงินปลายทาง (COD)' : 'โอนเงินผ่านธนาคาร',
      paymentStatus: 'pending',
      status: 'pending',
      statusName: 'รอดำเนินการ',
      note: note,
      createdAt: new Date().toISOString()
    };

    // บันทึกลงฐานข้อมูล FarmoraDataStore หรือ localStorage
    try {
      if (window.FarmoraDataStore && window.FarmoraDataStore.Orders) {
        window.FarmoraDataStore.Orders.save(newOrder);
      } else {
        const ordersRaw = localStorage.getItem(STORAGE_KEY_ORDERS);
        const ordersList = ordersRaw ? JSON.parse(ordersRaw) : [];
        ordersList.unshift(newOrder);
        localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(ordersList));
        window.dispatchEvent(new CustomEvent('farmora:dataChanged', { detail: { key: STORAGE_KEY_ORDERS } }));
      }
    } catch (err) {
      console.error('Error saving order:', err);
    }

    // ล้างตะกร้า
    saveCartItems([]);
    renderCartDrawer();
    closeCheckout();

    // แสดง Success Modal
    showSuccessModal(newOrder);
  }

  function showSuccessModal(order) {
    const overlay = document.getElementById('farmora-success-modal-overlay');
    const orderIdEl = document.getElementById('farmora-success-order-id');
    const detailsEl = document.getElementById('farmora-success-details');
    const lineBtn = document.getElementById('farmora-success-line-btn');

    if (orderIdEl) orderIdEl.textContent = order.id;

    if (detailsEl) {
      detailsEl.innerHTML = `
        <div style="margin-bottom: 6px;"><strong>ผู้รับ:</strong> ${order.customer.name} (${order.customer.phone})</div>
        <div style="margin-bottom: 6px;"><strong>ที่อยู่:</strong> ${order.customer.address}</div>
        <div style="margin-bottom: 6px;"><strong>การชำระเงิน:</strong> ${order.paymentMethodName}</div>
        <div style="margin-bottom: 6px;"><strong>ยอดชำระ:</strong> <span style="color: #006837; font-weight: 700; font-size: 1.05rem;">฿${order.total.toLocaleString('th-TH')}</span></div>
        <div style="font-size: 0.8rem; color: #777;">* เจ้าหน้าที่จะโทรติดต่อยืนยันก่อนจัดส่งสินค้า</div>
      `;
    }

    if (lineBtn) {
      const lineMsg = encodeURIComponent(
        `แจ้งคำสั่งซื้อ Farmora Official\n` +
        `รหัส: ${order.id}\n` +
        `คุณ: ${order.customer.name}\n` +
        `ยอดรวม: ฿${order.total.toLocaleString('th-TH')}\n` +
        `วิธีชำระ: ${order.paymentMethodName}`
      );
      lineBtn.href = `https://line.me/R/msg/text/?${lineMsg}`;
    }

    if (overlay) {
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  // ── Quick LINE Order ──
  function orderViaLine() {
    const items = getCartItems();
    if (items.length === 0) {
      showToast('กรุณาเลือกสินค้าลงตะกร้าก่อนสั่งซื้อผ่าน LINE', 'fa-solid fa-triangle-exclamation');
      return;
    }

    let msg = `สวัสดีครับ/ค่ะ ต้องการสั่งซื้อสินค้าจาก Farmora Official ดังนี้ครับ:\n\n`;
    let subtotal = 0;
    items.forEach((item, idx) => {
      const itemTotal = (Number(item.price) || 0) * (Number(item.qty) || 1);
      subtotal += itemTotal;
      msg += `${idx + 1}. ${item.name} (${item.qty} ชิ้น) - ฿${itemTotal.toLocaleString('th-TH')}\n`;
    });

    const isFree = subtotal >= FREE_SHIPPING_THRESHOLD;
    const shipping = isFree ? 0 : STANDARD_SHIPPING_FEE;
    const total = subtotal + shipping;

    msg += `\nยอดรวมสินค้า: ฿${subtotal.toLocaleString('th-TH')}`;
    msg += `\nค่าจัดส่ง: ${isFree ? 'ส่งฟรี (โปรโมชั่น)' : '฿100'}`;
    msg += `\nยอดสุทธิทั้งสิ้น: ฿${total.toLocaleString('th-TH')}`;
    msg += `\n\nรบกวนขอเลขบัญชีหรือยืนยันการจัดส่งปลายทางด้วยครับ ขอบคุณครับ`;

    const encoded = encodeURIComponent(msg);
    window.open(`https://line.me/R/msg/text/?${encoded}`, '_blank');
  }

  // ── Event Handlers Binding ──
  function bindCartEvents() {
    // Backdrop click
    const backdrop = document.getElementById('farmora-cart-backdrop');
    if (backdrop) backdrop.addEventListener('click', closeDrawer);

    // Close button in drawer
    const closeBtn = document.getElementById('farmora-cart-btn-close');
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

    // Stepper & Remove clicks inside drawer
    const body = document.getElementById('farmora-cart-body');
    if (body) {
      body.addEventListener('click', (e) => {
        const plusBtn = e.target.closest('.btn-plus');
        const minusBtn = e.target.closest('.btn-minus');
        const removeBtn = e.target.closest('.farmora-cart-item-remove');
        const shopNowBtn = e.target.closest('#farmora-empty-btn-shop');

        if (plusBtn) {
          const id = plusBtn.dataset.id;
          updateItemQty(id, 1);
        } else if (minusBtn) {
          const id = minusBtn.dataset.id;
          updateItemQty(id, -1);
        } else if (removeBtn) {
          const id = removeBtn.dataset.id;
          removeItem(id);
        } else if (shopNowBtn) {
          closeDrawer();
        }
      });
    }

    // Clear cart button
    const clearBtn = document.getElementById('farmora-btn-clear-cart');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('คุณต้องการลบสินค้าทั้งหมดออกจากตะกร้าใช่หรือไม่?')) {
          saveCartItems([]);
          renderCartDrawer();
          showToast('ล้างสินค้าในตะกร้าเรียบร้อยแล้ว', 'fa-regular fa-trash-can');
        }
      });
    }

    // Checkout button in drawer
    const checkoutBtn = document.getElementById('farmora-btn-to-checkout');
    if (checkoutBtn) checkoutBtn.addEventListener('click', openCheckout);

    // LINE checkout button in drawer
    const lineCheckoutBtn = document.getElementById('farmora-btn-line-checkout');
    if (lineCheckoutBtn) lineCheckoutBtn.addEventListener('click', orderViaLine);

    // Checkout Modal close & cancel
    const checkoutClose = document.getElementById('farmora-checkout-close');
    const checkoutCancel = document.getElementById('farmora-checkout-cancel');
    if (checkoutClose) checkoutClose.addEventListener('click', closeCheckout);
    if (checkoutCancel) checkoutCancel.addEventListener('click', closeCheckout);

    // Payment method selection change
    const payRadios = document.querySelectorAll('input[name="payment_method"]');
    const bankBox = document.getElementById('farmora-bank-box');
    const labelTransfer = document.getElementById('label-pay-transfer');
    const labelCod = document.getElementById('label-pay-cod');

    payRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        if (e.target.value === 'bank_transfer') {
          if (bankBox) bankBox.classList.add('active');
          if (labelTransfer) labelTransfer.classList.add('selected');
          if (labelCod) labelCod.classList.remove('selected');
        } else {
          if (bankBox) bankBox.classList.remove('active');
          if (labelCod) labelCod.classList.add('selected');
          if (labelTransfer) labelTransfer.classList.remove('selected');
        }
      });
    });

    // Form submit
    const checkoutForm = document.getElementById('farmora-checkout-form');
    if (checkoutForm) checkoutForm.addEventListener('submit', submitCheckout);

    // Success Modal close
    const successClose = document.getElementById('farmora-success-close');
    const successDone = document.getElementById('farmora-success-done-btn');
    const successOverlay = document.getElementById('farmora-success-modal-overlay');

    const handleCloseSuccess = () => {
      if (successOverlay) {
        successOverlay.classList.remove('active');
        document.body.style.overflow = '';
      }
    };
    if (successClose) successClose.addEventListener('click', handleCloseSuccess);
    if (successDone) successDone.addEventListener('click', handleCloseSuccess);

    // ESC key closes modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeDrawer();
        closeCheckout();
        handleCloseSuccess();
      }
    });
  }

  // ── Public Cart Actions ──
  function addItem(product, qty = 1) {
    if (!product || !product.id) return;

    injectCartDOM();
    const items = getCartItems();
    const parsedQty = Math.max(1, parseInt(qty, 10) || 1);

    const existingIndex = items.findIndex(item => item.id === product.id);
    if (existingIndex >= 0) {
      items[existingIndex].qty = (items[existingIndex].qty || 1) + parsedQty;
    } else {
      items.push({
        id: product.id,
        name: product.name,
        price: Number(product.price) || 0,
        unit: product.unit || '',
        image: product.image || '',
        cat: product.cat || '',
        qty: parsedQty
      });
    }

    saveCartItems(items);
    renderCartDrawer();
    showToast(`เพิ่ม "${product.name}" (จำนวน ${parsedQty}) ลงตะกร้าแล้ว`);

    // Effect บน cart icon ใน navbar
    const navBadge = document.getElementById('cart-count');
    if (navBadge) {
      navBadge.style.transform = 'scale(1.35)';
      setTimeout(() => { navBadge.style.transform = 'scale(1)'; }, 250);
    }
  }

  function updateItemQty(productId, delta) {
    const items = getCartItems();
    const index = items.findIndex(item => item.id === productId);
    if (index >= 0) {
      const newQty = (items[index].qty || 1) + delta;
      if (newQty <= 0) {
        items.splice(index, 1);
      } else {
        items[index].qty = newQty;
      }
      saveCartItems(items);
      renderCartDrawer();
    }
  }

  function removeItem(productId) {
    const items = getCartItems().filter(item => item.id !== productId);
    saveCartItems(items);
    renderCartDrawer();
    showToast('ลบสินค้าออกจากตะกร้าเรียบร้อยแล้ว', 'fa-regular fa-trash-can');
  }

  // ── Global Event Listeners & Cart Icon Hook ──
  function initCart() {
    injectCartDOM();
    updateCartBadge();

    // Hook cart icon on click
    document.addEventListener('click', (e) => {
      const cartTrigger = e.target.closest('#cart-icon, [data-action="open-cart"], .cart-open-btn');
      if (cartTrigger) {
        e.preventDefault();
        openDrawer();
      }
    });

    // Listen to cross-tab storage changes
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY_CART) {
        updateCartBadge();
        const drawer = document.getElementById('farmora-cart-drawer');
        if (drawer && drawer.classList.contains('active')) {
          renderCartDrawer();
        }
      }
    });

    window.addEventListener('farmora:cartChanged', () => {
      updateCartBadge();
      const drawer = document.getElementById('farmora-cart-drawer');
      if (drawer && drawer.classList.contains('active')) {
        renderCartDrawer();
      }
    });
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCart);
  } else {
    initCart();
  }

  // Export to Global Scope
  window.FarmoraCart = {
    getItems: getCartItems,
    addItem: addItem,
    updateQty: updateItemQty,
    removeItem: removeItem,
    clearCart: () => { saveCartItems([]); renderCartDrawer(); },
    openDrawer: openDrawer,
    closeDrawer: closeDrawer,
    openCheckout: openCheckout,
    closeCheckout: closeCheckout,
    orderViaLine: orderViaLine,
    showToast: showToast
  };

  // Legacy fallback
  window.addToCart = function (product, qty) {
    if (product) {
      addItem(product, qty || 1);
    } else {
      openDrawer();
    }
  };

})(window, document);
