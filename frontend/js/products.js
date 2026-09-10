/**
 * ==========================================================================
 * 🌿 Farmora Official — Products JS (products.js)
 * ==========================================================================
 * ฐานข้อมูลและฟังก์ชันการทำงานของหน้าสินค้า:
 * 1. ฐานข้อมูลสินค้าการเกษตรครบวงจร 28 รายการ (8 หมวดหมู่)
 * 2. การกรองแบบ Real-time ตาม หมวดหมู่, คำค้นหา, ช่วงราคา, และชนิดพืช
 * 3. การจัดเรียงลำดับ (ราคา ต่ำ-สูง, สูง-ต่ำ, ชื่อ A-Z)
 * 4. สลับมุมมอง Grid View และ List View
 * 5. ตรวจจับ URL parameter (?cat=fertilizer, ?cat=organic, ฯลฯ)
 * 6. ป๊อปอัปดูรายละเอียดสินค้าเชิงลึก (Product Detail Modal)
 * 7. ระบบเพิ่มสินค้าลงในตะกร้า พร้อม Toast แจ้งเตือนและนับยอดบน Navbar
 * ==========================================================================
 */

(function () {
  'use strict';

  // ── ฐานข้อมูลสินค้า Farmora ครบ 28 รายการ ─────────────────
  const PRODUCTS_DATA = [
    /* ── หมวด 1: ปุ๋ยเคมี (fertilizer) ── */
    {
      id: 'p1',
      name: 'FarmoGrow Plus 16-16-16',
      cat: 'fertilizer',
      catName: 'ปุ๋ยเคมี',
      price: 650,
      unit: '/ถุง 25 กก.',
      badge: 'new',
      badgeText: '✨ ใหม่',
      desc: 'ปุ๋ยเคมีสูตรสมดุล NPK เหมาะสำหรับพืชทุกชนิด บำรุงการเจริญเติบโต ลำต้น ราก และใบ ช่วยเพิ่มผลผลิต',
      fullDesc: 'FarmoGrow Plus 16-16-16 ปุ๋ยเคมีเชิงผสมสูตรมาตรฐานระดับพรีเมียม ให้ธาตุอาหารหลัก ไนโตรเจน-ฟอสฟอรัส-โพแทสเซียม ครบถ้วนในสัดส่วนที่เท่ากัน เม็ดปุ๋ยละลายน้ำได้เร็ว รากพืชดูดซึมไปใช้ได้ทันที เหมาะสำหรับรองพื้นหรือใส่บำรุงพืชทุกระยะการเจริญเติบโต',
      crops: ['rice', 'cassava', 'sugarcane', 'fruit', 'vegetable'],
      cropNames: ['ข้าว', 'มันสำปะหลัง', 'อ้อย', 'ไม้ผล', 'ผักทั่วไป'],
      image: '../images/product-fertilizer.jpg'
    },
    {
      id: 'p2',
      name: 'Super Rain 46-0-0 ยูเรียเกล็ดขาว',
      cat: 'fertilizer',
      catName: 'ปุ๋ยเคมี',
      price: 580,
      unit: '/ถุง 25 กก.',
      badge: 'hot',
      badgeText: '🔥 ขายดี',
      desc: 'ปุ๋ยไนโตรเจนสูง เร่งการเจริญเติบโตของใบ ต้น และกิ่งก้าน เหมาะสำหรับข้าวระยะแตกกอ',
      fullDesc: 'Super Rain 46-0-0 ปุ๋ยยูเรียเกล็ดขาวคุณภาพมาตรฐานสากล ไนโตรเจนบริสุทธิ์สูงถึง 46% ละลายน้ำได้หมดจด 100% เร่งให้พืชเจริญเติบโตทางใบและลำต้นอย่างรวดเร็ว ใบเขียวเข้ม สังเคราะห์แสงได้ดีเยี่ยม เหมาะกับนาข้าว ข้าวโพด และพืชไร่',
      crops: ['rice', 'corn', 'sugarcane'],
      cropNames: ['ข้าว', 'ข้าวโพด', 'อ้อย'],
      image: '../images/product-fertilizer.jpg'
    },
    {
      id: 'p3',
      name: 'Farmora Cal-Mag แคลเซียมแมกนีเซียม',
      cat: 'fertilizer',
      catName: 'ปุ๋ยเคมี',
      price: 720,
      unit: '/ถุง 25 กก.',
      badge: 'star',
      badgeText: '⭐ แนะนำ',
      desc: 'ปุ๋ยเสริมแคลเซียมและแมกนีเซียม เสริมความแข็งแกร่งของผนังเซลล์ ป้องกันผลแตกและขั้วหลุดร่วง',
      fullDesc: 'Farmora Cal-Mag เสริมสร้างความแข็งแรงของเซลล์พืช ช่วยให้ใบพืชหนาเขียวเข้ม ป้องกันปัญหาไส้กลวงในผัก ผลแตกในผลไม้ และช่วยให้ผลผลิตเก็บรักษาได้นานขึ้น ทนทานต่อการขนส่ง',
      crops: ['fruit', 'vegetable'],
      cropNames: ['ไม้ผล', 'ผักทั่วไป'],
      image: '../images/product-fertilizer.jpg'
    },
    {
      id: 'p4',
      name: 'Farmora Potash 0-0-60 โพแทสเซียมคลอไรด์',
      cat: 'fertilizer',
      catName: 'ปุ๋ยเคมี',
      price: 890,
      unit: '/ถุง 25 กก.',
      desc: 'ปุ๋ยเร่งน้ำหนัก เพิ่มความหวาน สีสันสวยงาม และช่วยให้เมล็ดเต่ง รวงใหญ่',
      fullDesc: 'Farmora Potash 0-0-60 ปุ๋ยโพแทสเซียมเข้มข้นพิเศษ เหมาะสำหรับใส่ในระยะสร้างแป้งและน้ำตาล เช่น ข้าวระยะตั้งท้องออกรวง อ้อยก่อนตัด และไม้ผลระยะก่อนเก็บเกี่ยว',
      crops: ['rice', 'sugarcane', 'fruit', 'cassava'],
      cropNames: ['ข้าว', 'อ้อย', 'ไม้ผล', 'มันสำปะหลัง'],
      image: '../images/product-fertilizer.jpg'
    },

    /* ── หมวด 2: ปุ๋ยอินทรีย์ (organic) ── */
    {
      id: 'p5',
      name: 'Farmora Biomax ปุ๋ยอินทรีย์ชีวภาพ',
      cat: 'organic',
      catName: 'ปุ๋ยอินทรีย์',
      price: 350,
      unit: '/ถุง 50 กก.',
      badge: 'eco',
      badgeText: '🌿 Organic',
      desc: 'ปุ๋ยอินทรีย์ชีวภาพมูลค้างคาวแท้ เสริมฮิวมัส ฟื้นฟูดิน ปลอดภัยตามมาตรฐานเกษตรอินทรีย์',
      fullDesc: 'Farmora Biomax ผลิตจากมูลค้างคาวและอินทรียวัตถุคุณภาพสูง ผ่านการหมักด้วยจุลินทรีย์ที่มีประโยชน์ ช่วยฟื้นฟูดินเสีย ปรับโครงสร้างดินให้ร่วนซุย พืชกินปุ๋ยได้ดียิ่งขึ้น ผลผลิตปลอดภัยไร้สารเคมีตกค้าง',
      crops: ['vegetable', 'fruit', 'rice'],
      cropNames: ['ผักทั่วไป', 'ไม้ผล', 'ข้าว'],
      image: '../images/product-soil.jpg'
    },
    {
      id: 'p6',
      name: 'Compost Plus ปุ๋ยหมักอินทรีย์เติมอากาศ',
      cat: 'organic',
      catName: 'ปุ๋ยอินทรีย์',
      price: 420,
      unit: '/ถุง 50 กก.',
      badge: 'eco',
      badgeText: '🌿 Organic',
      desc: 'ปุ๋ยหมักเติมอากาศย่อยสลายสมบูรณ์ เพิ่มอินทรียวัตถุในดิน อุ้มน้ำและกักเก็บธาตุอาหาร',
      fullDesc: 'Compost Plus ผ่านกระบวนการหมักแบบเติมอากาศที่ได้มาตรฐาน ปราศจากกลิ่นเหม็นและเชื้อราโรคพืช เพิ่มความสมบูรณ์ของหน้าดิน ดินร่วนซุย รากพืชชอนไชง่ายขึ้นอย่างเห็นได้ชัด',
      crops: ['vegetable', 'fruit', 'rubber'],
      cropNames: ['ผักทั่วไป', 'ไม้ผล', 'ยางพารา'],
      image: '../images/product-soil.jpg'
    },
    {
      id: 'p7',
      name: 'Farmora FM-Bio น้ำหมักชีวภาพสูตรเข้มข้น',
      cat: 'organic',
      catName: 'ปุ๋ยอินทรีย์',
      price: 280,
      unit: '/ขวด 1 ลิตร',
      badge: 'eco',
      badgeText: '🌿 Organic',
      desc: 'น้ำหมักชีวภาพจุลินทรีย์มีชีวิต กระตุ้นการแตกราก ฟื้นฟูแปลงหลังเก็บเกี่ยวหรือหลังน้ำท่วม',
      fullDesc: 'FM-Bio อุดมไปด้วยกรดอะมิโนและเอนไซม์จากธรรมชาติ ช่วยย่อยสลายตอซังข้าวและซากพืช กระตุ้นการดูดซึมสารอาหารทางราก ใช้รดโคนต้นหรือผสมน้ำฉีดพ่นทางใบได้',
      crops: ['rice', 'vegetable', 'fruit'],
      cropNames: ['ข้าว', 'ผักทั่วไป', 'ไม้ผล'],
      image: '../images/product-hormone.jpg'
    },
    {
      id: 'p8',
      name: 'Farmora BlackGold ฮิวมิคผงสกัด',
      cat: 'organic',
      catName: 'ปุ๋ยอินทรีย์',
      price: 490,
      unit: '/ถุง 1 กก.',
      badge: 'hot',
      badgeText: '🔥 ขายดี',
      desc: 'โพแทสเซียมฮิวเมตบริสุทธิ์ 85% ละลายน้ำ 100% ปลดปล่อยธาตุอาหารที่ถูกตรึงในดิน',
      fullDesc: 'ฮิวมิคผงเข้มข้น BlackGold ช่วยคลายสภาพดินแข็งและดินดาน เปิดท่อน้ำท่ออาหารของพืช และช่วยให้ปุ๋ยเคมีที่ใส่ลงไปมีประสิทธิภาพสูงขึ้น 2 เท่า ลดปริมาณการใช้ปุ๋ยเคมีลงได้',
      crops: ['rice', 'cassava', 'sugarcane', 'corn'],
      cropNames: ['ข้าว', 'มันสำปะหลัง', 'อ้อย', 'ข้าวโพด'],
      image: '../images/product-soil.jpg'
    },

    /* ── หมวด 3: สารกำจัดแมลงและศัตรูพืช (pesticide) ── */
    {
      id: 'p9',
      name: 'FarmoShield Pro ชีวภัณฑ์กำจัดแมลง',
      cat: 'pesticide',
      catName: 'สารกำจัดศัตรูพืช',
      price: 450,
      unit: '/ขวด 500 มล.',
      badge: 'new',
      badgeText: '✨ สินค้าใหม่',
      desc: 'นวัตกรรมชีวภัณฑ์กำจัดหนอนและเพลี้ยดื้อยา ปลอดภัยต่อผู้ฉีดพ่นและผึ้ง ไม่มีสารตกค้าง',
      fullDesc: 'FarmoShield Pro ผ่านการทดสอบและวิจัยจากห้องปฏิบัติการ ออกฤทธิ์ทำลายระบบย่อยอาหารของหนอนกระทู้ หนอนใยผัก และเพลี้ยไฟได้อย่างแม่นยำ เก็บเกี่ยวผลผลิตได้หลังพ่นเพียง 1 วัน เหมาะกับพืชผักส่งออกและเกษตรปลอดภัย GAP',
      crops: ['rice', 'vegetable', 'fruit'],
      cropNames: ['ข้าว', 'ผักทั่วไป', 'ไม้ผล'],
      image: '../images/product-pesticide.jpg'
    },
    {
      id: 'p10',
      name: 'Farmora PestOff EC 50 กำจัดหนอนกอ',
      cat: 'pesticide',
      catName: 'สารกำจัดศัตรูพืช',
      price: 380,
      unit: '/ขวด 500 มล.',
      desc: 'สารกำจัดแมลงศัตรูพืชสูตรเข้มข้น ออกฤทธิ์ดูดซึมและถูกตัวตาย คุมนาน 14 วัน',
      fullDesc: 'PestOff EC 50 ออกฤทธิ์เร็วต่อแมลงปากกัดและปากดูด กำจัดหนอนกอข้าว หนอนม้วนใบข้าว เพลี้ยจักจั่น และแมลงหวี่ขาว คุ้มค่าและประหยัดต้นทุนต่อไร่',
      crops: ['rice', 'cassava', 'corn'],
      cropNames: ['ข้าว', 'มันสำปะหลัง', 'ข้าวโพด'],
      image: '../images/product-pesticide.jpg'
    },
    {
      id: 'p11',
      name: 'Bio-Kill 200 สารสกัดสะเดาอินทรีย์',
      cat: 'pesticide',
      catName: 'สารกำจัดศัตรูพืช',
      price: 320,
      unit: '/ขวด 1 ลิตร',
      badge: 'eco',
      badgeText: '🌿 Organic',
      desc: 'สารสกัดสะเดาบริสุทธิ์ ขับไล่และยับยั้งการวางไข่ของแมลงศัตรูพืช ปลอดภัย 100%',
      fullDesc: 'Bio-Kill 200 ผลิตจากเมล็ดสะเดาอินทรีย์แท้ มีสารอะซาดิแรคติน (Azadirachtin) ยับยั้งการเจริญเติบโตและการลอกคราบของหนอน แมลงวันทอง และเพลี้ยแป้ง',
      crops: ['vegetable', 'fruit'],
      cropNames: ['ผักทั่วไป', 'ไม้ผล'],
      image: '../images/product-pesticide.jpg'
    },
    {
      id: 'p12',
      name: 'Alpha-Guard ยาฆ่าเพลี้ยกระโดดสีน้ำตาล',
      cat: 'pesticide',
      catName: 'สารกำจัดศัตรูพืช',
      price: 520,
      unit: '/ขวด 500 มล.',
      badge: 'hot',
      badgeText: '🔥 ขายดี',
      desc: 'สารตัดวงจรเพลี้ยกระโดดสีน้ำตาลในนาข้าว ควบคุมไข่ ตัวอ่อน และตัวเต็มวัย',
      fullDesc: 'Alpha-Guard ปกป้องนาข้าวจากการระบาดของเพลี้ยกระโดดสีน้ำตาล ออกฤทธิ์เร็วภายใน 2 ชั่วโมง ยับยั้งการดูดกินน้ำเลี้ยงของต้นข้าว ป้องกันโรคจิกกอและโรคใบหงิก',
      crops: ['rice'],
      cropNames: ['ข้าว'],
      image: '../images/product-pesticide.jpg'
    },

    /* ── หมวด 4: สารกำจัดวัชพืช (herbicide) ── */
    {
      id: 'p13',
      name: 'Farmora WeedKill Pro ยาฆ่าหญ้าดูดซึม',
      cat: 'herbicide',
      catName: 'สารกำจัดวัชพืช',
      price: 320,
      unit: '/ขวด 1 ลิตร',
      badge: 'hot',
      badgeText: '🔥 ขายดี',
      desc: 'สารกำจัดวัชพืชแบบดูดซึม สิ้นซากถึงรากเหง้า ออกฤทธิ์ภายใน 24-48 ชม. ไม่ตกค้างในดิน',
      fullDesc: 'WeedKill Pro สารกำจัดหญ้าและวัชพืชใบแคบ-ใบกว้าง สูตรดูดซึมซึมลึกถึงระบบรากและเหง้าใต้ดิน เหมาะสำหรับฉีดล้างแปลงก่อนไถปลูกพืชไร่ ในสวนยางพารา และร่องอ้อย',
      crops: ['sugarcane', 'rubber', 'cassava', 'corn'],
      cropNames: ['อ้อย', 'ยางพารา', 'มันสำปะหลัง', 'ข้าวโพด'],
      image: '../images/product-pesticide.jpg'
    },
    {
      id: 'p14',
      name: 'GrassOut 10 คุม-ฆ่าหญ้าในนาข้าว',
      cat: 'herbicide',
      catName: 'สารกำจัดวัชพืช',
      price: 410,
      unit: '/ขวด 500 มล.',
      desc: 'คุมและฆ่าหญ้าข้าวนก กก หนวดปลาดุก ในนาข้าวอายุ 7-12 วัน ข้าวไม่แดง ไม่อาน้ำ',
      fullDesc: 'GrassOut 10 สารคุมและฆ่าวัชพืชในนาข้าวหว่านน้ำตม ออกฤทธิ์เลือกทำลาย ปลอดภัยต่อต้นข้าว ไม่ทำให้ข้าวแคระแกร็นหรือใบเหลือง กำจัดหญ้ากระดูกไก่ หญ้าดอกขาวได้เกลี้ยงแปลง',
      crops: ['rice'],
      cropNames: ['ข้าว'],
      image: '../images/product-pesticide.jpg'
    },
    {
      id: 'p15',
      name: 'CleanField กำจัดวัชพืชใบกว้างในไร่อ้อย',
      cat: 'herbicide',
      catName: 'สารกำจัดวัชพืช',
      price: 360,
      unit: '/ขวด 1 ลิตร',
      desc: 'สารกำจัดเถาเลื้อย ผักโขม หญ้าสาบเสือ และวัชพืชใบกว้างในไร่อ้อยและไร่ข้าวโพด',
      fullDesc: 'CleanField ออกฤทธิ์เร็ว ยับยั้งการเจริญเติบโตของวัชพืชตระกูลเถาเลื้อยและใบกว้างที่แย่งอาหารพืชหลัก ฉีดทับข้าวโพดหรืออ้อยได้เมื่อโตตามระยะที่กำหนด',
      crops: ['sugarcane', 'corn', 'rubber'],
      cropNames: ['อ้อย', 'ข้าวโพด', 'ยางพารา'],
      image: '../images/product-pesticide.jpg'
    },
    {
      id: 'p16',
      name: 'Bio-Weeder สารกำจัดหญ้าสูตรชีวภาพ',
      cat: 'herbicide',
      catName: 'สารกำจัดวัชพืช',
      price: 480,
      unit: '/แกลลอน 4 ลิตร',
      badge: 'new',
      badgeText: '✨ สินค้าใหม่',
      desc: 'นวัตกรรมสารกำจัดหญ้าจากกรดธรรมชาติ ปลอดภัยต่อดินและสัตว์เลี้ยง ย่อยสลายไว',
      fullDesc: 'Bio-Weeder ผลิตจากสารสกัดกรดไขมันพืชธรรมชาติ ออกฤทธิ์แบบเผาไหม้ทำลายใบวัชพืชใน 3 ชั่วโมง ปลอดภัยต่อระบบนิเวศน์ เหมาะสำหรับรอบบ้านและแปลงเกษตรอินทรีย์',
      crops: ['vegetable', 'fruit'],
      cropNames: ['ผักทั่วไป', 'ไม้ผล'],
      image: '../images/product-pesticide.jpg'
    },

    /* ── หมวด 5: ฮอร์โมนพืช (hormone) ── */
    {
      id: 'p17',
      name: 'Farmora Boost ฮอร์โมนเร่งรากและแตกตา',
      cat: 'hormone',
      catName: 'ฮอร์โมนพืช',
      price: 560,
      unit: '/ขวด 500 มล.',
      badge: 'new',
      badgeText: '✨ สินค้าใหม่',
      desc: 'สูตรออกซินและไซโตไคนินเข้มข้น เร่งการงอกราก แตกยอดใหม่ ฟื้นสภาพต้นหลังโทรม',
      fullDesc: 'Farmora Boost ช่วยกระตุ้นการแบ่งเซลล์พืชอย่างรวดเร็ว เร่งการออกรากของกิ่งตอน ท่อนพันธุ์ และเร่งยอดใหม่ในไม้ผลหลังตัดแต่งกิ่ง ช่วยให้ต้นพืชสมบูรณ์พร้อมติดดอก',
      crops: ['fruit', 'vegetable', 'rubber', 'cassava'],
      cropNames: ['ไม้ผล', 'ผักทั่วไป', 'ยางพารา', 'มันสำปะหลัง'],
      image: '../images/product-hormone.jpg'
    },
    {
      id: 'p18',
      name: 'Flower-Max เร่งเปิดตาดอก ดอกดกขั้วเหนียว',
      cat: 'hormone',
      catName: 'ฮอร์โมนพืช',
      price: 480,
      unit: '/ขวด 1 ลิตร',
      badge: 'hot',
      badgeText: '🔥 ขายดี',
      desc: 'ฮอร์โมนผสมโบรอน-สังกะสี เร่งช่อดอก กระตุ้นการผสมเกสร ลดการหลุดร่วงของดอกและผลอ่อน',
      fullDesc: 'Flower-Max ช่วยให้พืชออกดอกพร้อมเพรียงกัน ช่อดอกสมบูรณ์ ละอองเกสรแข็งแรง ติดผลดก ขั้วดอกเหนียว ป้องกันการสลัดดอกในทุเรียน ลำไย มะม่วง และพริก',
      crops: ['fruit', 'vegetable'],
      cropNames: ['ไม้ผล', 'ผักทั่วไป'],
      image: '../images/product-hormone.jpg'
    },
    {
      id: 'p19',
      name: 'Fruit-Up ฮอร์โมนขยายขนาดผล เพิ่มความหวาน',
      cat: 'hormone',
      catName: 'ฮอร์โมนพืช',
      price: 620,
      unit: '/ขวด 1 ลิตร',
      desc: 'จิบเบอเรลลินและอะมิโนขยายพูผลไม้ ผลโตสม่ำเสมอ ผิวสวย เนื้อแน่น น้ำหนักดี',
      fullDesc: 'Fruit-Up ช่วยลำเลียงน้ำตาลและอาหารสะสมเข้าสู่เนื้อผลไม้ ขยายขนาดผล เพิ่มความหวานและสีสันสดใส ช่วยลดปัญหาผลบิดเบี้ยวหรือขนาดตกเกรด',
      crops: ['fruit', 'vegetable'],
      cropNames: ['ไม้ผล', 'ผักทั่วไป'],
      image: '../images/product-hormone.jpg'
    },
    {
      id: 'p20',
      name: 'Root-Speed วิตามินเสริมรากพืชปลูกใหม่',
      cat: 'hormone',
      catName: 'ฮอร์โมนพืช',
      price: 290,
      unit: '/ขวด 500 มล.',
      desc: 'วิตามิน B1 และกรดอะมิโน แช่ท่อนพันธุ์ แช่เมล็ดพันธุ์ หรือรดกล้าไม้ปลูกใหม่',
      fullDesc: 'Root-Speed ลดอาการช็อกจากการย้ายปลูก ช่วยให้ต้นกล้าตั้งตัวได้ไว แตกรากฝอยดก แข็งแรง ทนทานต่อสภาพอากาศร้อนและแล้ง',
      crops: ['rice', 'cassava', 'sugarcane', 'vegetable'],
      cropNames: ['ข้าว', 'มันสำปะหลัง', 'อ้อย', 'ผักทั่วไป'],
      image: '../images/product-hormone.jpg'
    },

    /* ── หมวด 6: สารปรับปรุงดิน (soil) ── */
    {
      id: 'p21',
      name: 'Farmora SoilFix โดโลไมท์ปรับสภาพดินกรด',
      cat: 'soil',
      catName: 'สารปรับปรุงดิน',
      price: 220,
      unit: '/ถุง 25 กก.',
      desc: 'โดโลไมท์คุณภาพสูง แก้น้ำสนิม ดินเปรี้ยว ดินเค็ม เสริมธาตุแคลเซียมและแมกนีเซียม',
      fullDesc: 'Farmora SoilFix ปรับค่าความเป็นกรด-ด่าง (pH) ของดินให้เหมาะสมที่ 5.5-6.5 ช่วยปลดปล่อยธาตุอาหารที่ถูกตรึง แก้อาการใบเหลืองจากดินกรดได้อย่างถาวร',
      crops: ['rice', 'rubber', 'fruit', 'cassava'],
      cropNames: ['ข้าว', 'ยางพารา', 'ไม้ผล', 'มันสำปะหลัง'],
      image: '../images/product-soil.jpg'
    },
    {
      id: 'p22',
      name: 'ยิปซั่มการเกษตร ปรับโครงสร้างดินแน่น',
      cat: 'soil',
      catName: 'สารปรับปรุงดิน',
      price: 260,
      unit: '/ถุง 25 กก.',
      desc: 'ลดความเค็มในดิน ระบายน้ำได้ดี ดินร่วนซุย เสริมกำมะถันและแคลเซียมให้พืช',
      fullDesc: 'ยิปซั่มการเกษตรช่วยสลายอนุภาคดินเหนียวแน่นทึบ ทำให้อากาศถ่ายเทสะดวก น้ำซึมผ่านได้ดี รากพืชหยั่งลึก เหมาะสำหรับฟื้นฟูดินเค็มแถบชายทะเลและดินดานในไร่',
      crops: ['rice', 'sugarcane', 'cassava'],
      cropNames: ['ข้าว', 'อ้อย', 'มันสำปะหลัง'],
      image: '../images/product-soil.jpg'
    },
    {
      id: 'p23',
      name: 'Silicon Plus ซิลิคอนเสริมแกร่งลำต้นข้าว',
      cat: 'soil',
      catName: 'สารปรับปรุงดิน',
      price: 450,
      unit: '/ถุง 20 กก.',
      badge: 'hot',
      badgeText: '🔥 ขายดี',
      desc: 'ซิลิกอนเสริมผนังเซลล์ ต้นข้าวแข็งแกร่ง ไม่ล้มง่าย ป้องกันโรคไหม้และแมลงเจาะ',
      fullDesc: 'Silicon Plus ช่วยสร้างเกราะป้องกันธรรมชาติให้แก่ใบและลำต้นข้าว ข้าวตั้งชูรับแสงแดดได้ดี รวงไม่ล้มเมื่อเจอลมฝน ลดความเสียหายก่อนเก็บเกี่ยวได้อย่างมหาศาล',
      crops: ['rice', 'sugarcane'],
      cropNames: ['ข้าว', 'อ้อย'],
      image: '../images/product-soil.jpg'
    },
    {
      id: 'p24',
      name: 'Trichoderma ผงไตรโคเดอร์มาป้องกันโรครากเน่า',
      cat: 'soil',
      catName: 'สารปรับปรุงดิน',
      price: 390,
      unit: '/ซอง 500 กรัม',
      badge: 'eco',
      badgeText: '🌿 Organic',
      desc: 'ชีวภัณฑ์เชื้อรากำจัดเชื้อราโรคพืช ป้องกันโรครากเน่าโคนเน่า โรคแคงเกอร์ และใบไหม้',
      fullDesc: 'เชื้อราไตรโคเดอร์มาสายพันธุ์แท้เข้มข้น เข้าไปแย่งพื้นที่และทำลายสปอร์เชื้อราก่อโรคในดิน ปลอดภัยต่อคนและสิ่งแวดล้อม 100% เหมาะสำหรับรองก้นหลุมปลูก',
      crops: ['fruit', 'vegetable', 'rubber'],
      cropNames: ['ไม้ผล', 'ผักทั่วไป', 'ยางพารา'],
      image: '../images/product-soil.jpg'
    },

    /* ── หมวด 7: เมล็ดพันธุ์ (seeds) ── */
    {
      id: 'p25',
      name: 'เมล็ดพันธุ์ข้าวหอมมะลิ 105 คัดพิเศษ',
      cat: 'seeds',
      catName: 'เมล็ดพันธุ์',
      price: 550,
      unit: '/กระสอบ 25 กก.',
      badge: 'star',
      badgeText: '⭐ ยอดนิยม',
      desc: 'เมล็ดพันธุ์ข้าวหอมมะลิ 105 แท้ บริสุทธิ์ 99% อัตราการงอกสูงกว่า 95% หุงนุ่ม หอมกรุ่น',
      fullDesc: 'เมล็ดพันธุ์ข้าวพันธุ์แท้จากแหล่งปลูกทุ่งกุลาร้องไห้ คัดแยกสิ่งเจือปนและเมล็ดลีบด้วยเครื่องจักรทันสมัย ต้นข้าวเติบโตสม่ำเสมอ แตกกอดก ทนทานต่อโรคใบไหม้ ให้ผลผลิตสูง',
      crops: ['rice'],
      cropNames: ['ข้าว'],
      image: '../images/vg 2.jpg'
    },
    {
      id: 'p26',
      name: 'ชุดรวมเมล็ดพันธุ์ผักสวนครัวพอเพียง (10 ซอง)',
      cat: 'seeds',
      catName: 'เมล็ดพันธุ์',
      price: 180,
      unit: '/ชุด 10 ชนิด',
      badge: 'new',
      badgeText: '✨ สินค้าใหม่',
      desc: 'กะเพรา พริกขี้หนู มะเขือเปราะ โหระพา ผักบุ้งจีน คะน้า แตงกวา ถั่วฝักยาว ผักชี ตะไคร้',
      fullDesc: 'ชุดเมล็ดพันธุ์ผักยอดนิยมที่ทุกบ้านต้องมี เพาะง่าย โตไว อัตราการงอกสูง เก็บเกี่ยวผลผลิตสดใหม่ ปลอดภัย ไร้สารเคมีสำหรับบริโภคในครัวเรือน',
      crops: ['vegetable'],
      cropNames: ['ผักทั่วไป'],
      image: '../images/vg 1.jpg'
    },

    /* ── หมวด 8: อาหารสัตว์ (feed) ── */
    {
      id: 'p27',
      name: 'Farmora Feed อาหารวัวขุนและโคนม โปรตีน 16%',
      cat: 'feed',
      catName: 'อาหารสัตว์',
      price: 380,
      unit: '/กระสอบ 30 กก.',
      desc: 'อาหารเม็ดสำเร็จรูปโปรตีนสูง 16% สำหรับโคขุนและโคนม ช่วยเพิ่มน้ำหนักและปริมาณน้ำนม',
      fullDesc: 'ผลิตจากวัตถุดิบคุณภาพดี กากถั่วเหลือง ข้าวโพดบด และพรีมิกซ์แร่ธาตุจำเป็น ช่วยให้โคเจริญเติบโตรวดเร็ว กล้ามเนื้อแน่น ขนสวย และมีสุขภาพแข็งแรง',
      crops: [],
      cropNames: ['ปศุสัตว์'],
      image: '../images/vg 4.jpg'
    },
    {
      id: 'p28',
      name: 'Farmora Aqua อาหารปลาและสัตว์น้ำสูตรเร่งโต',
      cat: 'feed',
      catName: 'อาหารสัตว์',
      price: 340,
      unit: '/กระสอบ 20 กก.',
      desc: 'อาหารเม็ดลอยน้ำสูตรเร่งโต สำหรับปลากินพืชและปลานิล น้ำไม่เสียง่าย',
      fullDesc: 'อาหารปลาเม็ดลอยน้ำคุณภาพพรีเมียม สารอาหารครบถ้วน ปลาย่อยง่าย ดูดซึมไว อัตราการแลกเนื้อ (FCR) ดีเยี่ยม ช่วยประหยัดต้นทุนค่าอาหารของเกษตรกรผู้เพาะเลี้ยง',
      crops: [],
      cropNames: ['สัตว์น้ำ'],
      image: '../images/vg 3.jpg'
    }
  ];

  // ── DOM Elements ──────────────────────────────────────────
  const prodGrid         = document.getElementById('prodGrid');
  const catButtons       = document.querySelectorAll('.pcat-btn');
  const searchInput      = document.getElementById('prodSearch');
  const priceRadios      = document.querySelectorAll('input[name="price"]');
  const cropCheckboxes   = document.querySelectorAll('.crop-filter-grid input[type="checkbox"]');
  const sortSelect       = document.getElementById('sortSelect');
  const prodCountEl      = document.getElementById('prodCount');
  const noResultsEl      = document.getElementById('noResultsProd');
  const activeFiltersEl  = document.getElementById('activeFilters');
  const afTagsEl         = document.getElementById('afTags');
  const gridViewBtn      = document.getElementById('gridView');
  const listViewBtn      = document.getElementById('listView');
  const toastNotice      = document.getElementById('toastNotice');
  const toastMsg         = document.getElementById('toastMsg');

  // Modal Elements
  const pdmBackdrop      = document.getElementById('productDetailModal');
  const pdmMainImg       = document.getElementById('pdmMainImg');
  const pdmBadge         = document.getElementById('pdmBadge');
  const pdmCatName       = document.getElementById('pdmCatName');
  const pdmTitle         = document.getElementById('pdmTitle');
  const pdmPrice         = document.getElementById('pdmPrice');
  const pdmUnit          = document.getElementById('pdmUnit');
  const pdmCropsList     = document.getElementById('pdmCropsList');
  const pdmDesc          = document.getElementById('pdmDesc');
  const pdmQtyInput      = document.getElementById('pdmQtyInput');
  const btnPdmAddToCart  = document.getElementById('btnPdmAddToCart');

  // Filter State
  let currentCategory = 'all';
  let searchQuery     = '';
  let priceFilter     = 'all';
  let selectedCrops   = [];
  let sortBy          = 'default';
  let viewMode        = 'grid'; // 'grid' | 'list'
  let currentModalItem = null;

  // ── 1. Helper: อัปเดตตัวเลขนับจำนวนใน Sidebar ─────────────
  function updateCategoryCounts() {
    const counts = { all: PRODUCTS_DATA.length };
    PRODUCTS_DATA.forEach(p => {
      counts[p.cat] = (counts[p.cat] || 0) + 1;
    });

    catButtons.forEach(btn => {
      const cat = btn.dataset.cat;
      const countEl = btn.querySelector('.pcat-count');
      if (countEl && counts[cat] !== undefined) {
        countEl.textContent = counts[cat];
      }
    });
  }

  // ── 2. Helper: ฟิลเตอร์และจัดเรียงสินค้า ──────────────────
  function getFilteredProducts() {
    let list = PRODUCTS_DATA.filter(p => {
      // กรองหมวดหมู่
      const matchCat = (currentCategory === 'all') || (p.cat === currentCategory);

      // กรองคำค้นหา
      const q = searchQuery.toLowerCase();
      const matchSearch = !q ||
        p.name.toLowerCase().includes(q) ||
        p.desc.toLowerCase().includes(q) ||
        p.catName.toLowerCase().includes(q) ||
        p.cropNames.some(c => c.toLowerCase().includes(q));

      // กรองช่วงราคา
      let matchPrice = true;
      if (priceFilter === 'under500') {
        matchPrice = p.price < 500;
      } else if (priceFilter === '500-1000') {
        matchPrice = p.price >= 500 && p.price <= 1000;
      } else if (priceFilter === 'over1000') {
        matchPrice = p.price > 1000;
      }

      // กรองชนิดพืช
      let matchCrops = true;
      if (selectedCrops.length > 0) {
        matchCrops = selectedCrops.some(cropKey => p.crops.includes(cropKey));
      }

      return matchCat && matchSearch && matchPrice && matchCrops;
    });

    // การจัดเรียง (Sorting)
    if (sortBy === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name-asc') {
      list.sort((a, b) => a.name.localeCompare(b.name, 'th'));
    } else if (sortBy === 'name-desc') {
      list.sort((a, b) => b.name.localeCompare(a.name, 'th'));
    }

    return list;
  }

  // ── 3. Helper: Render Active Filter Tags ───────────────────
  function renderActiveFilterTags() {
    if (!activeFiltersEl || !afTagsEl) return;

    const tags = [];
    const catMap = {
      fertilizer: 'ปุ๋ยเคมี',
      organic: 'ปุ๋ยอินทรีย์',
      pesticide: 'สารกำจัดศัตรูพืช',
      herbicide: 'สารกำจัดวัชพืช',
      hormone: 'ฮอร์โมนพืช',
      soil: 'สารปรับปรุงดิน',
      seeds: 'เมล็ดพันธุ์',
      feed: 'อาหารสัตว์'
    };

    if (currentCategory !== 'all') {
      tags.push({
        label: `หมวด: ${catMap[currentCategory] || currentCategory}`,
        type: 'cat'
      });
    }

    if (searchQuery) {
      tags.push({
        label: `ค้นหา: "${searchQuery}"`,
        type: 'search'
      });
    }

    if (priceFilter === 'under500') {
      tags.push({ label: 'ราคา < ฿500', type: 'price' });
    } else if (priceFilter === '500-1000') {
      tags.push({ label: 'ราคา ฿500 - ฿1,000', type: 'price' });
    } else if (priceFilter === 'over1000') {
      tags.push({ label: 'ราคา > ฿1,000', type: 'price' });
    }

    selectedCrops.forEach(c => {
      const cropMap = {
        rice: 'ข้าว', cassava: 'มันสำปะหลัง', sugarcane: 'อ้อย',
        corn: 'ข้าวโพด', vegetable: 'ผักทั่วไป', fruit: 'ไม้ผล', rubber: 'ยางพารา'
      };
      tags.push({
        label: `พืช: ${cropMap[c] || c}`,
        type: 'crop',
        value: c
      });
    });

    if (tags.length === 0) {
      activeFiltersEl.style.display = 'none';
      return;
    }

    activeFiltersEl.style.display = 'flex';
    afTagsEl.innerHTML = tags.map(t => `
      <span class="af-tag" onclick="window.FarmoraProducts.removeFilterTag('${t.type}', '${t.value || ''}')">
        ${t.label} <i class="fa-solid fa-xmark"></i>
      </span>
    `).join('');
  }

  // ── 4. Render Product Cards ────────────────────────────────
  function renderProducts() {
    if (!prodGrid) return;

    const filtered = getFilteredProducts();

    if (prodCountEl) {
      prodCountEl.textContent = filtered.length;
    }

    renderActiveFilterTags();

    if (filtered.length === 0) {
      prodGrid.style.display = 'none';
      if (noResultsEl) noResultsEl.style.display = 'block';
      return;
    } else {
      prodGrid.style.display = 'grid';
      if (noResultsEl) noResultsEl.style.display = 'none';
    }

    // Toggle list view class
    prodGrid.className = viewMode === 'list' ? 'prod-grid list-view' : 'prod-grid';

    prodGrid.innerHTML = filtered.map(p => {
      const badgeClass = p.badge ? `badge-${p.badge}` : '';
      return `
        <article class="prod-card" data-id="${p.id}" data-cat="${p.cat}">
          <div class="pc-img-wrap" onclick="window.FarmoraProducts.openDetail('${p.id}')">
            <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.src='../images/product-fertilizer.jpg'">
            ${p.badge ? `<span class="pc-badge ${badgeClass}">${p.badgeText}</span>` : ''}
            
            <div class="pc-hover-actions">
              <button class="pc-action-btn" title="ดูรายละเอียด" onclick="event.stopPropagation(); window.FarmoraProducts.openDetail('${p.id}')">
                <i class="fa-solid fa-magnifying-glass"></i>
              </button>
              <button class="pc-action-btn" title="สนใจสินค้า" onclick="event.stopPropagation(); window.FarmoraProducts.handleAddToCart('${p.id}')">
                <i class="fa-solid fa-cart-shopping"></i>
              </button>
            </div>
          </div>

          <div class="pc-body">
            <span class="pc-category-tag">${p.catName}</span>
            <h3 class="pc-name" onclick="window.FarmoraProducts.openDetail('${p.id}')">${p.name}</h3>
            <p class="pc-desc">${p.desc}</p>
            
            ${p.cropNames && p.cropNames.length > 0 ? `
              <div class="pc-crop-tags">
                ${p.cropNames.map(c => `<span class="pc-crop-tag"><i class="fa-solid fa-seedling"></i> ${c}</span>`).join('')}
              </div>
            ` : ''}

            <div class="pc-footer">
              <div class="pc-price-box">
                <span class="pc-price-main">฿${p.price.toLocaleString('th-TH')}</span>
                <span class="pc-price-unit">${p.unit}</span>
              </div>
              <button class="btn-add-cart" title="เพิ่มลงตะกร้า" onclick="window.FarmoraProducts.handleAddToCart('${p.id}')" aria-label="เพิ่มลงตะกร้า">
                <i class="fa-solid fa-cart-plus"></i>
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  // ── 5. ฟังก์ชันเปลี่ยนหมวดหมู่ (Set Category) ─────────────
  function setCategory(cat, shouldScroll = false) {
    currentCategory = cat || 'all';

    catButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.cat === currentCategory);
    });

    renderProducts();

    if (shouldScroll) {
      const mainEl = document.querySelector('.products-main');
      if (mainEl) {
        window.scrollTo({ top: mainEl.offsetTop - 80, behavior: 'smooth' });
      }
    }
  }

  // ── 6. ลบ Filter Tag เดี่ยว ────────────────────────────────
  function removeFilterTag(type, value) {
    if (type === 'cat') {
      setCategory('all');
    } else if (type === 'search') {
      if (searchInput) searchInput.value = '';
      searchQuery = '';
      renderProducts();
    } else if (type === 'price') {
      priceFilter = 'all';
      const allRadio = document.querySelector('input[name="price"][value="all"]');
      if (allRadio) allRadio.checked = true;
      renderProducts();
    } else if (type === 'crop') {
      selectedCrops = selectedCrops.filter(c => c !== value);
      const cb = document.querySelector(`.crop-filter-grid input[value="${value}"]`);
      if (cb) cb.checked = false;
      renderProducts();
    }
  }

  // ── 7. ล้างฟิลเตอร์ทั้งหมด (Clear All Filters) ─────────────
  function clearAllFilters() {
    currentCategory = 'all';
    searchQuery = '';
    priceFilter = 'all';
    selectedCrops = [];
    sortBy = 'default';

    if (searchInput) searchInput.value = '';
    const allRadio = document.querySelector('input[name="price"][value="all"]');
    if (allRadio) allRadio.checked = true;
    cropCheckboxes.forEach(cb => cb.checked = false);
    if (sortSelect) sortSelect.value = 'default';

    catButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.cat === 'all');
    });

    renderProducts();
  }

  // ── 8. Product Detail Modal ────────────────────────────────
  function openDetail(id) {
    const item = PRODUCTS_DATA.find(p => p.id === id);
    if (!item || !pdmBackdrop) return;

    currentModalItem = item;

    if (pdmMainImg) pdmMainImg.src = item.image;
    if (pdmCatName) pdmCatName.textContent = item.catName;
    if (pdmTitle) pdmTitle.textContent = item.name;
    if (pdmPrice) pdmPrice.textContent = `฿${item.price.toLocaleString('th-TH')}`;
    if (pdmUnit) pdmUnit.textContent = item.unit;
    if (pdmDesc) pdmDesc.textContent = item.fullDesc || item.desc;
    if (pdmQtyInput) pdmQtyInput.value = 1;

    if (pdmCropsList) {
      if (item.cropNames && item.cropNames.length > 0) {
        pdmCropsList.innerHTML = item.cropNames.map(c => `
          <span class="pc-crop-tag"><i class="fa-solid fa-seedling"></i> ${c}</span>
        `).join('');
      } else {
        pdmCropsList.innerHTML = '<span style="font-size:13px; color:#888;">เหมาะสำหรับเกษตรกรรมทั่วไป</span>';
      }
    }

    pdmBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDetail() {
    if (!pdmBackdrop) return;
    pdmBackdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  // ── 9. Toast Notification & Add to Cart ────────────────────
  function showToast(productName, qty = 1) {
    if (!toastNotice || !toastMsg) return;
    toastMsg.textContent = `เพิ่ม "${productName}" (จำนวน ${qty}) ลงตะกร้าแล้ว!`;
    toastNotice.classList.add('show');
    setTimeout(() => {
      toastNotice.classList.remove('show');
    }, 2800);
  }

  function handleAddToCart(id, qty = 1) {
    const item = PRODUCTS_DATA.find(p => p.id === id);
    if (!item) return;

    // อัปเดตยอดตะกร้าใน Navbar
    const cartCountEl = document.getElementById('cart-count');
    if (cartCountEl) {
      const current = parseInt(cartCountEl.textContent || '0', 10);
      const updated = current + qty;
      cartCountEl.textContent = updated;
      cartCountEl.style.display = 'flex';
      
      // เอฟเฟกต์เด้ง
      cartCountEl.style.transform = 'scale(1.3)';
      setTimeout(() => { cartCountEl.style.transform = 'scale(1)'; }, 200);
    }

    showToast(item.name, qty);
  }

  // ── 10. ผูก Event Listeners ────────────────────────────────
  // Category buttons
  catButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      setCategory(btn.dataset.cat, false);
    });
  });

  // Search input
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      renderProducts();
    });
  }

  // Price radios
  priceRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      priceFilter = e.target.value;
      renderProducts();
    });
  });

  // Crop checkboxes
  cropCheckboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      selectedCrops = Array.from(cropCheckboxes).filter(c => c.checked).map(c => c.value);
      renderProducts();
    });
  });

  // Sort select
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      sortBy = e.target.value;
      renderProducts();
    });
  }

  // View toggle
  if (gridViewBtn && listViewBtn) {
    gridViewBtn.addEventListener('click', () => {
      viewMode = 'grid';
      gridViewBtn.classList.add('active');
      listViewBtn.classList.remove('active');
      renderProducts();
    });
    listViewBtn.addEventListener('click', () => {
      viewMode = 'list';
      listViewBtn.classList.add('active');
      gridViewBtn.classList.remove('active');
      renderProducts();
    });
  }

  // Modal Quantity Picker
  window.changeModalQty = function (delta) {
    if (!pdmQtyInput) return;
    const current = parseInt(pdmQtyInput.value || '1', 10);
    pdmQtyInput.value = Math.max(1, current + delta);
  };

  // Modal Add to Cart
  if (btnPdmAddToCart) {
    btnPdmAddToCart.addEventListener('click', () => {
      if (!currentModalItem) return;
      const qty = parseInt(pdmQtyInput ? pdmQtyInput.value : '1', 10) || 1;
      handleAddToCart(currentModalItem.id, qty);
      closeDetail();
    });
  }

  // Modal Backdrop click to close
  if (pdmBackdrop) {
    pdmBackdrop.addEventListener('click', (e) => {
      if (e.target === pdmBackdrop) closeDetail();
    });
  }

  // ESC key to close modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && pdmBackdrop && pdmBackdrop.classList.contains('open')) {
      closeDetail();
    }
  });

  // ── 11. ตรวจจับ URL Parameter ตอนเปิดหน้า ──────────────────
  updateCategoryCounts();

  const urlParams = new URLSearchParams(window.location.search);
  const initialCategory = urlParams.get('cat');

  if (initialCategory && ['fertilizer', 'organic', 'pesticide', 'herbicide', 'hormone', 'soil', 'seeds', 'feed'].includes(initialCategory)) {
    setCategory(initialCategory, false);
    setTimeout(() => {
      const mainEl = document.querySelector('.products-main');
      if (mainEl) {
        window.scrollTo({ top: mainEl.offsetTop - 80, behavior: 'smooth' });
      }
    }, 150);
  } else {
    setCategory('all', false);
  }

  // ส่งออกฟังก์ชันสู่ Global Scope
  window.FarmoraProducts = {
    openDetail: openDetail,
    closeDetail: closeDetail,
    handleAddToCart: handleAddToCart,
    setCategory: setCategory,
    removeFilterTag: removeFilterTag,
    clearAllFilters: clearAllFilters
  };

})();
