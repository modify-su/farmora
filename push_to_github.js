// push_to_github.js - Automates git commit and git push for Farmora Official
const { execFileSync } = require('child_process');
const path = require('path');

console.log('===================================================');
console.log('  FARMORA OFFICIAL - ระบบอัปโหลดขึ้น GITHUB & VERCEL');
console.log('  Repository: https://github.com/modify-su/farmora.git');
console.log('===================================================\n');

function runGit(args) {
  try {
    const out = execFileSync('git', args, { cwd: __dirname, encoding: 'utf8', stdio: 'pipe' });
    return { success: true, output: (out || '').trim() };
  } catch (err) {
    return {
      success: false,
      output: ((err.stdout || '') + (err.stderr || '') + (err.message || '')).trim()
    };
  }
}

// 1. ตรวจสอบสถานะ Git และ Commit
console.log('[1/2] กำลังเตรียมและบันทึกไฟล์ (git add .)...');
runGit(['add', '.']);
const statusRes = runGit(['status', '--porcelain']);

if (statusRes.output && statusRes.output.length > 0) {
  console.log('  พบไฟล์ที่มีการเปลี่ยนแปลง กำลังบันทึก Commit...');
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const commitMsg = 'update Farmora Official: ' + now;
  const commitRes = runGit(['commit', '-m', commitMsg]);
  if (commitRes.success) {
    console.log('  ✓ บันทึก Commit สำเร็จ:', commitMsg);
  } else {
    console.log('  ผลลัพธ์ Commit:', commitRes.output);
  }
} else {
  console.log('  ✓ ไฟล์ทั้งหมดในโปรเจกต์ได้รับการบันทึกล่าสุดแล้ว');
}

// 2. Push ขึ้น GitHub
console.log('\n[2/2] กำลังส่งข้อมูลขึ้น GitHub (git push origin main)...');
let pushRes = runGit(['push', '-u', 'origin', 'main']);

if (!pushRes.success && (pushRes.output.includes('rejected') || pushRes.output.includes('fetch first') || pushRes.output.includes('non-fast-forward'))) {
  console.log('  กำลังอัปเดตข้อมูลขึ้น GitHub ให้สอดคล้องกัน (--force)...');
  pushRes = runGit(['push', '-u', 'origin', 'main', '--force']);
}

console.log('\n===================================================');
if (pushRes.success) {
  console.log('  🎉 [สำเร็จ 100%] โค้ดทั้งหมดอัปเดตขึ้น GitHub เรียบร้อยแล้ว!');
  console.log('  Repository: https://github.com/modify-su/farmora.git');
  console.log('  ระบบ Vercel จะดึงไปอัปเดตหน้าเว็บจริงให้อัตโนมัติทันที');
} else {
  if (pushRes.output.includes('Everything up-to-date') || pushRes.output.includes('up to date')) {
    console.log('  ✓ ข้อมูลบน GitHub เป็นเวอร์ชันล่าสุดอยู่แล้ว (Everything up-to-date)');
    console.log('  Repository: https://github.com/modify-su/farmora.git');
  } else {
    console.log('  ❌ [เกิดข้อผิดพลาดในการส่งขึ้น GitHub]:');
    console.log(pushRes.output);
    console.log('  คำแนะนำ: ตรวจสอบการเชื่อมต่ออินเทอร์เน็ตหรือการล็อกอินสิทธิ์ GitHub');
  }
}
console.log('===================================================\n');
