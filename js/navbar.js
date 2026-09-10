/**
 * ==========================================================================
 * 🌿 Farmora Official — Navbar Script (navbar.js)
 * ==========================================================================
 * ควบคุมการทำงานของ Navbar:
 * 1. เมนู Hamburger สำหรับหน้าจอมือถือ/แท็บเล็ต
 * 2. การเปิด/ปิดเมนู Dropdown ทั้งแบบ Hover บนคอมพิวเตอร์ และแบบคลิก/สัมผัสบนมือถือ
 * 3. ปิดเมนูอัตโนมัติเมื่อคลิกนอกพื้นที่ Navbar
 * ==========================================================================
 */

(function () {
  'use strict';

  function initNavbar() {
    const hamburgerBtn = document.getElementById("hamburger-btn");
    const mainMenu     = document.getElementById("main-menu");
    const dropdowns    = document.querySelectorAll(".dropdown");

    // ── 1. Hamburger Toggle บนมือถือ ──────────────────────────
    if (hamburgerBtn && mainMenu) {
      hamburgerBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = mainMenu.classList.toggle("open");
        const icon = hamburgerBtn.querySelector("i");
        if (icon) {
          icon.classList.toggle("fa-bars", !isOpen);
          icon.classList.toggle("fa-xmark", isOpen);
        }
      });
    }

    // ── 2. ควบคุม Dropdown (ข่าวสารและกิจกรรม, สินค้า) ─────────
    dropdowns.forEach(dropdown => {
      const toggleLink = dropdown.querySelector(":scope > a");
      const dropdownMenu = dropdown.querySelector(".dropdown-menu");

      if (!toggleLink || !dropdownMenu) return;

      // เมื่อคลิกที่หัวข้อเมนูหลักของ Dropdown (ข่าวสารและกิจกรรม ▾ หรือ สินค้า ▾)
      toggleLink.addEventListener("click", (e) => {
        // ให้คลิกเพื่อเปิด/ปิดเมนูย่อยให้เห็นชัดเจนเสมอ ไม่กระโดดเปลี่ยนหน้าหนี
        e.preventDefault();
        e.stopPropagation();
        const wasOpen = dropdown.classList.contains("open");

        // ปิด dropdown อื่นๆ ก่อน
        dropdowns.forEach(d => {
          if (d !== dropdown) d.classList.remove("open");
        });

        dropdown.classList.toggle("open", !wasOpen);
      });

      // ป้องกันการปิดเมื่อคลิกข้างในกล่อง dropdown menu
      dropdownMenu.addEventListener("click", (e) => {
        e.stopPropagation();
        // ถ้าคลิกลิงก์ย่อย ปิดเมนู hamburger บนมือถือ
        if (e.target.closest("a")) {
          dropdown.classList.remove("open");
          if (mainMenu && mainMenu.classList.contains("open")) {
            mainMenu.classList.remove("open");
            const icon = hamburgerBtn ? hamburgerBtn.querySelector("i") : null;
            if (icon) {
              icon.classList.add("fa-bars");
              icon.classList.remove("fa-xmark");
            }
          }
        }
      });
    });

    // ── 3. คลิกนอก Navbar ให้ปิดทุกอย่าง ───────────────────────
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".navbar")) {
        dropdowns.forEach(d => d.classList.remove("open"));
        if (mainMenu && mainMenu.classList.contains("open")) {
          mainMenu.classList.remove("open");
          const icon = hamburgerBtn ? hamburgerBtn.querySelector("i") : null;
          if (icon) {
            icon.classList.add("fa-bars");
            icon.classList.remove("fa-xmark");
          }
        }
      }
    });
  }

  // รันเมื่อ DOM พร้อม
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initNavbar);
  } else {
    initNavbar();
  }
})();
