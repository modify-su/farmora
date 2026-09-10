/**
 * ==========================================================================
 * 🌿 Farmora Official — News & Activities JS (สคริปต์หน้าข่าวสารและกิจกรรม)
 * ==========================================================================
 * ฟังก์ชันการทำงานหลัก:
 * 1. ตรวจจับ URL parameter (?cat=news, ?cat=activity, ?cat=article) และเลือกแท็บอัตโนมัติ
 * 2. กรองข่าวสารตามหมวดหมู่ (Tabs & Sidebar sync)
 * 3. ระบบค้นหาข่าวสารแบบ Real-time (Instant Search)
 * 4. Interactive Modal Pop-up แสดงรายละเอียดเนื้อหาข่าวแบบเต็ม
 * 5. Mobile Hamburger Navigation
 * ==========================================================================
 */

(function () {
  'use strict';

  // ฐานข้อมูลเนื้อหาข่าวสารแบบละเอียด (สำหรับ Modal & Grid)
  const NEWS_DATA = [
    {
      id: 'n1',
      category: 'news',
      categoryName: 'ข่าวล่าสุด',
      categoryClass: 'cat-news',
      title: 'Farmora เปิดตัวคลังกระจายสินค้าใหม่ภาคอีสาน พร้อมส่งด่วนถึงแปลงภายใน 24 ชม.',
      date: '8 กันยายน 2568',
      views: '1,840 ครั้ง',
      author: 'ทีมข่าว Farmora',
      image: '../images/news-hero.jpg',
      isFeatured: true,
      excerpt: 'Farmora เดินหน้าขยายศักยภาพโลจิสติกส์การเกษตร เปิดศูนย์กระจายสินค้าแห่งใหม่ใจกลางภาคอีสาน ยกระดับการจัดส่งปุ๋ยและปัจจัยการผลิตสู่มือเกษตรกรได้อย่างรวดเร็ว ทันต่อช่วงเวลาเพาะปลูก...',
      fullContent: `บริษัท ฟาร์โมรา จำกัด ผู้นำด้านผลิตภัณฑ์และนวัตกรรมการเกษตรครบวงจร ประกาศเปิดตัวศูนย์กระจายสินค้าและคลังสินค้าแห่งใหม่ในภาคตะวันออกเฉียงเหนืออย่างเป็นทางการ เพื่อรองรับความต้องการปุ๋ยเคมี ปุ๋ยอินทรีย์ และผลิตภัณฑ์อารักขาพืชที่เพิ่มสูงขึ้นของพี่น้องเกษตรกรในพื้นที่

คลังสินค้าแห่งใหม่นี้ตั้งอยู่บนจุดยุทธศาสตร์การคมนาคมที่สะดวก พร้อมด้วยระบบบริหารจัดการคลังสินค้าแบบดิจิทัล (WMS) ที่สามารถตรวจสอบสต็อกและจัดเตรียมสินค้าได้อย่างแม่นยำ พร้อมบริการจัดส่งด่วน "Farmora Express" ถึงหน้าแปลงปลูกของเกษตรกรและร้านค้าตัวแทนจำหน่ายภายใน 24-48 ชั่วโมง

นายสมเกียรติ ตัวแทนผู้บริหาร Farmora กล่าวว่า "หัวใจของการทำเกษตรคือ 'เวลา' หากปุ๋ยหรือยาไปไม่ทันช่วงฝนตกหรือช่วงที่แมลงระบาด ผลผลิตอาจเสียหายได้ การเปิดคลังสินค้าแห่งนี้จึงเป็นการตอกย้ำพันธกิจตลอด 30 ปีของเรา ในการอยู่เคียงข้างและช่วยให้เกษตรกรไทยทำงานได้อย่างมั่นใจที่สุด"`
    },
    {
      id: 'n2',
      category: 'news',
      categoryName: 'ข่าวล่าสุด',
      categoryClass: 'cat-news',
      title: 'เปิดตัว "FarmoShield Pro" ชีวภัณฑ์กำจัดแมลงสูตรพิเศษ ปลอดภัยต่อเกษตรกรและผู้บริโภค',
      date: '2 กันยายน 2568',
      views: '2,150 ครั้ง',
      author: 'ฝ่ายวิจัยและพัฒนา',
      image: '../images/product-pesticide.jpg',
      isHot: true,
      excerpt: 'Farmora เปิดตัวนวัตกรรมสารชีวภัณฑ์รุ่นล่าสุด FarmoShield Pro ผ่านการทดสอบจากห้องปฏิบัติการมาตรฐาน กำจัดหนอนและเพลี้ยดื้อยาได้อย่างมีประสิทธิภาพ ไร้สารเคมีตกค้าง...',
      fullContent: `Farmora R&D เปิดตัวผลิตภัณฑ์ไฮไลต์ประจำปี "FarmoShield Pro" นวัตกรรมสารชีวภัณฑ์เพื่อการป้องกันและกำจัดแมลงศัตรูพืชสูตรเข้มข้นพิเศษ ที่ผ่านการค้นคว้าวิจัยและทดสอบประสิทธิภาพในแปลงจริงกว่า 2 ปี

FarmoShield Pro ออกฤทธิ์ทำลายระบบทางเดินอาหารของหนอนใยผัก หนอนกระทู้ และเพลี้ยไฟอย่างแม่นยำ แต่มีความปลอดภัยสูงมากต่อแมลงที่เป็นประโยชน์ เช่น ผึ้ง แมลงตอมเกสร และปลอดภัยต่อผู้ฉีดพ่น ไร้สารพิษตกค้างในผลผลิต สามารถเก็บเกี่ยวได้หลังฉีดพ่นเพียง 1 วัน ตอบโจทย์การทำเกษตรปลอดภัยและมาตรฐาน GAP สากล`
    },
    {
      id: 'n3',
      category: 'news',
      categoryName: 'ข่าวล่าสุด',
      categoryClass: 'cat-news',
      title: 'Farmora คว้ารางวัล "ผู้ประกอบการเคมีเกษตรยอดเยี่ยมแห่งปี 2568" จากสมาคมอารักขาพืช',
      date: '25 สิงหาคม 2568',
      views: '980 ครั้ง',
      author: 'ประชาสัมพันธ์องค์กร',
      image: '../images/cert-iso.jpg',
      excerpt: 'รางวัลเกียรติยศการันตีคุณภาพและความโปร่งใสในการดำเนินธุรกิจเกษตรที่เป็นมิตรต่อสิ่งแวดล้อม และยึดมั่นในความซื่อสัตย์ต่อเกษตรกรไทยมาตลอด 30 ปี...',
      fullContent: `บริษัท ฟาร์โมรา จำกัด ได้รับเกียรติสูงสุดในการรับมอบรางวัล "ผู้ประกอบการเคมีเกษตรยอดเยี่ยมแห่งปี 2568" (Agrochemical Excellence Award 2025) ในงานประชุมวิชาการเกษตรระดับประเทศ

คณะกรรมการได้พิจารณาตัดสินจากเกณฑ์ด้านมาตรฐานการผลิต การควบคุมคุณภาพที่แม่นยำ การจัดอบรมให้ความรู้เรื่องความปลอดภัยแก่เกษตรกรในชุมชนอย่างต่อเนื่อง รวมถึงการดำเนินกิจกรรมเพื่อสังคม (CSR) ช่วยเหลือเกษตรกรประสบภัยธรรมชาติอย่างต่อเนื่อง Farmora ขอขอบพระคุณพี่น้องเกษตรกรทุกท่านที่ให้ความไว้วางใจมาโดยตลอด`
    },
    {
      id: 'n4',
      category: 'activity',
      categoryName: 'กิจกรรมที่ผ่านมา',
      categoryClass: 'cat-activity',
      title: 'ภาพบรรยากาศงาน "วันเกษตรกร Field Day 2568" เกษตรกรแห่ร่วมงานกว่า 1,500 ราย',
      date: '18 สิงหาคม 2568',
      views: '3,420 ครั้ง',
      author: 'ฝ่ายส่งเสริมการตลาด',
      image: '../images/about-team.jpg',
      isHot: true,
      excerpt: 'ประมวลภาพความประทับใจ งานวันเกษตรกร Field Day นำทีมนักวิชาการลงพื้นที่สาธิตแปลงจริง แลกเปลี่ยนเทคนิคการจัดการแปลง และแจกของรางวัลมากมาย...',
      fullContent: `Farmora จัดงานมหกรรม "วันเกษตรกร Field Day 2568" ณ แปลงสาธิตการเกษตร มีพี่น้องเกษตรกรทั้งชาวนา ชาวสวนผัก และผู้ปลูกพืชไร่เข้าร่วมงานอย่างคับคั่งกว่า 1,500 คน

ภายในงานประกอบด้วย 4 ฐานการเรียนรู้เชิงลึก:
1. ฐานตรวจเช็กสุขภาพดินและวิเคราะห์ธาตุอาหารฟรี
2. ฐานสาธิตการใช้โดรนเพื่อการเกษตรพ่นปุ๋ยและยาอย่างแม่นยำ
3. ฐานคำนวณสูตรปุ๋ยตามระยะการเจริญเติบโตเพื่อลดต้นทุน
4. ฐานถาม-ตอบปัญหาศัตรูพืชกับผู้เชี่ยวชาญ

นอกจากความรู้ที่ได้รับกลับไปเต็มกระเป๋าแล้ว ยังมีการจับสลากแจกปุ๋ยฟรี อุปกรณ์พ่นยา และของที่ระลึกกว่า 500 รางวัล สร้างรอยยิ้มและความผูกพันอันอบอุ่นระหว่าง Farmora และชุมชน`
    },
    {
      id: 'n5',
      category: 'activity',
      categoryName: 'กิจกรรมที่ผ่านมา',
      categoryClass: 'cat-activity',
      title: 'อบรมเชิงปฏิบัติการ "เกษตรปลอดภัย ใช้ปุ๋ยยาถูกวิธี เพิ่มผลผลิตคูณสอง"',
      date: '5 สิงหาคม 2568',
      views: '1,410 ครั้ง',
      author: 'ฝ่ายวิชาการ Farmora',
      image: '../images/about-lab.jpg',
      excerpt: 'ทีมนักวิชาการเกษตร Farmora จัดคอร์สอบรมฟรีให้แก่กลุ่มเกษตรกรแปลงใหญ่ มุ่งเน้นการผสมสารเคมีอย่างถูกวิธี และการป้องกันตัวจากละอองสารเคมี...',
      fullContent: `เพื่อสร้างความเข้าใจที่ถูกต้องในการใช้ปัจจัยการผลิต ทีมวิชาการ Farmora ได้จัดโครงการฝึกอบรมเชิงปฏิบัติการ "เกษตรปลอดภัย ใช้ปุ๋ยยาถูกวิธี" ให้แก่ผู้นำกลุ่มเกษตรกรและสมาชิกแปลงใหญ่

การอบรมเน้นการลงมือปฏิบัติจริง (Hands-on Workshop) เช่น การทดสอบความเข้ากันได้ของสารผสม (Compatibility Test), การเลือกขนาดหัวฉีดให้เหมาะกับชนิดของยา, การปรับค่า pH ของน้ำผสมสาร และการสวมใส่อุปกรณ์ป้องกันตนเอง (PPE) ที่ถูกต้อง ซึ่งช่วยลดต้นทุนการใช้สารเคมีลงได้ถึง 20-30% พร้อมสุขภาพที่ปลอดภัยยิ่งขึ้น`
    },
    {
      id: 'n6',
      category: 'activity',
      categoryName: 'กิจกรรมที่ผ่านมา',
      categoryClass: 'cat-activity',
      title: 'โครงการ Farmora CSR ปันน้ำใจ มอบเมล็ดพันธุ์และปุ๋ยฟื้นฟูแปลงหลังน้ำท่วม',
      date: '20 กรกฎาคม 2568',
      views: '1,120 ครั้ง',
      author: 'ฝ่ายกิจกรรมเพื่อสังคม',
      image: '../images/about-history.jpg',
      excerpt: 'ฝ่ายกิจกรรมเพื่อสังคม Farmora ลงพื้นที่ช่วยเหลือเกษตรกรผู้ประสบภัยน้ำท่วม มอบปัจจัยการผลิตและสารปรับปรุงดินเพื่อเร่งฟื้นฟูแปลงเกษตร...',
      fullContent: `จากเหตุการณ์อุทกภัยในพื้นที่เพาะปลูกหลายอำเภอ Farmora ได้จัดตั้งโครงการช่วยเหลือฉุกเฉิน "Farmora ปันน้ำใจ ฟื้นฟูแปลงเกษตร" นำคณะผู้บริหารและพนักงานลงพื้นที่มอบเมล็ดพันธุ์ผักโตไว สารปรับปรุงสภาพดินเพื่อแก้ปัญหารากเน่าโคนเน่า และปุ๋ยฮอร์โมนฟื้นฟูระบบราก ให้แก่ครอบครัวเกษตรกรที่ได้รับผลกระทบ เพื่อให้สามารถกลับมาเพาะปลูกและสร้างรายได้ใหม่อีกครั้งโดยเร็ว`
    },
    {
      id: 'n7',
      category: 'article',
      categoryName: 'บทความ',
      categoryClass: 'cat-article',
      title: '5 เคล็ดลับการเตรียมดินและผสมสูตรปุ๋ย สำหรับนาข้าวให้ได้ผลผลิตตันต่อไร่',
      date: '12 กรกฎาคม 2568',
      views: '4,520 ครั้ง',
      author: 'อาจารย์ผู้เชี่ยวชาญด้านพืชไร่',
      image: '../images/product-fertilizer.jpg',
      isHot: true,
      excerpt: 'เจาะลึกเทคนิคการปรับปรุงโครงสร้างดิน การไถกลบตอซัง และตารางการใส่ปุ๋ย 3 ช่วงสำคัญของข้าว เพื่อสร้างรวงใหญ่ เมล็ดเต็ม น้ำหนักดี...',
      fullContent: `การทำนาข้าวให้ได้ผลผลิตแตะ 1 ตันต่อไร่ ไม่ใช่เรื่องไกลเกินจริง หากเข้าใจหัวใจสำคัญ 5 ประการ:

1. การปรับปรุงสภาพดิน: ไถกลบตอซังและหมักด้วยสารชีวภาพย่อยสลายตอซังอย่างน้อย 15 วัน ช่วยเพิ่มอินทรียวัตถุในดิน ลดการเกิดก๊าซพิษที่ทำให้รากเน่า
2. ตรวจสอบค่าความเป็นกรด-ด่าง (pH): ดินนาที่ดีควรมีค่า pH 5.5-6.5 หากดินเปรี้ยวให้หว่านโดโลไมท์ปรับสภาพก่อนปลูก
3. การใส่ปุ๋ยรองพื้น (ช่วงปักดำ/ข้าวอายุ 15-20 วัน): เน้นสูตรที่มีฟอสฟอรัสสูงเพื่อเร่งรากและกระตุ้นการแตกกอ
4. การใส่ปุ๋ยแต่งหน้า (ช่วงกำเนิดช่อดอก/ข้าวตั้งท้อง): เสริมโพแทสเซียมเพื่อเตรียมสร้างเมล็ด ลดการเกิดเมล็ดลีบ
5. การจัดการน้ำ: ใช้หลักการ "เปียกสลับแห้ง" แกล้งข้าว ช่วยให้รากข้าวหยั่งลึก หาอาหารได้ดี ลำต้นแข็งแกร่งไม่ล้มง่าย`
    },
    {
      id: 'n8',
      category: 'article',
      categoryName: 'บทความ',
      categoryClass: 'cat-article',
      title: 'วิธีสังเกตและรับมือโรคราน้ำค้าง-เพลี้ยไฟระบาดในพืชผักสวนครัวช่วงฤดูฝน',
      date: '28 มิถุนายน 2568',
      views: '3,180 ครั้ง',
      author: 'ทีมวิชาการอารักขาพืช',
      image: '../images/product-soil.jpg',
      excerpt: 'ช่วงหน้าฝนความชื้นสูง เป็นบ่อเกิดของเชื้อราและแมลงศัตรูพืช เรียนรู้วิธีสังเกตอาการแต่เนิ่นๆ และวิธีป้องกันแบบผสมผสาน (IPM)...',
      fullContent: `สภาพอากาศร้อนชื้นสลับฝนตกชุก มักเป็นสภาพแวดล้อมที่เอื้อต่อการแพร่ระบาดของโรคพืชและแมลงศัตรูพืชอย่างรวดเร็ว

อาการสำคัญที่ต้องระวัง:
- โรคราน้ำค้าง: มักพบจุดสีเหลืองบนหลังใบพืช และมีเส้นใยสีขาวอมเทาใต้ใบ ทำให้ใบไหม้แห้งลุกลาม แนะนำให้ตัดแต่งทรงพุ่มให้โปร่ง ฉีดพ่นด้วยสารป้องกันกำจัดเชื้อรากลุ่มคอปเปอร์หรือชีวภัณฑ์บาซิลลัส
- เพลี้ยไฟ: มักดูดกินน้ำเลี้ยงที่ยอดอ่อน ทำให้ยอดหงิกงอ แคระแกร็น ดอกร่วง ควรตรวจดูยอดอ่อนช่วงเช้าตรู่ และใช้กับดักกาวสีเหลืองควบคู่กับการพ่นสารชีวภัณฑ์หรือสารกำจัดแมลงตามคำแนะนำ`
    },
    {
      id: 'n9',
      category: 'article',
      categoryName: 'บทความ',
      categoryClass: 'cat-article',
      title: 'Smart Farming: การนำโดรนการเกษตรมาประยุกต์ใช้เพื่อลดต้นทุนและแม่นยำยิ่งขึ้น',
      date: '15 มิถุนายน 2568',
      views: '2,890 ครั้ง',
      author: 'นวัตกรรมเกษตรยุคใหม่',
      image: '../images/product-hormone.jpg',
      excerpt: 'ทำไมโดรนเพื่อการเกษตรจึงกลายเป็นผู้ช่วยอันดับหนึ่งของเกษตรกรยุค 4.0 เปรียบเทียบความคุ้มค่า ความเร็ว และการประหยัดสารเคมี...',
      fullContent: `ในยุคที่แรงงานภาคเกษตรเริ่มขาดแคลนและค่าแรงสูงขึ้น เทคโนโลยีโดรนการเกษตร (Agricultural Drone) ได้เข้ามาปฏิวัติรูปแบบการทำงานของเกษตรกรไทย:

- ประหยัดเวลา: โดรนสามารถพ่นปุ๋ยหรือฮอร์โมนได้ 20-30 ไร่ ภายในเวลาเพียง 1 ชั่วโมง เร็วกว่าแรงงานคนถึง 10 เท่า
- ละอองฝอยละเอียด ละเอียดสม่ำเสมอ: แรงลมจากใบพัดโดรนช่วยกดละอองสารให้แทรกซึมลงใต้ใบและทั่วทั้งแปลง ลดปริมาณการใช้น้ำลงได้ถึง 80%
- ปลอดภัยต่อสุขภาพ: เกษตรกรไม่ต้องสะพายถังพ่นเดินลุยแปลง ป้องกันการสูดดมและสัมผัสสารโดยตรง
Farmora พร้อมให้คำแนะนำเรื่องสูตรปุ๋ยเกล็ดและฮอร์โมนเข้มข้นที่เหมาะกับการพ่นด้วยโดรนโดยเฉพาะ ไม่ทำให้หัวพ่นอุดตัน`
    },
    {
      id: 'n10',
      category: 'promotion',
      categoryName: 'โปรโมชั่น',
      categoryClass: 'cat-promotion',
      title: 'โปรโมชั่นเปิดฤดูกาลเพาะปลูก! ลดสูงสุด 25% ปุ๋ยและสารบำรุงพืชทุกรายการ',
      date: '1 มิถุนายน 2568',
      views: '5,100 ครั้ง',
      author: 'ฝ่ายส่งเสริมการขาย',
      image: '../images/vg 1.jpg',
      isHot: true,
      excerpt: 'พิเศษเฉพาะเดือนนี้! สั่งซื้อปุ๋ยเคมี ปุ๋ยอินทรีย์ หรือฮอร์โมนพืช รับส่วนลดทันทีสูงสุด 25% พร้อมบริการส่งฟรีทั่วไทยเมื่อสั่งครบเงื่อนไข...',
      fullContent: `Farmora จัดแคมเปญใหญ่ต้อนรับฤดูทำนาและเพาะปลูกพืชไร่ มอบความคุ้มค่าให้พี่น้องเกษตรกรทั่วประเทศ:

- ส่วนลดทันที 15-25% เมื่อสั่งซื้อผลิตภัณฑ์ในหมวดปุ๋ยและฮอร์โมนพืช
- ฟรี! ของแถมพิเศษ หมวกคลุมกันแดดและเสื้อแขนยาว Farmora ทุกออเดอร์
- ซื้อครบ 5,000 บาทขึ้นไป จัดส่งฟรีถึงหน้าบ้านในทุกพื้นที่
ระยะเวลาโปรโมชั่น: ตั้งแต่วันนี้ - 30 มิถุนายน 2568 (หรือจนกว่าสินค้าของแถมจะหมด) สนใจสั่งซื้อติดต่อ Line: @farmora หรือโทร 090-688-6469`
    }
  ];

  // DOM Elements
  const tabButtons      = document.querySelectorAll('.filter-tab-btn');
  const sidebarCatLinks = document.querySelectorAll('.sidebar-cat-link');
  const searchInput     = document.getElementById('news-search-input');
  const clearSearchBtn  = document.getElementById('clear-search-btn');
  const newsGrid        = document.getElementById('news-cards-grid');
  const emptyState      = document.getElementById('news-empty-state');
  const countDisplay    = document.getElementById('news-count-num');
  const activeCatTitle  = document.getElementById('active-cat-title');
  const hamburgerBtn    = document.getElementById('hamburger-btn');
  const mainMenu        = document.getElementById('main-menu');

  // Modal Elements
  const modalBackdrop   = document.getElementById('news-modal-backdrop');
  const modalCloseBtn   = document.getElementById('news-modal-close-btn');
  const btnModalClose   = document.getElementById('btn-modal-close-footer');
  const btnModalShare   = document.getElementById('btn-modal-share');
  const modalImg        = document.getElementById('modal-img');
  const modalCatBadge   = document.getElementById('modal-cat-badge');
  const modalDate       = document.getElementById('modal-date');
  const modalViews      = document.getElementById('modal-views');
  const modalAuthor     = document.getElementById('modal-author');
  const modalTitle      = document.getElementById('modal-title');
  const modalFullText   = document.getElementById('modal-full-text');

  let currentCategory = 'all';
  let currentSearchQuery = '';

  // ── 1. Helper: Render News Cards ───────────────────────────
  function renderNewsCards() {
    if (!newsGrid) return;

    // กรองตาม Category และ Search Query
    const filtered = NEWS_DATA.filter(item => {
      const matchCat = (currentCategory === 'all') || (item.category === currentCategory);
      const q = currentSearchQuery.toLowerCase();
      const matchSearch = !q ||
        item.title.toLowerCase().includes(q) ||
        item.excerpt.toLowerCase().includes(q) ||
        item.categoryName.toLowerCase().includes(q) ||
        item.author.toLowerCase().includes(q);

      return matchCat && matchSearch;
    });

    // อัปเดตตัวนับ
    if (countDisplay) {
      countDisplay.textContent = filtered.length;
    }

    // จัดการ Empty State
    if (filtered.length === 0) {
      newsGrid.style.display = 'none';
      if (emptyState) emptyState.style.display = 'block';
      return;
    } else {
      newsGrid.style.display = 'grid';
      if (emptyState) emptyState.style.display = 'none';
    }

    // สร้าง HTML สำหรับการ์ด
    newsGrid.innerHTML = filtered.map(item => `
      <article class="news-item-card" data-id="${item.id}" data-cat="${item.category}">
        <div class="card-img-wrap" onclick="window.FarmoraNews.openModal('${item.id}')">
          <img src="${item.image}" alt="${item.title}" loading="lazy" onerror="this.src='../images/picture 1.jpg'">
          <span class="card-cat-badge ${item.categoryClass}">${item.categoryName}</span>
          ${item.isHot ? '<span class="badge-tag-hot"><i class="fa-solid fa-fire"></i> แนะนำ</span>' : ''}
        </div>
        
        <div class="card-content">
          <div class="card-meta">
            <span><i class="fa-regular fa-calendar"></i> ${item.date}</span>
            <span><i class="fa-regular fa-eye"></i> ${item.views}</span>
          </div>

          <h3 class="card-title" onclick="window.FarmoraNews.openModal('${item.id}')">
            ${item.title}
          </h3>

          <p class="card-excerpt">
            ${item.excerpt}
          </p>

          <div class="card-footer">
            <span class="card-author"><i class="fa-regular fa-user"></i> ${item.author}</span>
            <button class="btn-card-read" onclick="window.FarmoraNews.openModal('${item.id}')" aria-label="อ่านรายละเอียด">
              อ่านต่อ <i class="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </article>
    `).join('');
  }

  // ── 2. Helper: อัปเดตตัวเลขจำนวนในปุ่มแท็บและ Sidebar ───────
  function updateCategoryCounts() {
    const counts = {
      all: NEWS_DATA.length,
      news: 0,
      activity: 0,
      article: 0,
      promotion: 0
    };

    NEWS_DATA.forEach(item => {
      if (counts[item.category] !== undefined) {
        counts[item.category]++;
      }
    });

    // อัปเดตที่ tab badges
    tabButtons.forEach(btn => {
      const cat = btn.dataset.category;
      const badge = btn.querySelector('.badge-count');
      if (badge && counts[cat] !== undefined) {
        badge.textContent = counts[cat];
      }
    });

    // อัปเดตที่ sidebar count
    sidebarCatLinks.forEach(link => {
      const cat = link.dataset.category;
      const num = link.querySelector('.cat-num');
      if (num && counts[cat] !== undefined) {
        num.textContent = counts[cat];
      }
    });
  }

  // ── 3. เปลี่ยนหมวดหมู่ (Set Category) ───────────────────────
  function setCategory(category, shouldScroll = false) {
    currentCategory = category || 'all';

    // อัปเดต Active State บน Tab Buttons
    tabButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.category === currentCategory);
    });

    // อัปเดต Active State บน Sidebar Links
    sidebarCatLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.category === currentCategory);
    });

    // อัปเดตหัวข้อหมวดหมู่
    if (activeCatTitle) {
      const mapNames = {
        all: 'ข่าวสารและกิจกรรมทั้งหมด',
        news: 'ข่าวสารล่าสุด',
        activity: 'กิจกรรมที่ผ่านมา',
        article: 'บทความสาระเกษตร',
        promotion: 'โปรโมชั่นพิเศษ'
      };
      activeCatTitle.textContent = mapNames[currentCategory] || 'ข่าวสารและกิจกรรม';
    }

    // อัปเดต URL parameter แบบปลอดภัย (ไม่หยุดทำงานบน file:// protocol)
    try {
      if (window.location.protocol.startsWith('http')) {
        const newUrl = new URL(window.location.href);
        if (currentCategory === 'all') {
          newUrl.searchParams.delete('cat');
        } else {
          newUrl.searchParams.set('cat', currentCategory);
        }
        window.history.replaceState({}, '', newUrl);
      }
    } catch (err) {
      // Ignored in local file:// mode
    }

    // Render ข่าวใหม่
    renderNewsCards();

    // Scroll ไปที่ส่วนหัวข้อข่าวถ้าได้รับคำสั่ง
    if (shouldScroll) {
      const targetSec = document.getElementById('news-content-section');
      if (targetSec) {
        const navOffset = 90;
        const targetPos = targetSec.getBoundingClientRect().top + window.pageYOffset - navOffset;
        window.scrollTo({ top: targetPos, behavior: 'smooth' });
      }
    }
  }

  // ── 4. ระบบค้นหา Real-Time Search ─────────────────────────
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value.trim();
      if (clearSearchBtn) {
        clearSearchBtn.style.display = currentSearchQuery.length > 0 ? 'block' : 'none';
      }
      renderNewsCards();
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      currentSearchQuery = '';
      clearSearchBtn.style.display = 'none';
      renderNewsCards();
      if (searchInput) searchInput.focus();
    });
  }

  // รีเซ็ตการค้นหาจาก Empty State
  window.resetNewsFilter = function () {
    if (searchInput) searchInput.value = '';
    currentSearchQuery = '';
    if (clearSearchBtn) clearSearchBtn.style.display = 'none';
    setCategory('all', true);
  };

  // ── 5. ฟังก์ชันเปิด/ปิด Interactive Modal ───────────────────
  function openModal(id) {
    const item = NEWS_DATA.find(n => n.id === id);
    if (!item || !modalBackdrop) return;

    if (modalImg) modalImg.src = item.image;
    if (modalCatBadge) {
      modalCatBadge.textContent = item.categoryName;
      modalCatBadge.className = `modal-cat-tag ${item.categoryClass}`;
    }
    if (modalDate) modalDate.innerHTML = `<i class="fa-regular fa-calendar"></i> ${item.date}`;
    if (modalViews) modalViews.innerHTML = `<i class="fa-regular fa-eye"></i> ${item.views}`;
    if (modalAuthor) modalAuthor.innerHTML = `<i class="fa-regular fa-user"></i> ${item.author}`;
    if (modalTitle) modalTitle.textContent = item.title;
    if (modalFullText) modalFullText.textContent = item.fullContent;

    modalBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden'; // ป้องกันการเลื่อนพื้นหลัง
  }

  function closeModal() {
    if (!modalBackdrop) return;
    modalBackdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (btnModalClose) btnModalClose.addEventListener('click', closeModal);

  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) closeModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalBackdrop && modalBackdrop.classList.contains('open')) {
      closeModal();
    }
  });

  if (btnModalShare) {
    btnModalShare.addEventListener('click', () => {
      if (navigator.share) {
        navigator.share({
          title: modalTitle ? modalTitle.textContent : 'Farmora News',
          url: window.location.href
        }).catch(() => {});
      } else {
        // คัดลอกลิงก์
        navigator.clipboard.writeText(window.location.href).then(() => {
          alert('คัดลอกลิงก์ข่าวเรียบร้อยแล้ว!');
        });
      }
    });
  }

  // ── 6. ผูก Event Listeners สำหรับแท็บและ Sidebar ──────────
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      setCategory(btn.dataset.category, true);
    });
  });

  sidebarCatLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      setCategory(link.dataset.category, true);
    });
  });

  // Tag badges in sidebar
  document.querySelectorAll('.tag-badge').forEach(tag => {
    tag.addEventListener('click', (e) => {
      e.preventDefault();
      const tagName = tag.textContent.replace('#', '').trim();
      if (searchInput) {
        searchInput.value = tagName;
        currentSearchQuery = tagName;
        if (clearSearchBtn) clearSearchBtn.style.display = 'block';
        renderNewsCards();
        const targetSec = document.getElementById('news-content-section');
        if (targetSec) {
          window.scrollTo({ top: targetSec.offsetTop - 80, behavior: 'smooth' });
        }
      }
    });
  });

  // ── 7. Hamburger Menu Toggle สำหรับมือถือ ─────────────────
  if (hamburgerBtn && mainMenu) {
    hamburgerBtn.addEventListener('click', () => {
      mainMenu.classList.toggle('open');
      const icon = hamburgerBtn.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-xmark');
      }
    });
  }

  // ── 8. เริ่มต้นทำงานเมื่อโหลดหน้า (Initialize) ────────────
  updateCategoryCounts();

  // ตรวจสอบ Parameter จาก URL (เช่น ?cat=news, ?cat=activity, ?cat=article)
  const urlParams = new URLSearchParams(window.location.search);
  const initialCategory = urlParams.get('cat');

  if (initialCategory && ['news', 'activity', 'article', 'promotion'].includes(initialCategory)) {
    // ลิงก์ตรงมาจากเมนู Navbar
    setCategory(initialCategory, false);
    
    // Smooth scroll ไปที่ส่วนข่าวหลังจากเรนเดอร์เล็กน้อย
    setTimeout(() => {
      const targetSec = document.getElementById('news-content-section');
      if (targetSec) {
        const navOffset = 90;
        const targetPos = targetSec.getBoundingClientRect().top + window.pageYOffset - navOffset;
        window.scrollTo({ top: targetPos, behavior: 'smooth' });
      }
    }, 150);
  } else {
    setCategory('all', false);
  }

  // ดักจับคลิกเมนู Navbar บนหน้า news.html เพื่อสลับแท็บแบบลื่นไหล
  document.querySelectorAll('a[href*="cat="], .dropdown-menu a[href*="news.html"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href') || '';
      const match = href.match(/cat=([a-zA-Z0-9_-]+)/);
      const targetCat = match ? match[1] : (href.includes('news.html') ? 'all' : null);

      if (targetCat) {
        e.preventDefault();
        setCategory(targetCat, true);

        // ปิดเมนู dropdown และ hamburger บนมือถือ
        document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('open'));
        if (mainMenu && mainMenu.classList.contains('open')) {
          mainMenu.classList.remove('open');
          const icon = hamburgerBtn ? hamburgerBtn.querySelector('i') : null;
          if (icon) {
            icon.classList.add('fa-bars');
            icon.classList.remove('fa-xmark');
          }
        }
      }
    });
  });

  // ส่งออก API ให้เรียกใช้ได้จาก HTML onclick
  window.FarmoraNews = {
    openModal: openModal,
    closeModal: closeModal,
    setCategory: setCategory
  };

})();
