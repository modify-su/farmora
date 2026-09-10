/* ==========================================================================
   🌿 FARMORA OFFICIAL — Backend Data Store (data-store.js)
   ==========================================================================
   ระบบจัดการฐานข้อมูลฝั่ง Client ขับเคลื่อนด้วย localStorage
   รองรับ CRUD:
   1. สไลด์หน้าแรก (Hero Slides พร้อมภาพหน้า Foreground และภาพหลัง Backdrop Blur)
   2. ข่าวสารและกิจกรรม (News & Events)
   3. บทความเกษตร (Articles)
   4. สินค้าเกษตร (Products 8 หมวดหมู่ 28 รายการ)
   5. การตั้งค่าเมนูเว็บไซต์ (Navigation Menus)
   6. คลังรูปภาพ (Media Library)
   ========================================================================== */

(function (window) {
  'use strict';

  const STORAGE_KEYS = {
    SLIDES: 'farmora_slides_v2',
    NEWS: 'farmora_news_v2',
    ARTICLES: 'farmora_articles_v2',
    PRODUCTS: 'farmora_products_v2',
    MENUS: 'farmora_menus_v2',
    MEDIA: 'farmora_media_v2',
    AUTH: 'farmora_auth_v2',
    INITIALIZED: 'farmora_backend_initialized_v2'
  };

  /* ── ตัวช่วยแปลงและตรวจสอบ Path รูปภาพ ─────────────────── */
  function resolveImg(path, defaultImg) {
    const fallback = defaultImg || '../frontend/images/picture 1.jpg';
    if (!path) return fallback;
    if (path.startsWith('data:') || path.startsWith('http://') || path.startsWith('https://')) return path;
    return path;
  }

  /* --------------------------------------------------------------------------
     1. สไลด์หน้าแรกเริ่มต้น (Default Hero Slides)
     -------------------------------------------------------------------------- */
  const DEFAULT_SLIDES = [
    {
      id: 's1',
      title: 'เข้าร่วมการงานจัดแสดงพันธุ์ข้าวและนาข้าว 2025',
      tag1: 'ข่าวสาร',
      tag2: 'บทความ',
      desc: 'ลานไอซีซูแลคอร์ กรอบรูปเลคเชอร์รีโมต วิกัชภาคระโจก มหภาคเทเลกราฟฮี เด่นสงบสุข คันธระ: อุปสงค์ ควีนลอร์ด ตําฮ่วยคาร์โก้ศึกษาศาสตร์อัลบั้ม โทร ไข่งละตินนิวเอ้อรอยัลดี่ ...',
      fgImage: '../frontend/images/picture 1.jpg',
      bgImage: '../frontend/images/picture 1.jpg',
      btnText: 'อ่านต่อ',
      btnLink: '../frontend/html/news.html?cat=news',
      isActive: true,
      order: 1,
      createdAt: '2026-08-10'
    },
    {
      id: 's2',
      title: 'ร่วมงานเกษตรแฟร์ 2026 ณ มหาวิทยาลัยเกษตรศาสตร์',
      tag1: 'ข่าวสาร',
      tag2: 'กิจกรรม',
      desc: 'พบกับนวัตกรรมการปลูกข้าวยุคใหม่ การแสดงสินค้าทางการเกษตร พันธุ์ข้าวคุณภาพสูง และเวิร์กช็อปให้คำปรึกษาฟรีจากผู้เชี่ยวชาญจาก Farmora ณ บูธนิทรรศการเกษตรกรรมยั่งยืน...',
      fgImage: '../frontend/images/hero1.jpg',
      bgImage: '../frontend/images/hero1.jpg',
      btnText: 'อ่านต่อ',
      btnLink: '../frontend/html/news.html?cat=activity',
      isActive: true,
      order: 2,
      createdAt: '2026-08-12'
    },
    {
      id: 's3',
      title: 'โครงการฝึกอบรมเกษตรกรรุ่นใหม่ ประจำปี 2025',
      tag1: 'บทความ',
      tag2: 'ความรู้',
      desc: 'Farmora ร่วมส่งเสริมองค์ความรู้เกษตรกรยุค 4.0 อัปเดตเทคนิคการจัดการดิน ปุ๋ยอินทรีย์ชีวภาพ และการใช้ฮอร์โมนพืชเพื่อเพิ่มผลผลิตต่อไร่อย่างยั่งยืนและปลอดภัย...',
      fgImage: '../frontend/images/hero2.jpg',
      bgImage: '../frontend/images/hero2.jpg',
      btnText: 'อ่านต่อ',
      btnLink: '../frontend/html/news.html?cat=article',
      isActive: true,
      order: 3,
      createdAt: '2026-08-15'
    }
  ];

  /* --------------------------------------------------------------------------
     2. ข่าวสารและกิจกรรมเริ่มต้น (Default News & Activities)
     -------------------------------------------------------------------------- */
  const DEFAULT_NEWS = [
    {
      id: 'n1',
      title: 'เข้าร่วมการงานจัดแสดงพันธุ์ข้าวและนาข้าว 2025',
      cat: 'news',
      catName: 'ข่าวล่าสุด',
      date: '10 สิงหาคม 2568',
      views: 1450,
      image: '../frontend/images/picture 1.jpg',
      isFeatured: true,
      excerpt: 'Farmora ร่วมจัดแสดงนวัตกรรมพันธุ์ข้าวทนแล้งและเพิ่มผลผลิตในงานจัดแสดงพันธุ์ข้าวระดับชาติ...',
      content: 'ฟาร์โมรา ร่วมจัดแสดงนวัตกรรมพันธุ์ข้าวทนแล้งและผลิตภัณฑ์ชีวภาพเพื่อการเจริญเติบโตของต้นข้าว ณ ศูนย์ประชุมแห่งชาติ เกษตรกรให้ความสนใจเข้าร่วมชมบูธกว่าพันราย พร้อมรับคำแนะนำการดูแลแปลงนาข้าวตลอดฤดูกาล'
    },
    {
      id: 'n2',
      title: 'ร่วมงานเกษตรแฟร์ 2026 ณ มหาวิทยาลัยเกษตรศาสตร์',
      cat: 'activity',
      catName: 'กิจกรรมที่ผ่านมา',
      date: '28 กรกฎาคม 2568',
      views: 980,
      image: '../frontend/images/hero1.jpg',
      isFeatured: true,
      excerpt: 'บรรยากาศบูธฟาร์โมราในงานเกษตรแฟร์ ได้รับการตอบรับอย่างล้นหลามจากเกษตรกรและผู้สนใจการเพาะปลูก...',
      content: 'บรรยากาศการจัดงานเกษตรแฟร์ ณ มหาวิทยาลัยเกษตรศาสตร์ ทีมงาน Farmora ได้จัดเวิร์กช็อปแนะนำเทคนิคการตรวจสภาพดินฟรี การเลือกใช้ปุ๋ยเคมีร่วมกับปุ๋ยอินทรีย์ให้เกิดประสิทธิภาพสูงสุด และแจกเมล็ดพันธุ์ผักโครงการแก่ผู้ร่วมงาน'
    },
    {
      id: 'n3',
      title: 'เปิดตัวผลิตภัณฑ์ใหม่ FarmoGrow Plus 16-16-16 สูตรเร่งรากบำรุงต้น',
      cat: 'news',
      catName: 'ข่าวล่าสุด',
      date: '15 กรกฎาคม 2568',
      views: 1820,
      image: '../frontend/images/product-fertilizer.jpg',
      isFeatured: false,
      excerpt: 'Farmora เปิดตัวปุ๋ยเคมีสูตรพิเศษเม็ดละลายเร็ว ธาตุอาหารครบถ้วน พัฒนาเพื่อพืชไร่และไม้ผลโดยเฉพาะ...',
      content: 'Farmora ภูมิใจนำเสนอ FarmoGrow Plus 16-16-16 นวัตกรรมปุ๋ยเม็ดที่ผ่านกระบวนการเคลือบสารปรับปรุงการละลาย ช่วยให้รากพืชสามารถดูดซึมธาตุอาหารหลักได้ทันที ลดการสูญเสียในดิน และช่วยให้เกษตรกรประหยัดต้นทุนปุ๋ยลงได้ถึง 15%'
    },
    {
      id: 'n4',
      title: 'โครงการฟื้นฟูดินเพื่อเกษตรกรยั่งยืน ลงพื้นที่จังหวัดสุรินทร์',
      cat: 'activity',
      catName: 'กิจกรรมที่ผ่านมา',
      date: '2 มิถุนายน 2568',
      views: 760,
      image: '../frontend/images/picture 4.jpg',
      isFeatured: false,
      excerpt: 'ทีมงานวิชาการลงพื้นที่ตรวจวัดค่ากรด-ด่างในดิน พร้อมมอบสารปรับปรุงดินแก่สมาชิกกลุ่มวิสาหกิจชุมชน...',
      content: 'เพื่อสนับสนุนการทำเกษตรอินทรีย์และปลอดภัย ทีมนักวิชาการเกษตร Farmora ได้ลงพื้นที่อำเภอเมืองสุรินทร์ ให้คำปรึกษาปัญหาดินแน่นทึบและดินเปรี้ยว พร้อมสาธิตการใช้โดโลไมท์และฮิวมิกแอซิดอย่างถูกวิธี'
    }
  ];

  /* --------------------------------------------------------------------------
     3. บทความเกษตรเริ่มต้น (Default Articles)
     -------------------------------------------------------------------------- */
  const DEFAULT_ARTICLES = [
    {
      id: 'a1',
      title: 'เทคนิคการใส่ปุ๋ยให้ถูกช่วงเวลา เพิ่มผลผลิตข้าวได้ 20-30%',
      cat: 'ความรู้เรื่องปุ๋ย',
      date: '25 สิงหาคม 2568',
      readTime: '5 นาที',
      image: '../frontend/images/hero2.jpg',
      excerpt: 'การใส่ปุ๋ยในระยะแตกกอและระยะตั้งท้องมีความสำคัญที่สุด เรียนรู้อัตราส่วน N-P-K ที่เหมาะสมกับชนิดดินในแต่ละภูมิภาค...',
      content: 'การใส่ปุ๋ยให้ได้ผลผลิตสูงสุดไม่ได้ขึ้นอยู่กับปริมาณ แต่ขึ้นอยู่กับความเหมาะสมของช่วงเวลา โดยเฉพาะระยะแตกกอที่พืชต้องการไนโตรเจนสูง และระยะสร้างรวงที่ต้องการฟอสฟอรัสและโพแทสเซียมเพื่อสร้างน้ำหนักเมล็ดข้าว'
    },
    {
      id: 'a2',
      title: 'การจัดการโรคไหม้และเพลี้ยไฟในนาข้าว ป้องกันก่อนสายเกินแก้',
      cat: 'อารักขาพืช',
      date: '18 สิงหาคม 2568',
      readTime: '7 นาที',
      image: '../frontend/images/hero1.jpg',
      excerpt: 'โรคไหม้เกิดจากเชื้อราที่แพร่ระบาดอย่างรวดเร็วในฤดูฝน แนะนำวิธีการสังเกตอาการเบื้องต้นและการเลือกใช้สารป้องกันกำจัดที่ถูกต้อง...',
      content: 'การสำรวจแปลงนาสม่ำเสมอเป็นกุญแจสำคัญ หากพบจุดสีน้ำตาลคล้ายรูปตาบนใบข้าว ควรรีบพ่นสารป้องกันกำจัดเชื้อราก่อนที่โรคจะลุกลามเข้าสู่คอรวงข้าว และหลีกเลี่ยงการใส่ปุ๋ยยูเรียมากเกินไปในช่วงที่มีฝนตกชุก'
    },
    {
      id: 'a3',
      title: 'ปุ๋ยเคมี vs ปุ๋ยอินทรีย์ ใช้ร่วมกันอย่างไรให้ได้ประโยชน์สูงสุด',
      cat: 'การจัดการดิน',
      date: '10 สิงหาคม 2568',
      readTime: '6 นาที',
      image: '../frontend/images/product-fertilizer.jpg',
      excerpt: 'การผสานจุดเด่นของปุ๋ยทั้งสองประเภท ช่วยปรับโครงสร้างดินให้โปร่งและให้อาหารพืชได้รวดเร็วทันใจ...',
      content: 'ปุ๋ยอินทรีย์ช่วยสร้างอินทรียวัตถุในดิน ทำให้ดินร่วนซุย อุ้มน้ำได้ดี ส่วนปุ๋ยเคมีให้ธาตุอาหารแก่พืชได้ทันท่วงที การนำมาใช้ร่วมกันจึงช่วยให้พืชเติบโตแข็งแรง สมบูรณ์ และรักษาความอุดมสมบูรณ์ของหน้าดินไว้ได้ยาวนาน'
    }
  ];

  /* --------------------------------------------------------------------------
     4. เมนูเว็บไซต์เริ่มต้น (Default Navigation Menus)
     -------------------------------------------------------------------------- */
  const DEFAULT_MENUS = [
    { id: 'm1', name: 'หน้าแรก', url: '../frontend/html/index.html', order: 1, isActive: true },
    { id: 'm2', name: 'เกี่ยวกับเรา', url: '../frontend/html/about.html', order: 2, isActive: true },
    { id: 'm3', name: 'ข่าวสารและกิจกรรม', url: '../frontend/html/news.html', order: 3, isActive: true },
    { id: 'm4', name: 'สินค้า', url: '../frontend/html/products.html', order: 4, isActive: true },
    { id: 'm5', name: 'ติดต่อเรา', url: '#contact', order: 5, isActive: true }
  ];

  /* --------------------------------------------------------------------------
     5. คลังรูปภาพเริ่มต้น (Default Media Library)
     -------------------------------------------------------------------------- */
  const DEFAULT_MEDIA = [
    { id: 'm1', name: 'picture 1.jpg', url: '../frontend/images/picture 1.jpg', tag: 'สไลด์/กิจกรรม', size: '4.8 MB' },
    { id: 'm2', name: 'picture 2.jpg', url: '../frontend/images/picture 2.jpg', tag: 'ความสำเร็จ', size: '4.7 MB' },
    { id: 'm3', name: 'picture 3.jpg', url: '../frontend/images/picture 3.jpg', tag: 'คลังสินค้า', size: '15.1 MB' },
    { id: 'm4', name: 'picture 4.jpg', url: '../frontend/images/picture 4.jpg', tag: 'ลงพื้นที่', size: '12.2 MB' },
    { id: 'm5', name: 'picture 5.jpg', url: '../frontend/images/picture 5.jpg', tag: 'ฝึกอบรม', size: '1.5 MB' },
    { id: 'm6', name: 'hero1.jpg', url: '../frontend/images/hero1.jpg', tag: 'ทุ่งนา/สไลด์', size: '927 KB' },
    { id: 'm7', name: 'hero2.jpg', url: '../frontend/images/hero2.jpg', tag: 'เทคโนโลยีเกษตร', size: '898 KB' },
    { id: 'm8', name: 'news-hero.jpg', url: '../frontend/images/news-hero.jpg', tag: 'ข่าวสาร', size: '1.0 MB' },
    { id: 'm9', name: 'product-fertilizer.jpg', url: '../frontend/images/product-fertilizer.jpg', tag: 'ปุ๋ยเคมี/อินทรีย์', size: '660 KB' },
    { id: 'm10', name: 'product-pesticide.jpg', url: '../frontend/images/product-pesticide.jpg', tag: 'กำจัดศัตรูพืช/วัชพืช', size: '593 KB' },
    { id: 'm11', name: 'product-hormone.jpg', url: '../frontend/images/product-hormone.jpg', tag: 'ฮอร์โมนพืช', size: '595 KB' },
    { id: 'm12', name: 'product-soil.jpg', url: '../frontend/images/product-soil.jpg', tag: 'ปรับปรุงดิน', size: '578 KB' },
    { id: 'm13', name: 'vg 1.jpg', url: '../frontend/images/vg 1.jpg', tag: 'เมล็ดพันธุ์ผัก', size: '333 KB' },
    { id: 'm14', name: 'vg 2.jpg', url: '../frontend/images/vg 2.jpg', tag: 'เมล็ดพันธุ์ข้าว', size: '315 KB' },
    { id: 'm15', name: 'vg 3.jpg', url: '../frontend/images/vg 3.jpg', tag: 'สินค้าเกษตร', size: '201 KB' },
    { id: 'm16', name: 'vg 4.jpg', url: '../frontend/images/vg 4.jpg', tag: 'อาหารสัตว์', size: '385 KB' }
  ];

  /* --------------------------------------------------------------------------
     6. สินค้าเริ่มต้น (Default Products - 8 หมวดหมู่)
     -------------------------------------------------------------------------- */
  const DEFAULT_PRODUCTS = [
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
      crops: ['rice', 'cassava', 'sugarcane', 'fruit', 'vegetable'],
      cropNames: ['ข้าว', 'มันสำปะหลัง', 'อ้อย', 'ไม้ผล', 'ผักทั่วไป'],
      image: '../frontend/images/product-fertilizer.jpg',
      createdAt: '2026-08-01'
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
      crops: ['rice', 'corn', 'sugarcane'],
      cropNames: ['ข้าว', 'ข้าวโพด', 'อ้อย'],
      image: '../frontend/images/product-fertilizer.jpg',
      createdAt: '2026-08-02'
    },
    {
      id: 'p3',
      name: 'Farmora Bio-Organic ปุ๋ยอินทรีย์อัดเม็ด',
      cat: 'organic',
      catName: 'ปุ๋ยอินทรีย์',
      price: 320,
      unit: '/กระสอบ 25 กก.',
      badge: 'eco',
      badgeText: '🌿 Organic',
      desc: 'ปุ๋ยอินทรีย์แท้ 100% หมักด้วยจุลินทรีย์สายพันธุ์ดี ฟื้นฟูดินเสื่อมสภาพ ดินร่วนซุย อุดมด้วยธาตุอาหารรอง',
      crops: ['rice', 'vegetable', 'fruit'],
      cropNames: ['ข้าว', 'ผักทั่วไป', 'ไม้ผล'],
      image: '../frontend/images/product-fertilizer.jpg',
      createdAt: '2026-08-03'
    },
    {
      id: 'p4',
      name: 'FarmoKill สารกำจัดหนอนกอและเพลี้ยไฟ',
      cat: 'pesticide',
      catName: 'สารกำจัดศัตรูพืช',
      price: 490,
      unit: '/ขวด 500 มล.',
      badge: 'hot',
      badgeText: '🔥 ขายดี',
      desc: 'กำจัดหนอนเจาะ หนอนม้วนใบ และเพลี้ยไฟในนาข้าวและพืชไร่ ออกฤทธิ์เร็ว คุมนาน ปลอดภัยต่อพืชประธาน',
      crops: ['rice', 'corn', 'vegetable'],
      cropNames: ['ข้าว', 'ข้าวโพด', 'ผักทั่วไป'],
      image: '../frontend/images/product-pesticide.jpg',
      createdAt: '2026-08-04'
    },
    {
      id: 'p5',
      name: 'FarmoClear สารกำจัดวัชพืชใบแคบและใบกว้าง',
      cat: 'herbicide',
      catName: 'สารกำจัดวัชพืช',
      price: 450,
      unit: '/แกลลอน 1 ล.',
      badge: '',
      badgeText: '',
      desc: 'กำจัดหญ้าข้าวนก หญ้าดอกขาว และผักปอดนาในแปลงนาข้าว ปลอดภัยต่อต้นข้าว ไม่ชะงักการเจริญเติบโต',
      crops: ['rice'],
      cropNames: ['ข้าว'],
      image: '../frontend/images/product-pesticide.jpg',
      createdAt: '2026-08-05'
    },
    {
      id: 'p6',
      name: 'FarmoRoot ฮอร์โมนเร่งรากและตาดอก',
      cat: 'hormone',
      catName: 'ฮอร์โมนพืช',
      price: 380,
      unit: '/ขวด 500 มล.',
      badge: 'star',
      badgeText: '⭐ แนะนำ',
      desc: 'กระตุ้นการแตกรากฝอยอย่างรวดเร็ว ขยายตาดอก ช่วยให้พืชดูดซึมธาตุอาหารได้เต็มที่ ติดผลดก',
      crops: ['fruit', 'vegetable'],
      cropNames: ['ไม้ผล', 'ผักทั่วไป'],
      image: '../frontend/images/product-hormone.jpg',
      createdAt: '2026-08-06'
    },
    {
      id: 'p7',
      name: 'Farmora Dolomite สารปรับปรุงดิน',
      cat: 'soil',
      catName: 'สารปรับปรุงดิน',
      price: 220,
      unit: '/กระสอบ 50 กก.',
      badge: '',
      badgeText: '',
      desc: 'ลดความเป็นกรดของดิน แก้ปัญหาดินเปรี้ยว ดินแน่นทึบ เติมแคลเซียมและแมกนีเซียมธรรมชาติให้ดิน',
      crops: ['rice', 'cassava', 'sugarcane'],
      cropNames: ['ข้าว', 'มันสำปะหลัง', 'อ้อย'],
      image: '../frontend/images/product-soil.jpg',
      createdAt: '2026-08-07'
    },
    {
      id: 'p8',
      name: 'เมล็ดพันธุ์แตงกวาญี่ปุ่น F1 พรีเมียม',
      cat: 'seeds',
      catName: 'เมล็ดพันธุ์ผักและข้าว',
      price: 180,
      unit: '/ซอง 100 เมล็ด',
      badge: 'new',
      badgeText: '✨ ใหม่',
      desc: 'เมล็ดพันธุ์แตงกวาญี่ปุ่นลูกดก ทนโรคราแป้ง ผลสีเขียวเข้ม รสชาติกรอบหวาน ไม่ขม ตลาดต้องการสูง',
      crops: ['vegetable'],
      cropNames: ['ผักทั่วไป'],
      image: '../frontend/images/vg 1.jpg',
      createdAt: '2026-08-08'
    },
    {
      id: 'p9',
      name: 'อาหารโคนมผสมสำเร็จรูป (TMR) โปรตีน 18%',
      cat: 'feed',
      catName: 'อาหารสัตว์',
      price: 450,
      unit: '/กระสอบ 30 กก.',
      badge: 'hot',
      badgeText: '🔥 ขายดี',
      desc: 'อาหารเสริมโปรตีนและแร่ธาตุคุณภาพสูงสำหรับโคนม ช่วยเพิ่มปริมาณน้ำนมและคุณภาพน้ำนมดิบ',
      crops: [],
      cropNames: ['ปศุสัตว์'],
      image: '../frontend/images/vg 4.jpg',
      createdAt: '2026-08-09'
    }
  ];

  /* --------------------------------------------------------------------------
     Core Data Access Functions (CRUD)
     -------------------------------------------------------------------------- */
  function getRaw(key, defaultData) {
    try {
      const stored = localStorage.getItem(key);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Error reading from localStorage for key:', key, e);
    }
    return defaultData;
  }

  function setRaw(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      window.dispatchEvent(new CustomEvent('farmora:dataChanged', { detail: { key: key } }));
    } catch (e) {
      console.error('Error saving to localStorage for key:', key, e);
    }
  }

  /* ── Initialize Data Store ── */
  function init() {
    if (!localStorage.getItem(STORAGE_KEYS.INITIALIZED)) {
      setRaw(STORAGE_KEYS.SLIDES, DEFAULT_SLIDES);
      setRaw(STORAGE_KEYS.NEWS, DEFAULT_NEWS);
      setRaw(STORAGE_KEYS.ARTICLES, DEFAULT_ARTICLES);
      setRaw(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);
      setRaw(STORAGE_KEYS.MENUS, DEFAULT_MENUS);
      setRaw(STORAGE_KEYS.MEDIA, DEFAULT_MEDIA);
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    }
  }

  // ── Slides API ──
  const Slides = {
    getAll: () => getRaw(STORAGE_KEYS.SLIDES, DEFAULT_SLIDES),
    getById: (id) => Slides.getAll().find(s => s.id === id),
    save: (slide) => {
      const list = Slides.getAll();
      const index = list.findIndex(s => s.id === slide.id);
      if (index >= 0) {
        list[index] = { ...list[index], ...slide, updatedAt: new Date().toISOString() };
      } else {
        slide.id = slide.id || 's_' + Date.now();
        slide.createdAt = new Date().toISOString();
        list.push(slide);
      }
      setRaw(STORAGE_KEYS.SLIDES, list);
      return slide;
    },
    delete: (id) => {
      const filtered = Slides.getAll().filter(s => s.id !== id);
      setRaw(STORAGE_KEYS.SLIDES, filtered);
    }
  };

  // ── News API ──
  const News = {
    getAll: () => getRaw(STORAGE_KEYS.NEWS, DEFAULT_NEWS),
    getById: (id) => News.getAll().find(n => n.id === id),
    save: (newsItem) => {
      const list = News.getAll();
      const index = list.findIndex(n => n.id === newsItem.id);
      if (index >= 0) {
        list[index] = { ...list[index], ...newsItem, updatedAt: new Date().toISOString() };
      } else {
        newsItem.id = newsItem.id || 'n_' + Date.now();
        newsItem.createdAt = new Date().toISOString();
        list.unshift(newsItem);
      }
      setRaw(STORAGE_KEYS.NEWS, list);
      return newsItem;
    },
    delete: (id) => {
      const filtered = News.getAll().filter(n => n.id !== id);
      setRaw(STORAGE_KEYS.NEWS, filtered);
    }
  };

  // ── Articles API ──
  const Articles = {
    getAll: () => getRaw(STORAGE_KEYS.ARTICLES, DEFAULT_ARTICLES),
    getById: (id) => Articles.getAll().find(a => a.id === id),
    save: (article) => {
      const list = Articles.getAll();
      const index = list.findIndex(a => a.id === article.id);
      if (index >= 0) {
        list[index] = { ...list[index], ...article, updatedAt: new Date().toISOString() };
      } else {
        article.id = article.id || 'a_' + Date.now();
        article.createdAt = new Date().toISOString();
        list.unshift(article);
      }
      setRaw(STORAGE_KEYS.ARTICLES, list);
      return article;
    },
    delete: (id) => {
      const filtered = Articles.getAll().filter(a => a.id !== id);
      setRaw(STORAGE_KEYS.ARTICLES, filtered);
    }
  };

  // ── Products API ──
  const Products = {
    getAll: () => getRaw(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS),
    getById: (id) => Products.getAll().find(p => p.id === id),
    save: (product) => {
      const list = Products.getAll();
      const index = list.findIndex(p => p.id === product.id);
      if (index >= 0) {
        list[index] = { ...list[index], ...product, updatedAt: new Date().toISOString() };
      } else {
        product.id = product.id || 'p_' + Date.now();
        product.createdAt = new Date().toISOString();
        list.unshift(product);
      }
      setRaw(STORAGE_KEYS.PRODUCTS, list);
      return product;
    },
    delete: (id) => {
      const filtered = Products.getAll().filter(p => p.id !== id);
      setRaw(STORAGE_KEYS.PRODUCTS, filtered);
    }
  };

  // ── Menus API ──
  const Menus = {
    getAll: () => getRaw(STORAGE_KEYS.MENUS, DEFAULT_MENUS),
    getById: (id) => Menus.getAll().find(m => m.id === id),
    save: (menu) => {
      const list = Menus.getAll();
      const index = list.findIndex(m => m.id === menu.id);
      if (index >= 0) {
        list[index] = { ...list[index], ...menu };
      } else {
        menu.id = menu.id || 'm_' + Date.now();
        list.push(menu);
      }
      setRaw(STORAGE_KEYS.MENUS, list);
      return menu;
    },
    delete: (id) => {
      const filtered = Menus.getAll().filter(m => m.id !== id);
      setRaw(STORAGE_KEYS.MENUS, filtered);
    }
  };

  // ── Media Library API ──
  const Media = {
    getAll: () => getRaw(STORAGE_KEYS.MEDIA, DEFAULT_MEDIA),
    add: (mediaItem) => {
      const list = Media.getAll();
      mediaItem.id = mediaItem.id || 'm_' + Date.now();
      list.unshift(mediaItem);
      setRaw(STORAGE_KEYS.MEDIA, list);
      return mediaItem;
    },
    delete: (id) => {
      const filtered = Media.getAll().filter(m => m.id !== id);
      setRaw(STORAGE_KEYS.MEDIA, filtered);
    }
  };

  // ── Backup & Restore ──
  const Backup = {
    exportJSON: () => {
      const data = {
        version: '2.0',
        exportedAt: new Date().toISOString(),
        slides: Slides.getAll(),
        news: News.getAll(),
        articles: Articles.getAll(),
        products: Products.getAll(),
        menus: Menus.getAll(),
        media: Media.getAll()
      };
      return JSON.stringify(data, null, 2);
    },
    importJSON: (jsonString) => {
      try {
        const parsed = JSON.parse(jsonString);
        if (parsed.slides) setRaw(STORAGE_KEYS.SLIDES, parsed.slides);
        if (parsed.news) setRaw(STORAGE_KEYS.NEWS, parsed.news);
        if (parsed.articles) setRaw(STORAGE_KEYS.ARTICLES, parsed.articles);
        if (parsed.products) setRaw(STORAGE_KEYS.PRODUCTS, parsed.products);
        if (parsed.menus) setRaw(STORAGE_KEYS.MENUS, parsed.menus);
        if (parsed.media) setRaw(STORAGE_KEYS.MEDIA, parsed.media);
        return { success: true };
      } catch (e) {
        return { success: false, error: e.message };
      }
    },
    resetDefaults: () => {
      setRaw(STORAGE_KEYS.SLIDES, DEFAULT_SLIDES);
      setRaw(STORAGE_KEYS.NEWS, DEFAULT_NEWS);
      setRaw(STORAGE_KEYS.ARTICLES, DEFAULT_ARTICLES);
      setRaw(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);
      setRaw(STORAGE_KEYS.MENUS, DEFAULT_MENUS);
      setRaw(STORAGE_KEYS.MEDIA, DEFAULT_MEDIA);
      return true;
    }
  };

  // Initialize on load
  init();

  // Export to Global Scope
  window.FarmoraDataStore = {
    Slides,
    News,
    Articles,
    Products,
    Menus,
    Media,
    Backup,
    resolveImg
  };

})(window);
