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
    THEME: 'farmora_theme_v2',
    SLIDES: 'farmora_slides_v2',
    ABOUT: 'farmora_about_v2',
    NEWS: 'farmora_news_v2',
    ARTICLES: 'farmora_articles_v2',
    PRODUCTS: 'farmora_products_v2',
    MENUS: 'farmora_menus_v2',
    MEDIA: 'farmora_media_v2',
    AUTH: 'farmora_auth_v2',
    INITIALIZED: 'farmora_backend_initialized_v2'
  };

  /* --------------------------------------------------------------------------
     0. ข้อมูลธีมและชุดสี CI บริษัทเริ่มต้น (Default Farmora Brand CI Theme)
     -------------------------------------------------------------------------- */
  const DEFAULT_THEME = {
    // 7 แม่สีอัตลักษณ์องค์กรของบริษัท Farmora (Official Brand CI Colors)
    ciColors: {
      forest:  { hex: '#0C7B3B', name: 'เขียวเข้มหลัก (Forest Green)', desc: 'สีอัตลักษณ์หลัก แสดงถึงความมั่นคงและธรรมชาติ' },
      primary: { hex: '#00A64C', name: 'เขียวสดใส (Emerald Green)',  desc: 'สีหลักแบรนด์ สื่อถึงผลผลิตที่งอกงามและความสดชื่น' },
      lime:    { hex: '#8EC64F', name: 'เขียวตองอ่อน (Fresh Lime)',   desc: 'สีไฮไลท์ความทันสมัย การเติบโต ยอดอ่อนพืชผล' },
      orange:  { hex: '#FF6F22', name: 'ส้มผลผลิต (Harvest Orange)',  desc: 'สีพลังงาน ความกระตือรือร้น และผลผลิตสุกงอม' },
      yellow:  { hex: '#FFE327', name: 'เหลืองรวงข้าว (Golden Grain)', desc: 'สีแห่งความรุ่งเรือง ความอุดมสมบูรณ์ และแสงแดด' },
      blue:    { hex: '#009CFF', name: 'ฟ้าสายน้ำ (Water Sky Blue)',   desc: 'สีชลประทาน เทคโนโลยีเกษตรแม่นยำ และความเย็น' },
      soil:    { hex: '#371000', name: 'น้ำตาลดินเข้ม (Earth Soil)',   desc: 'สีผืนดินอันอุดมสมบูรณ์ แร่ธาตุ และรากฐานที่มั่นคง' }
    },
    // ค่าสีที่ถูกนำไปประยุกต์ใช้งานในระบบ (Applied Theme Variables)
    primaryColor: '#00A64C',
    darkColor: '#0C7B3B',
    accentColor: '#8EC64F',
    sidebarBg: '#092615',
    sidebarText: '#ffffff',
    buttonOrange: '#FF6F22',
    shadowLevel: 'medium', // 'soft' | 'medium' | 'strong' | 'glow'
    borderRadius: '12px',  // '6px' | '12px' | '18px' | '24px'
    activePreset: 'official'
  };

  /* --------------------------------------------------------------------------
     0.1 ข้อมูลเริ่มต้นหน้าเกี่ยวกับเรา (Default About Us)
     -------------------------------------------------------------------------- */
  const DEFAULT_ABOUT = {
    hero: {
      badge: 'Farmora Official',
      title: 'เกี่ยวกับ ฟาร์โมรา (Farmora)',
      subtitle: 'ผู้นำด้านผลิตภัณฑ์การเกษตรครบวงจร ด้วยประสบการณ์กว่า 30 ปี มุ่งมั่นเคียงข้างและยกระดับคุณภาพชีวิตของเกษตรกรไทย'
    },
    stats: {
      stat1Num: '30+',
      stat1Label: 'ปีแห่งประสบการณ์',
      stat2Num: '500+',
      stat2Label: 'รายการผลิตภัณฑ์เกษตร',
      stat3Num: '10,000+',
      stat3Label: 'เกษตรกรและร้านค้าไว้วางใจ',
      stat4Num: '77',
      stat4Label: 'จังหวัดเครือข่ายจัดส่งทั่วไทย'
    },
    story: {
      companyName: 'บริษัท ฟาร์โมรา จำกัด',
      title: 'เพราะความสำเร็จของคุณ\nคือความสำเร็จของเรา',
      highlight: '"เราเชื่อมั่นว่า การเกษตรที่ดีต้องอาศัยทั้งองค์ความรู้ เทคโนโลยีสมัยใหม่ และผลิตภัณฑ์คุณภาพสูง เพื่อสร้างอนาคตที่มั่นคงให้เกษตรกรไทย"',
      image: '../frontend/images/picture 1.jpg',
      badgeYear: 'ก่อตั้งปี 2537',
      badgeText: 'กว่า 3 ทศวรรษแห่งความเชื่อมั่น',
      desc1: 'บริษัท ฟาร์โมรา จำกัด ก่อตั้งขึ้นเมื่อปี พ.ศ. 2537 ด้วยวิสัยทัศน์ที่ต้องการพัฒนาภาคเกษตรกรรมไทยให้เติบโตอย่างยั่งยืน เราเป็นผู้ผลิต นำเข้า และจัดจำหน่ายผลิตภัณฑ์การเกษตรครบวงจร ไม่ว่าจะเป็นเมล็ดพันธุ์ผักคุณภาพสูง เมล็ดพันธุ์ข้าวคัดพิเศษ ปุ๋ยอินทรีย์ปรับปรุงดิน สารชีวภัณฑ์ และอาหารสัตว์มาตรฐานสากล',
      desc2: 'ตลอดระยะเวลากว่า 30 ปี เราได้สั่งสมประสบการณ์และความเชี่ยวชาญ พร้อมทีมนักวิชาการเกษตรที่คอยลงพื้นที่จริง ให้คำปรึกษาและแนะนำการใช้ผลิตภัณฑ์อย่างถูกต้อง ปลอดภัย และเกิดผลผลิตสูงสุดแก่เกษตรกรทั่วประเทศ',
      checkpoints: [
        'คัดสรรเมล็ดพันธุ์ที่ทนทานต่อโรค ให้ผลผลิตดกสม่ำเสมอ',
        'ทีมนักวิชาการลงพื้นที่จริง เคียงข้างดูแลแปลงปลูกอย่างใกล้ชิด',
        'ระบบคลังสินค้ามาตรฐาน พร้อมบริการจัดส่งรวดเร็วถึงมือทั่วประเทศ'
      ]
    },
    visionMission: {
      vision: 'มุ่งสู่การเป็นแบรนด์ผลิตภัณฑ์การเกษตรอันดับหนึ่งในใจเกษตรกรไทย ที่ผสานนวัตกรรม เทคโนโลยี และภูมิปัญญาการเพาะปลูก เพื่อสร้างผลผลิตที่อุดมสมบูรณ์ และยกระดับมาตรฐานสินค้าเกษตรไทยสู่ระดับสากลอย่างยั่งยืน',
      mission: 'วิจัย คัดสรร และจัดจำหน่ายผลิตภัณฑ์การเกษตรที่มีประสิทธิภาพสูง ส่งมอบองค์ความรู้และเทคนิคการเพาะปลูกที่ทันสมัยอย่างต่อเนื่อง พร้อมทั้งสร้างเครือข่ายความร่วมมือกับเกษตรกรและชุมชน เพื่อผลผลิตที่คุ้มค่าและเป็นมิตรต่อสิ่งแวดล้อม'
    },
    timeline: [
      { id: 't1', year: 'พ.ศ. 2537', title: 'จุดเริ่มต้นและก่อตั้งบริษัท', desc: 'บริษัท ฟาร์โมรา จำกัด ก่อตั้งขึ้นโดยกลุ่มผู้เชี่ยวชาญด้านเกษตรกรรม เริ่มต้นจากการคัดสรรและจัดจำหน่ายปุ๋ยและปัจจัยการผลิตคุณภาพสูง' },
      { id: 't2', year: 'พ.ศ. 2548', title: 'ขยายศูนย์กระจายสินค้าและเมล็ดพันธุ์', desc: 'ขยายสายการผลิตเมล็ดพันธุ์ผักและข้าว พร้อมสร้างระบบคลังสินค้ามาตรฐานเพื่อรองรับการจัดส่งครอบคลุมภาคตะวันออกเฉียงเหนือและทั่วประเทศ' },
      { id: 't3', year: 'พ.ศ. 2558', title: 'เกษตรแม่นยำและนวัตกรรมดิน', desc: 'ริเริ่มโครงการพัฒนาสารปรับปรุงดินและปุ๋ยอินทรีย์ชีวภาพ ผสานเทคโนโลยีการเกษตรสมัยใหม่เพื่อเพิ่มประสิทธิภาพการดูดซึมธาตุอาหารของพืช' },
      { id: 't4', year: 'พ.ศ. 2568 - ปัจจุบัน', title: 'ก้าวสู่ยุคเกษตรอัจฉริยะ (Smart Agriculture)', desc: 'ยกระดับการให้บริการด้วยระบบดิจิทัล จัดส่งสินค้าทั่วไทยถึงมือเกษตรกร พร้อมเดินหน้าสู่ความยั่งยืนทางอาหารและสิ่งแวดล้อม' }
    ],
    values: [
      { id: 'v1', icon: 'fa-seedling', title: 'ยกระดับผลผลิต', desc: 'ส่งมอบผลิตภัณฑ์คุณภาพที่ช่วยเพิ่มปริมาณและคุณภาพผลผลิตให้คุ้มค่าการลงทุน' },
      { id: 'v2', icon: 'fa-truck-fast', title: 'พร้อมส่งทั่วไทย', desc: 'เครือข่ายโลจิสติกส์ที่รวดเร็ว ปลอดภัย ทันต่อทุกฤดูกาลเพาะปลูกของเกษตรกร' },
      { id: 'v3', icon: 'fa-users', title: 'ลงพื้นที่จริง', desc: 'เคียงข้างเกษตรกร เข้าถึงแปลงปลูกจริงเพื่อรับฟังและร่วมแก้ปัญหาอย่างตรงจุด' },
      { id: 'v4', icon: 'fa-book-open-reader', title: 'ก้าวทันเทรนด์', desc: 'อัปเดตนวัตกรรมและแบ่งปันองค์ความรู้เกษตรสมัยใหม่อยู่เสมอ' }
    ]
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
      title: 'Farmora เปิดตัวคลังกระจายสินค้าใหม่ภาคอีสาน พร้อมส่งด่วนถึงแปลงภายใน 24 ชม.',
      cat: 'news',
      category: 'news',
      catName: 'ข่าวล่าสุด',
      categoryName: 'ข่าวล่าสุด',
      categoryClass: 'cat-news',
      date: '8 กันยายน 2568',
      views: '1,840 ครั้ง',
      author: 'ทีมข่าว Farmora',
      image: '../frontend/images/news-hero.jpg',
      isFeatured: true,
      isHot: false,
      excerpt: 'ยกระดับความเร็วในการจัดส่งปุ๋ยเคมี ปุ๋ยอินทรีย์ และชีวภัณฑ์เกษตรสู่มือเกษตรกรและร้านค้าตัวแทน ทันต่อทุกช่วงเวลาการเพาะปลูก ด้วยระบบคลังดิจิทัลมาตรฐานสากล',
      content: `บริษัท ฟาร์โมรา จำกัด ผู้นำด้านผลิตภัณฑ์และนวัตกรรมการเกษตรครบวงจร ประกาศเปิดตัวศูนย์กระจายสินค้าและคลังสินค้าแห่งใหม่ในภาคตะวันออกเฉียงเหนืออย่างเป็นทางการ เพื่อรองรับความต้องการปุ๋ยเคมี ปุ๋ยอินทรีย์ และผลิตภัณฑ์อารักขาพืชที่เพิ่มสูงขึ้นของพี่น้องเกษตรกรในพื้นที่\n\nคลังสินค้าแห่งใหม่นี้ตั้งอยู่บนจุดยุทธศาสตร์การคมนาคมที่สะดวก พร้อมด้วยระบบบริหารจัดการคลังสินค้าแบบดิจิทัล (WMS) ที่สามารถตรวจสอบสต็อกและจัดเตรียมสินค้าได้อย่างแม่นยำ พร้อมบริการจัดส่งด่วน "Farmora Express" ถึงหน้าแปลงปลูกของเกษตรกรและร้านค้าตัวแทนจำหน่ายภายใน 24-48 ชั่วโมง\n\nนายสมเกียรติ ตัวแทนผู้บริหาร Farmora กล่าวว่า "หัวใจของการทำเกษตรคือ 'เวลา' หากปุ๋ยหรือยาไปไม่ทันช่วงฝนตกหรือช่วงที่แมลงระบาด ผลผลิตอาจเสียหายได้ การเปิดคลังสินค้าแห่งนี้จึงเป็นการตอกย้ำพันธกิจตลอด 30 ปีของเรา ในการอยู่เคียงข้างและช่วยให้เกษตรกรไทยทำงานได้อย่างมั่นใจที่สุด"`
    },
    {
      id: 'n2',
      title: 'เปิดตัว "FarmoShield Pro" ชีวภัณฑ์กำจัดแมลงสูตรพิเศษ ปลอดภัยต่อเกษตรกรและผู้บริโภค',
      cat: 'news',
      category: 'news',
      catName: 'ข่าวล่าสุด',
      categoryName: 'ข่าวล่าสุด',
      categoryClass: 'cat-news',
      date: '2 กันยายน 2568',
      views: '2,150 ครั้ง',
      author: 'ฝ่ายวิจัยและพัฒนา',
      image: '../frontend/images/product-pesticide.jpg',
      isFeatured: false,
      isHot: true,
      excerpt: 'Farmora เปิดตัวนวัตกรรมสารชีวภัณฑ์รุ่นล่าสุด FarmoShield Pro ผ่านการทดสอบจากห้องปฏิบัติการมาตรฐาน กำจัดหนอนและเพลี้ยดื้อยาได้อย่างมีประสิทธิภาพ ไร้สารเคมีตกค้าง...',
      content: `Farmora R&D เปิดตัวผลิตภัณฑ์ไฮไลต์ประจำปี "FarmoShield Pro" นวัตกรรมสารชีวภัณฑ์เพื่อการป้องกันและกำจัดแมลงศัตรูพืชสูตรเข้มข้นพิเศษ ที่ผ่านการค้นคว้าวิจัยและทดสอบประสิทธิภาพในแปลงจริงกว่า 2 ปี\n\nFarmoShield Pro ออกฤทธิ์ทำลายระบบทางเดินอาหารของหนอนใยผัก หนอนกระทู้ และเพลี้ยไฟอย่างแม่นยำ แต่มีความปลอดภัยสูงมากต่อแมลงที่เป็นประโยชน์ เช่น ผึ้ง แมลงตอมเกสร และปลอดภัยต่อผู้ฉีดพ่น ไร้สารพิษตกค้างในผลผลิต สามารถเก็บเกี่ยวได้หลังฉีดพ่นเพียง 1 วัน ตอบโจทย์การทำเกษตรปลอดภัยและมาตรฐาน GAP สากล`
    },
    {
      id: 'n3',
      title: 'Farmora คว้ารางวัล "ผู้ประกอบการเคมีเกษตรยอดเยี่ยมแห่งปี 2568" จากสมาคมอารักขาพืช',
      cat: 'news',
      category: 'news',
      catName: 'ข่าวล่าสุด',
      categoryName: 'ข่าวล่าสุด',
      categoryClass: 'cat-news',
      date: '25 สิงหาคม 2568',
      views: '980 ครั้ง',
      author: 'ประชาสัมพันธ์องค์กร',
      image: '../frontend/images/cert-iso.jpg',
      isFeatured: false,
      isHot: false,
      excerpt: 'รางวัลเกียรติยศการันตีคุณภาพและความโปร่งใสในการดำเนินธุรกิจเกษตรที่เป็นมิตรต่อสิ่งแวดล้อม และยึดมั่นในความซื่อสัตย์ต่อเกษตรกรไทยมาตลอด 30 ปี...',
      content: `บริษัท ฟาร์โมรา จำกัด ได้รับเกียรติสูงสุดในการรับมอบรางวัล "ผู้ประกอบการเคมีเกษตรยอดเยี่ยมแห่งปี 2568" (Agrochemical Excellence Award 2025) ในงานประชุมวิชาการเกษตรระดับประเทศ\n\nคณะกรรมการได้พิจารณาตัดสินจากเกณฑ์ด้านมาตรฐานการผลิต การควบคุมคุณภาพที่แม่นยำ การจัดอบรมให้ความรู้เรื่องความปลอดภัยแก่เกษตรกรในชุมชนอย่างต่อเนื่อง รวมถึงการดำเนินกิจกรรมเพื่อสังคม (CSR) ช่วยเหลือเกษตรกรประสบภัยธรรมชาติอย่างต่อเนื่อง Farmora ขอขอบพระคุณพี่น้องเกษตรกรทุกท่านที่ให้ความไว้วางใจมาโดยตลอด`
    },
    {
      id: 'n4',
      title: 'ภาพบรรยากาศงาน "วันเกษตรกร Field Day 2568" เกษตรกรแห่ร่วมงานกว่า 1,500 ราย',
      cat: 'activity',
      category: 'activity',
      catName: 'กิจกรรมที่ผ่านมา',
      categoryName: 'กิจกรรมที่ผ่านมา',
      categoryClass: 'cat-activity',
      date: '18 สิงหาคม 2568',
      views: '3,420 ครั้ง',
      author: 'ฝ่ายส่งเสริมการตลาด',
      image: '../frontend/images/about-team.jpg',
      isFeatured: false,
      isHot: true,
      excerpt: 'ประมวลภาพความประทับใจ งานวันเกษตรกร Field Day นำทีมนักวิชาการลงพื้นที่สาธิตแปลงจริง แลกเปลี่ยนเทคนิคการจัดการแปลง และแจกของรางวัลมากมาย...',
      content: `Farmora จัดงานมหกรรม "วันเกษตรกร Field Day 2568" ณ แปลงสาธิตการเกษตร มีพี่น้องเกษตรกรทั้งชาวนา ชาวสวนผัก และผู้ปลูกพืชไร่เข้าร่วมงานอย่างคับคั่งกว่า 1,500 คน\n\nภายในงานประกอบด้วย 4 ฐานการเรียนรู้เชิงลึก:\n1. ฐานตรวจเช็กสุขภาพดินและวิเคราะห์ธาตุอาหารฟรี\n2. ฐานสาธิตการใช้โดรนเพื่อการเกษตรพ่นปุ๋ยและยาอย่างแม่นยำ\n3. ฐานคำนวณสูตรปุ๋ยตามระยะการเจริญเติบโตเพื่อลดต้นทุน\n4. ฐานถาม-ตอบปัญหาศัตรูพืชกับผู้เชี่ยวชาญ\n\nนอกจากความรู้ที่ได้รับกลับไปเต็มกระเป๋าแล้ว ยังมีการจับสลากแจกปุ๋ยฟรี อุปกรณ์พ่นยา และของที่ระลึกกว่า 500 รางวัล สร้างรอยยิ้มและความผูกพันอันอบอุ่นระหว่าง Farmora และชุมชน`
    },
    {
      id: 'n5',
      title: 'อบรมเชิงปฏิบัติการ "เกษตรปลอดภัย ใช้ปุ๋ยยาถูกวิธี เพิ่มผลผลิตคูณสอง"',
      cat: 'activity',
      category: 'activity',
      catName: 'กิจกรรมที่ผ่านมา',
      categoryName: 'กิจกรรมที่ผ่านมา',
      categoryClass: 'cat-activity',
      date: '5 สิงหาคม 2568',
      views: '1,410 ครั้ง',
      author: 'ฝ่ายวิชาการ Farmora',
      image: '../frontend/images/about-lab.jpg',
      isFeatured: false,
      isHot: false,
      excerpt: 'ทีมนักวิชาการเกษตร Farmora จัดคอร์สอบรมฟรีให้แก่กลุ่มเกษตรกรแปลงใหญ่ มุ่งเน้นการผสมสารเคมีอย่างถูกวิธี และการป้องกันตัวจากละอองสารเคมี...',
      content: `เพื่อสร้างความเข้าใจที่ถูกต้องในการใช้ปัจจัยการผลิต ทีมวิชาการ Farmora ได้จัดโครงการฝึกอบรมเชิงปฏิบัติการ "เกษตรปลอดภัย ใช้ปุ๋ยยาถูกวิธี" ให้แก่ผู้นำกลุ่มเกษตรกรและสมาชิกแปลงใหญ่\n\nการอบรมเน้นการลงมือปฏิบัติจริง เช่น การทดสอบความเข้ากันได้ของสารผสม, การเลือกขนาดหัวฉีด, การปรับค่า pH ของน้ำผสมสาร และการสวมใส่อุปกรณ์ป้องกันตนเอง (PPE) ที่ถูกต้อง ซึ่งช่วยลดต้นทุนการใช้สารเคมีลงได้ถึง 20-30% พร้อมสุขภาพที่ปลอดภัยยิ่งขึ้น`
    },
    {
      id: 'n6',
      title: 'โครงการ Farmora CSR ปันน้ำใจ มอบเมล็ดพันธุ์และปุ๋ยฟื้นฟูแปลงหลังน้ำท่วม',
      cat: 'activity',
      category: 'activity',
      catName: 'กิจกรรมที่ผ่านมา',
      categoryName: 'กิจกรรมที่ผ่านมา',
      categoryClass: 'cat-activity',
      date: '20 กรกฎาคม 2568',
      views: '1,120 ครั้ง',
      author: 'ฝ่ายกิจกรรมเพื่อสังคม',
      image: '../frontend/images/about-history.jpg',
      isFeatured: false,
      isHot: false,
      excerpt: 'ฝ่ายกิจกรรมเพื่อสังคม Farmora ลงพื้นที่ช่วยเหลือเกษตรกรผู้ประสบภัยน้ำท่วม มอบปัจจัยการผลิตและสารปรับปรุงดินเพื่อเร่งฟื้นฟูแปลงเกษตร...',
      content: `จากเหตุการณ์อุทกภัยในพื้นที่เพาะปลูกหลายอำเภอ Farmora ได้จัดตั้งโครงการช่วยเหลือฉุกเฉิน "Farmora ปันน้ำใจ ฟื้นฟูแปลงเกษตร" นำคณะผู้บริหารและพนักงานลงพื้นที่มอบเมล็ดพันธุ์ผักโตไว สารปรับปรุงสภาพดินเพื่อแก้ปัญหารากเน่าโคนเน่า และปุ๋ยฮอร์โมนฟื้นฟูระบบราก ให้แก่ครอบครัวเกษตรกรที่ได้รับผลกระทบ เพื่อให้สามารถกลับมาเพาะปลูกและสร้างรายได้ใหม่อีกครั้งโดยเร็ว`
    },
    {
      id: 'n7',
      title: '5 เคล็ดลับการเตรียมดินและผสมสูตรปุ๋ย สำหรับนาข้าวให้ได้ผลผลิตตันต่อไร่',
      cat: 'article',
      category: 'article',
      catName: 'บทความ',
      categoryName: 'บทความ',
      categoryClass: 'cat-article',
      date: '12 กรกฎาคม 2568',
      views: '4,520 ครั้ง',
      author: 'อาจารย์ผู้เชี่ยวชาญด้านพืชไร่',
      image: '../frontend/images/product-fertilizer.jpg',
      isFeatured: false,
      isHot: true,
      excerpt: 'เจาะลึกเทคนิคการปรับปรุงโครงสร้างดิน การไถกลบตอซัง และตารางการใส่ปุ๋ย 3 ช่วงสำคัญของข้าว เพื่อสร้างรวงใหญ่ เมล็ดเต็ม น้ำหนักดี...',
      content: `การทำนาข้าวให้ได้ผลผลิตแตะ 1 ตันต่อไร่ ไม่ใช่เรื่องไกลเกินจริง หากเข้าใจหัวใจสำคัญ 5 ประการ:\n1. การปรับปรุงสภาพดิน\n2. ตรวจสอบค่าความเป็นกรด-ด่าง (pH)\n3. การใส่ปุ๋ยรองพื้น\n4. การใส่ปุ๋ยแต่งหน้า\n5. การจัดการน้ำแบบเปียกสลับแห้ง`
    },
    {
      id: 'n8',
      title: 'วิธีสังเกตและรับมือโรคราน้ำค้าง-เพลี้ยไฟระบาดในพืชผักสวนครัวช่วงฤดูฝน',
      cat: 'article',
      category: 'article',
      catName: 'บทความ',
      categoryName: 'บทความ',
      categoryClass: 'cat-article',
      date: '28 มิถุนายน 2568',
      views: '3,180 ครั้ง',
      author: 'ทีมวิชาการอารักขาพืช',
      image: '../frontend/images/product-soil.jpg',
      isFeatured: false,
      isHot: false,
      excerpt: 'ช่วงหน้าฝนความชื้นสูง เป็นบ่อเกิดของเชื้อราและแมลงศัตรูพืช เรียนรู้วิธีสังเกตอาการแต่เนิ่นๆ และวิธีป้องกันแบบผสมผสาน (IPM)...',
      content: `สภาพอากาศร้อนชื้นสลับฝนตกชุก มักเป็นสภาพแวดล้อมที่เอื้อต่อการแพร่ระบาดของโรคพืชและแมลงศัตรูพืชอย่างรวดเร็ว อาการสำคัญที่ต้องระวังได้แก่ โรคราน้ำค้าง และเพลี้ยไฟดูดกินน้ำเลี้ยงยอดอ่อน`
    },
    {
      id: 'n9',
      title: 'Smart Farming: การนำโดรนการเกษตรมาประยุกต์ใช้เพื่อลดต้นทุนและแม่นยำยิ่งขึ้น',
      cat: 'article',
      category: 'article',
      catName: 'บทความ',
      categoryName: 'บทความ',
      categoryClass: 'cat-article',
      date: '15 มิถุนายน 2568',
      views: '2,890 ครั้ง',
      author: 'นวัตกรรมเกษตรยุคใหม่',
      image: '../frontend/images/product-hormone.jpg',
      isFeatured: false,
      isHot: false,
      excerpt: 'ทำไมโดรนเพื่อการเกษตรจึงกลายเป็นผู้ช่วยอันดับหนึ่งของเกษตรกรยุค 4.0 เปรียบเทียบความคุ้มค่า ความเร็ว และการประหยัดสารเคมี...',
      content: `ในยุคที่แรงงานภาคเกษตรเริ่มขาดแคลนและค่าแรงสูงขึ้น เทคโนโลยีโดรนการเกษตรได้เข้ามาปฏิวัติรูปแบบการทำงานของเกษตรกรไทย ทั้งการประหยัดเวลา ละอองฝอยละเอียดสม่ำเสมอ และปลอดภัยต่อสุขภาพเกษตรกร`
    },
    {
      id: 'n10',
      title: 'โปรโมชั่นเปิดฤดูกาลเพาะปลูก! ลดสูงสุด 25% ปุ๋ยและสารบำรุงพืชทุกรายการ',
      cat: 'promotion',
      category: 'promotion',
      catName: 'โปรโมชั่น',
      categoryName: 'โปรโมชั่น',
      categoryClass: 'cat-promotion',
      date: '1 มิถุนายน 2568',
      views: '5,100 ครั้ง',
      author: 'ฝ่ายส่งเสริมการขาย',
      image: '../frontend/images/vg 1.jpg',
      isFeatured: false,
      isHot: true,
      excerpt: 'พิเศษเฉพาะเดือนนี้! สั่งซื้อปุ๋ยเคมี ปุ๋ยอินทรีย์ หรือฮอร์โมนพืช รับส่วนลดทันทีสูงสุด 25% พร้อมบริการส่งฟรีทั่วไทยเมื่อสั่งครบเงื่อนไข...',
      content: `Farmora จัดแคมเปญใหญ่ต้อนรับฤดูทำนาและเพาะปลูกพืชไร่ มอบความคุ้มค่าให้พี่น้องเกษตรกรทั่วประเทศด้วยส่วนลดทันที 15-25% พร้อมของแถมพิเศษ`
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
      setRaw(STORAGE_KEYS.THEME, DEFAULT_THEME);
      setRaw(STORAGE_KEYS.SLIDES, DEFAULT_SLIDES);
      setRaw(STORAGE_KEYS.ABOUT, DEFAULT_ABOUT);
      setRaw(STORAGE_KEYS.NEWS, DEFAULT_NEWS);
      setRaw(STORAGE_KEYS.ARTICLES, DEFAULT_ARTICLES);
      setRaw(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);
      setRaw(STORAGE_KEYS.MENUS, DEFAULT_MENUS);
      setRaw(STORAGE_KEYS.MEDIA, DEFAULT_MEDIA);
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    }
    // ตรวจสอบและตั้งค่าเริ่มต้นธีม CI หากยังไม่มี
    if (!localStorage.getItem(STORAGE_KEYS.THEME)) {
      setRaw(STORAGE_KEYS.THEME, DEFAULT_THEME);
    }
    // ตรวจสอบและตั้งค่าเริ่มต้นหน้าเกี่ยวกับเราหากยังไม่มี
    if (!localStorage.getItem(STORAGE_KEYS.ABOUT)) {
      setRaw(STORAGE_KEYS.ABOUT, DEFAULT_ABOUT);
    }
    // ตรวจสอบและอัปเกรดฐานข้อมูลข่าวสารให้เป็นชุดข่าวเต็ม 10 รายการ และมีข่าวเด่นประจำสัปดาห์
    const existingNews = getRaw(STORAGE_KEYS.NEWS, []);
    const hasFeaturedWarehouseNews = existingNews.some(n => n.id === 'n1' || (n.title && n.title.includes('เปิดตัวคลังกระจายสินค้า')));
    if (!hasFeaturedWarehouseNews || existingNews.length < 5) {
      setRaw(STORAGE_KEYS.NEWS, DEFAULT_NEWS);
    }
  }

  // ── Theme & CI Colors API ──
  const Theme = {
    get: () => getRaw(STORAGE_KEYS.THEME, DEFAULT_THEME),
    save: (themeData) => {
      const current = Theme.get();
      const updated = {
        ...current,
        ...themeData,
        updatedAt: new Date().toISOString()
      };
      setRaw(STORAGE_KEYS.THEME, updated);
      window.dispatchEvent(new CustomEvent('farmora:themeChanged', { detail: updated }));
      return updated;
    },
    reset: () => {
      setRaw(STORAGE_KEYS.THEME, DEFAULT_THEME);
      window.dispatchEvent(new CustomEvent('farmora:themeChanged', { detail: DEFAULT_THEME }));
      return DEFAULT_THEME;
    }
  };

  // ── About Us API ──
  const About = {
    get: () => getRaw(STORAGE_KEYS.ABOUT, DEFAULT_ABOUT),
    save: (aboutData) => {
      const current = About.get();
      const updated = {
        ...current,
        ...aboutData,
        updatedAt: new Date().toISOString()
      };
      setRaw(STORAGE_KEYS.ABOUT, updated);
      return updated;
    },
    // Timeline CRUD
    addTimelineItem: (item) => {
      const data = About.get();
      data.timeline = data.timeline || [];
      item.id = item.id || 't_' + Date.now();
      data.timeline.push(item);
      About.save(data);
      return item;
    },
    updateTimelineItem: (id, updatedFields) => {
      const data = About.get();
      data.timeline = data.timeline || [];
      const idx = data.timeline.findIndex(t => t.id === id);
      if (idx >= 0) {
        data.timeline[idx] = { ...data.timeline[idx], ...updatedFields };
        About.save(data);
        return data.timeline[idx];
      }
      return null;
    },
    deleteTimelineItem: (id) => {
      const data = About.get();
      data.timeline = (data.timeline || []).filter(t => t.id !== id);
      About.save(data);
      return true;
    }
  };

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
    getFeatured: () => {
      const list = News.getAll();
      return list.find(n => n.isFeatured) || list[0];
    },
    setFeatured: (id) => {
      const list = News.getAll();
      list.forEach(n => {
        n.isFeatured = (n.id === id);
      });
      setRaw(STORAGE_KEYS.NEWS, list);
      return News.getFeatured();
    },
    save: (newsItem) => {
      const list = News.getAll();
      if (newsItem.isFeatured) {
        // หากตั้งรายการนี้เป็นข่าวเด่น ให้ปลดข่าวเด่นเดิมออก
        list.forEach(n => {
          if (n.id !== newsItem.id) n.isFeatured = false;
        });
      }
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
        theme: Theme.get(),
        about: About.get(),
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
        if (parsed.theme) setRaw(STORAGE_KEYS.THEME, parsed.theme);
        if (parsed.about) setRaw(STORAGE_KEYS.ABOUT, parsed.about);
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
      setRaw(STORAGE_KEYS.THEME, DEFAULT_THEME);
      setRaw(STORAGE_KEYS.ABOUT, DEFAULT_ABOUT);
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
    Theme,
    About,
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
