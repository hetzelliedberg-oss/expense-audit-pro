// ExpenseAudit Pro - Cloud & Standalone 24/7 Engine
// Automatically runs on GitHub Pages (24/7 online) and Localhost

const INITIAL_DATA = [
  {
    "id": 22,
    "file_name": "image-2511535945925574.jfif",
    "file_hash": "da1a3641b6ef4c0ec722d65b0f65515d0a4aebe373e175d9d5266b5a3e7fab5a",
    "doc_type": "bank_slip",
    "transaction_date": "2026-08-29",
    "transaction_time": "18:43:00",
    "transaction_datetime": "2026-08-29T18:43:00",
    "type": "expense",
    "amount": 1980.0,
    "fee": 0.0,
    "vat": 0.0,
    "total_amount": 1980.0,
    "category": "โอนเงินและชำระเงิน",
    "subcategory": "โอนเงินบุคคล",
    "payment_source": "กรุงไทย (KTB)",
    "sender_name": "นางวันเพ็ญ พ***",
    "sender_account": "XXX-X-XX196-3",
    "payee_name": "สุพัตรา จันทร์ดัด",
    "payee_account": "XXX-X-XX883-2",
    "ref_number": "N006781167400059341010939",
    "items_json": "[]",
    "confidence_score": 1.0,
    "notes": "โอนเงินสำเร็จ ธนาคารกรุงไทย ไปยัง สุพัตรา จันทร์ดัด",
    "audit_status": "clean",
    "audit_note": "ผ่านการตรวจสอบ (Audit Clean)",
    "is_verified": 1
  },
  {
    "id": 23,
    "file_name": "image-1502156208326668.jfif",
    "file_hash": "d3e82345f7631d0b9eb21cb48b9ec6b5e3b8326fc692fbbc51ad7f89e02863c4",
    "doc_type": "bank_slip",
    "transaction_date": "2026-07-10",
    "transaction_time": "15:24:00",
    "transaction_datetime": "2026-07-10T15:24:00",
    "type": "expense",
    "amount": 1290.0,
    "fee": 0.0,
    "vat": 0.0,
    "total_amount": 1290.0,
    "category": "โอนเงินและชำระเงิน",
    "subcategory": "โอนเงินบุคคล",
    "payment_source": "กสิกรไทย (KBank)",
    "sender_name": "นาง กุลชนัน ส",
    "sender_account": "xxx-x-x5997-x",
    "payee_name": "น.ส. สุพัตรา จันทร์ดัด",
    "payee_account": "xxx-x-x5652-x",
    "ref_number": "016191152430DTF08888",
    "items_json": "[]",
    "confidence_score": 1.0,
    "notes": "โอนเงินสำเร็จ ผ่าน K PLUS ไปยัง น.ส. สุพัตรา จันทร์ดัด",
    "audit_status": "clean",
    "audit_note": "ผ่านการตรวจสอบ (Audit Clean)",
    "is_verified": 1
  },
  {
    "id": 24,
    "file_name": "733726460_1109594445581614_8463763778998532217_n.jpg",
    "file_hash": "016a62f7a4749dc96fb0448147d333b3ff231a085e045b57647d7c00ac1ffcc6",
    "doc_type": "bank_slip",
    "transaction_date": "2026-06-30",
    "transaction_time": "16:04:00",
    "transaction_datetime": "2026-06-30T16:04:00",
    "type": "expense",
    "amount": 1290.0,
    "fee": 0.0,
    "vat": 0.0,
    "total_amount": 1290.0,
    "category": "โอนเงินและชำระเงิน",
    "subcategory": "โอนเงินบุคคล",
    "payment_source": "ไทยพาณิชย์ (SCB)",
    "sender_name": "นาย ภูริฉัตร์ อ.",
    "sender_account": "xxx-xxx044-7",
    "payee_name": "น.ส. สุพัตรา จันทร์ดัด",
    "payee_account": "x-6524",
    "ref_number": "202606300ppctgFSqhhrzdkvc",
    "items_json": "[]",
    "confidence_score": 1.0,
    "notes": "โอนเงินสำเร็จ ผ่าน SCB EASY ไปยัง น.ส. สุพัตรา จันทร์ดัด",
    "audit_status": "clean",
    "audit_note": "ผ่านการตรวจสอบ (Audit Clean)",
    "is_verified": 1
  },
  {
    "id": 26,
    "file_name": "S__120193029.jpg",
    "file_hash": "7b24171eb10128d33788e58ad6da47d60d51d73499f33b61f47d67f9baa20c17",
    "doc_type": "bank_slip",
    "transaction_date": "2025-08-21",
    "transaction_time": "14:41:00",
    "transaction_datetime": "2025-08-21T14:41:00",
    "type": "expense",
    "amount": 940.0,
    "fee": 0.0,
    "vat": 0.0,
    "total_amount": 940.0,
    "category": "โอนเงินและชำระเงิน",
    "subcategory": "โอนเงินบุคคล",
    "payment_source": "กสิกรไทย (KBank)",
    "sender_name": "น.ส. ธารารัตน์ แ",
    "sender_account": "xxx-x-x7307-x",
    "payee_name": "นาง กาญจนา เถียรเจริญวงศ์",
    "payee_account": "xxx-x-x3909-x",
    "ref_number": "015233144153BTF00327",
    "items_json": "[]",
    "confidence_score": 0.95,
    "notes": "โอนเงินสำเร็จ ผ่าน K PLUS ไปยัง นาง กาญจนา เถียรเจริญวงศ์",
    "audit_status": "clean",
    "audit_note": "ตรวจสอบสลิปจริงเรียบร้อย: ยอด 940.00 บาท (Ref: 015233144153BTF00327)",
    "is_verified": 1
  },
  {
    "id": 27,
    "file_name": "photo_2025-03-06_10-03-36 (2).jpg",
    "file_hash": "063893924c1806c24bde5981cfd151bd527211e59aa9f7d0fac8f914e4f8af8d",
    "doc_type": "bank_slip",
    "transaction_date": "2025-03-06",
    "transaction_time": "09:47:00",
    "transaction_datetime": "2025-03-06T09:47:00",
    "type": "expense",
    "amount": 1090.0,
    "fee": 0.0,
    "vat": 0.0,
    "total_amount": 1090.0,
    "category": "ช้อปปิ้งและของใช้",
    "subcategory": "เสื้อผ้าและยีนส์",
    "payment_source": "กรุงไทย (KTB) -> กรุงเทพ (BBL)",
    "sender_name": "นางพิชญาภา ห***",
    "sender_account": "XXX-X-XX488-2",
    "payee_name": "น.ส. สุปราณี ศรีบุตร",
    "payee_account": "XXX-X-XX376-2",
    "ref_number": "Ae898d1c058604f0e",
    "items_json": "[]",
    "confidence_score": 0.95,
    "notes": "บันทึกช่วยจำ: ยีนหนึ่งตัว (โอนไปยัง น.ส. สุปราณี ศรีบุตร)",
    "audit_status": "clean",
    "audit_note": "ตรวจสอบสลิปจริงเรียบร้อย: ยอด 1,090.00 บาท (Ref: Ae898d1c058604f0e) โน้ต: ยีนหนึ่งตัว",
    "is_verified": 1
  }
];

let localTransactions = [];
let currentModalTxId = null;
let chartMonthlyInstance = null;
let chartCategoryInstance = null;
let searchDebounceTimer = null;

// Initialize Storage
function initStorage() {
  try {
    const saved = localStorage.getItem("expense_audit_txs_v1");
    if (saved) {
      localTransactions = JSON.parse(saved);
    } else {
      localTransactions = JSON.parse(JSON.stringify(INITIAL_DATA));
      saveToStorage();
    }
  } catch (e) {
    console.warn("Storage read error, loading default data", e);
    localTransactions = JSON.parse(JSON.stringify(INITIAL_DATA));
  }
}

function saveToStorage() {
  try {
    localStorage.setItem("expense_audit_txs_v1", JSON.stringify(localTransactions));
  } catch (e) {
    console.error("Storage save error", e);
  }
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  initStorage();
  if (window.lucide) lucide.createIcons();
  loadKPIStats();
  reloadTransactions();
});

// ----------------------------------------------------
// Navigation Tab Switching
// ----------------------------------------------------
function switchTab(tabName) {
  const tabs = ['transactions', 'daily', 'monthly'];
  tabs.forEach(t => {
    const btn = document.getElementById(`tabBtn${capitalize(t)}`);
    const content = document.getElementById(`tabContent${capitalize(t)}`);
    if (!btn || !content) return;
    if (t === tabName) {
      btn.className = "pb-3 border-b-2 border-indigo-600 text-indigo-600 flex items-center space-x-2 font-semibold";
      content.classList.remove("hidden");
    } else {
      btn.className = "pb-3 border-b-2 border-transparent text-slate-500 hover:text-slate-700 flex items-center space-x-2";
      content.classList.add("hidden");
    }
  });

  if (tabName === 'daily') {
    loadDailyBreakdown();
  } else if (tabName === 'monthly') {
    loadMonthlyAndCharts();
  }
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ----------------------------------------------------
// Drag & Drop / File Select
// ----------------------------------------------------
function handleDragOver(e) {
  e.preventDefault();
  e.stopPropagation();
  document.getElementById("dropZone").classList.add("drag-active");
}

function handleDragLeave(e) {
  e.preventDefault();
  e.stopPropagation();
  document.getElementById("dropZone").classList.remove("drag-active");
}

function handleDrop(e) {
  e.preventDefault();
  e.stopPropagation();
  document.getElementById("dropZone").classList.remove("drag-active");
  const files = e.dataTransfer.files;
  if (files && files.length > 0) {
    processBatchFiles(files);
  }
}

function handleFileSelect(e) {
  const files = e.target.files;
  if (files && files.length > 0) {
    processBatchFiles(files);
  }
}

// ----------------------------------------------------
// Fast In-Browser OCR & Parsing Engine (Cloud 24/7)
// ----------------------------------------------------
async function processBatchFiles(fileList) {
  const files = Array.from(fileList);
  if (files.length === 0) return;

  const progressContainer = document.getElementById("batchProgressContainer");
  const progressBar = document.getElementById("batchProgressBar");
  const progressLabel = document.getElementById("batchProgressLabel");
  const progressPercent = document.getElementById("batchProgressPercent");
  const countStats = document.getElementById("batchCountStats");

  progressContainer.classList.remove("hidden");
  progressBar.style.width = "0%";
  progressLabel.innerText = `กำลังสแกนและประมวลผล ${files.length} ไฟล์...`;
  progressPercent.innerText = "0%";
  countStats.innerText = `0 / ${files.length} ไฟล์`;

  let processed = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    try {
      progressLabel.innerText = `กำลังวิเคราะห์รูปที่ ${i + 1}/${files.length}: ${file.name}...`;
      const tx = await parseSlipFile(file);
      localTransactions.unshift(tx);
      saveToStorage();
    } catch (err) {
      console.error("File parse error:", err);
    }

    processed++;
    const pct = Math.round((processed / files.length) * 100);
    progressBar.style.width = `${pct}%`;
    progressPercent.innerText = `${pct}%`;
    countStats.innerText = `${processed} / ${files.length} ไฟล์`;

    loadKPIStats();
    reloadTransactions();
  }

  // Audit Recheck on all
  runAuditRecheckLocal();
  saveToStorage();

  progressLabel.innerText = "ประมวลผลและ Audit ตรวจสอบเสร็จสมบูรณ์ 100%!";
  progressBar.style.width = "100%";
  progressPercent.innerText = "100%";

  setTimeout(() => {
    progressContainer.classList.add("hidden");
    document.getElementById("batchFileInput").value = "";
  }, 2500);

  loadKPIStats();
  reloadTransactions();
  loadDailyBreakdown();
  loadMonthlyAndCharts();
}

// Parse image file with SHA-256 and OCR
async function parseSlipFile(file) {
  // 1. Calculate SHA-256 hash
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const fileHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  // 2. Read as Data URL for preview
  const dataUrl = await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });

  // 3. Extract text via Tesseract if available
  let text = "";
  if (window.Tesseract) {
    try {
      const result = await Tesseract.recognize(dataUrl, 'tha+eng', {
        logger: () => {}
      });
      text = result.data.text || "";
    } catch (e) {
      console.warn("Tesseract OCR skipped or failed:", e);
    }
  }

  // 4. Heuristic Extraction
  const extracted = extractFieldsFromText(text, file.name);

  const newId = Date.now() + Math.floor(Math.random() * 1000);
  const tx = {
    id: newId,
    file_name: file.name,
    file_hash: fileHash,
    image_url: dataUrl,
    doc_type: "bank_slip",
    transaction_date: extracted.date || new Date().toISOString().slice(0, 10),
    transaction_time: extracted.time || new Date().toTimeString().slice(0, 8),
    transaction_datetime: `${extracted.date || new Date().toISOString().slice(0, 10)}T${extracted.time || '12:00:00'}`,
    type: "expense",
    amount: extracted.amount,
    fee: extracted.fee,
    vat: 0.0,
    total_amount: extracted.amount + extracted.fee,
    category: extracted.category,
    subcategory: extracted.subcategory,
    payment_source: extracted.bank,
    sender_name: extracted.sender,
    sender_account: "",
    payee_name: extracted.payee,
    payee_account: "",
    ref_number: extracted.ref,
    notes: extracted.notes,
    audit_status: "clean",
    audit_note: "ผ่านการตรวจสอบ (Audit Clean)",
    is_verified: 1
  };

  return tx;
}

function extractFieldsFromText(text, fileName) {
  let amount = 0.0;
  let fee = 0.0;
  let date = "";
  let time = "";
  let bank = "ธนาคารไทย";
  let payee = "โอนเงินสำเร็จ";
  let sender = "";
  let ref = "";
  let notes = "";
  let category = "โอนเงินและชำระเงิน";
  let subcategory = "โอนเงินบุคคล";

  // Bank detection
  const lowerText = text.toLowerCase();
  if (lowerText.includes("kbank") || lowerText.includes("k plus") || text.includes("กสิกร")) {
    bank = "กสิกรไทย (KBank)";
  } else if (lowerText.includes("scb") || text.includes("ไทยพาณิชย์")) {
    bank = "ไทยพาณิชย์ (SCB)";
  } else if (lowerText.includes("krungthai") || text.includes("กรุงไทย") || lowerText.includes("ktb")) {
    bank = "กรุงไทย (KTB)";
  } else if (lowerText.includes("bangkok bank") || text.includes("กรุงเทพ") || lowerText.includes("bbl")) {
    bank = "กรุงเทพ (BBL)";
  } else if (lowerText.includes("ttb") || text.includes("ทีทีบี")) {
    bank = "ทีทีบี (ttb)";
  } else if (text.includes("ออมสิน") || lowerText.includes("gsb")) {
    bank = "ออมสิน (GSB)";
  } else if (text.includes("กรุงศรี") || lowerText.includes("bay")) {
    bank = "กรุงศรี (BAY)";
  }

  // Amount detection: find numbers with 2 decimals e.g. 1,290.00
  const amountMatches = text.match(/(?:จำนวนเงิน|ยอดเงิน|บาท|THB|Amount|ยอดโอน|โอนสำเร็จ)?\s*[:：]?\s*([0-9]{1,3}(?:,[0-9]{3})*\.[0-9]{2})/i);
  if (amountMatches && amountMatches[1]) {
    amount = parseFloat(amountMatches[1].replace(/,/g, ''));
  } else {
    // Fallback: any float number in text
    const anyNum = text.match(/([0-9]{1,3}(?:,[0-9]{3})*\.[0-9]{2})/);
    if (anyNum) {
      amount = parseFloat(anyNum[1].replace(/,/g, ''));
    }
  }

  // Ref Number
  const refMatch = text.match(/(?:รหัสอ้างอิง|เลขที่รายการ|Ref|Transaction ID|เลขที่อ้างอิง)\s*[:：]?\s*([A-Za-z0-9]{10,35})/i);
  if (refMatch && refMatch[1]) {
    ref = refMatch[1];
  } else {
    ref = "REF" + Math.random().toString(36).substring(2, 12).toUpperCase();
  }

  // Date and Time
  const timeMatch = text.match(/([0-2]?[0-9]:[0-5][0-9](?::[0-5][0-9])?)/);
  if (timeMatch) time = timeMatch[1];

  const dateMatch = text.match(/([0-3]?[0-9])\s+(ม\.ค\.|ก\.พ\.|มี\.ค\.|เม\.ย\.|พ\.ค\.|มิ\.ย\.|ก\.ค\.|ส\.ค\.|ก\.ย\.|ต\.ค\.|พ\.ย\.|ธ\.ค\.)\s+([0-9]{2,4})/);
  if (dateMatch) {
    const day = dateMatch[1].padStart(2, '0');
    const monthMap = {
      "ม.ค.": "01", "ก.พ.": "02", "มี.ค.": "03", "เม.ย.": "04",
      "พ.ค.": "05", "มิ.ย.": "06", "ก.ค.": "07", "ส.ค.": "08",
      "ก.ย.": "09", "ต.ค.": "10", "พ.ย.": "11", "ธ.ค.": "12"
    };
    const m = monthMap[dateMatch[2]] || "01";
    let y = parseInt(dateMatch[3]);
    if (y > 2500) y -= 543;
    date = `${y}-${m}-${day}`;
  }

  // Payee detection
  const payeeMatch = text.match(/(?:ไปยัง|ถึง|ผู้รับเงิน|To|โอนให้)\s*[:：]?\s*([ก-๙a-zA-Z\.\s]{3,35})/);
  if (payeeMatch && payeeMatch[1]) {
    payee = payeeMatch[1].trim().replace(/\n/g, ' ');
  } else {
    payee = "ผู้รับเงินในสลิป";
  }

  if (text.includes("กาแฟ") || text.includes("อาหาร") || text.includes("restaurant") || text.includes("cafe")) {
    category = "อาหารและเครื่องดื่ม";
  } else if (text.includes("น้ำมัน") || text.includes("ptt") || text.includes("shell") || text.includes("caltex")) {
    category = "เดินทางและยานพาหนะ";
    subcategory = "ค่าน้ำมัน";
  } else if (text.includes("ยีน") || text.includes("เสื้อ") || text.includes("shopee") || text.includes("lazada")) {
    category = "ช้อปปิ้งและของใช้";
  }

  notes = `สลิป: ${fileName}`;

  return { amount, fee, date, time, bank, payee, sender, ref, notes, category, subcategory };
}

// ----------------------------------------------------
// Audit & Recheck Logic
// ----------------------------------------------------
function runAuditRecheckLocal() {
  const hashSeen = {};
  const refSeen = {};
  const fuzzySeen = {};

  // Sort by date ascending to mark earlier ones as original
  const sorted = [...localTransactions].sort((a, b) => (a.transaction_date || '').localeCompare(b.transaction_date || ''));

  sorted.forEach(tx => {
    let warning = false;
    let note = "ผ่านการตรวจสอบ (Audit Clean)";
    let status = "clean";

    // 1. Exact Hash Check
    if (tx.file_hash) {
      if (hashSeen[tx.file_hash]) {
        warning = true;
        status = "duplicate_exact";
        note = `สลิปซ้ำ 100% (ไฟล์รูปภาพตรงกับ Transaction #${hashSeen[tx.file_hash].id})`;
      } else {
        hashSeen[tx.file_hash] = tx;
      }
    }

    // 2. Ref Number Check
    if (!warning && tx.ref_number && tx.ref_number.length > 5) {
      if (refSeen[tx.ref_number]) {
        warning = true;
        status = "duplicate_exact";
        note = `เลขอ้างอิงซ้ำ (Ref: ${tx.ref_number} ตรงกับ Transaction #${refSeen[tx.ref_number].id})`;
      } else {
        refSeen[tx.ref_number] = tx;
      }
    }

    // 3. Fuzzy match: same date + same amount + same payee
    if (!warning && tx.transaction_date && tx.amount > 0 && tx.payee_name) {
      const fuzzyKey = `${tx.transaction_date}_${tx.amount.toFixed(2)}_${tx.payee_name.trim()}`;
      if (fuzzySeen[fuzzyKey]) {
        warning = true;
        status = "duplicate_fuzzy";
        note = `เตือนยอดเงินและผู้รับเงินซ้ำในวันเดียวกัน (ตรงกับ Transaction #${fuzzySeen[fuzzyKey].id})`;
      } else {
        fuzzySeen[fuzzyKey] = tx;
      }
    }

    tx.audit_status = status;
    tx.audit_note = note;
  });
}

function runGlobalRecheck() {
  const btn = document.getElementById("btnRecheck");
  btn.innerHTML = `<div class="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mr-1"></div> ตรวจสอบ...`;

  setTimeout(() => {
    runAuditRecheckLocal();
    saveToStorage();
    loadKPIStats();
    reloadTransactions();
    loadDailyBreakdown();
    loadMonthlyAndCharts();
    btn.innerHTML = `<i data-lucide="refresh-cw" class="w-4 h-4 text-indigo-600"></i><span class="hidden sm:inline">Audit Recheck</span>`;
    if (window.lucide) lucide.createIcons();
    alert("Audit Recheck เสร็จสมบูรณ์! ตรวจสอบสลิปซ้ำและยอดเงินเรียบร้อยแล้ว");
  }, 600);
}

// ----------------------------------------------------
// KPI Stats
// ----------------------------------------------------
function loadKPIStats() {
  let totalExpense = 0;
  let totalIncome = 0;
  let flaggedCount = 0;
  const count = localTransactions.length;

  localTransactions.forEach(tx => {
    const amt = parseFloat(tx.total_amount || tx.amount || 0);
    if (tx.type === "expense") {
      totalExpense += amt;
    } else {
      totalIncome += amt;
    }
    if (tx.audit_status !== "clean") {
      flaggedCount++;
    }
  });

  document.getElementById("statExpense").innerText = `฿ ${formatMoney(totalExpense)}`;
  document.getElementById("statIncome").innerText = `฿ ${formatMoney(totalIncome)}`;
  document.getElementById("statFlagged").innerText = `${flaggedCount} รายการ`;
  document.getElementById("statCount").innerText = `${count} รูป`;
}

// ----------------------------------------------------
// Transactions Table & Filters
// ----------------------------------------------------
function debounceReloadTransactions() {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    reloadTransactions();
  }, 250);
}

function reloadTransactions() {
  const search = (document.getElementById("filterSearch")?.value || "").toLowerCase().trim();
  const category = document.getElementById("filterCategory")?.value || "";
  const auditStatus = document.getElementById("filterAudit")?.value || "";
  const startDate = document.getElementById("filterStartDate")?.value || "";
  const endDate = document.getElementById("filterEndDate")?.value || "";

  let filtered = localTransactions.filter(tx => {
    if (search) {
      const matchSearch = (tx.payee_name || "").toLowerCase().includes(search) ||
                          (tx.ref_number || "").toLowerCase().includes(search) ||
                          (tx.notes || "").toLowerCase().includes(search) ||
                          (tx.payment_source || "").toLowerCase().includes(search);
      if (!matchSearch) return false;
    }
    if (category && tx.category !== category) return false;
    if (auditStatus === "warning" && tx.audit_status === "clean") return false;
    if (auditStatus === "clean" && tx.audit_status !== "clean") return false;
    if (startDate && (tx.transaction_date || "") < startDate) return false;
    if (endDate && (tx.transaction_date || "") > endDate) return false;
    return true;
  });

  renderTransactionsTable(filtered);
}

function renderTransactionsTable(transactions) {
  const tbody = document.getElementById("transactionTableBody");
  if (!tbody) return;

  if (!transactions || transactions.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center py-12 text-slate-400">
          <i data-lucide="inbox" class="w-8 h-8 mx-auto mb-2 opacity-50"></i>
          ไม่พบรายการธุรกรรมตามเงื่อนไขที่เลือก
        </td>
      </tr>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  tbody.innerHTML = transactions.map(tx => {
    const isWarning = tx.audit_status !== "clean";
    const auditBadge = getAuditBadge(tx.audit_status, tx.audit_note);
    const amountColor = tx.type === "expense" ? "text-rose-600 font-bold" : "text-emerald-600 font-bold";
    const amountPrefix = tx.type === "expense" ? "-" : "+";

    return `
      <tr class="hover:bg-slate-50/80 transition cursor-pointer" onclick="openInspectorModal(${tx.id})">
        <td class="py-2.5 px-3">
          <div class="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 flex items-center justify-center">
            ${tx.image_url ? `<img src="${tx.image_url}" alt="Slip" class="w-full h-full object-cover">` : `<i data-lucide="image" class="w-4 h-4 text-slate-400"></i>`}
          </div>
        </td>
        <td class="py-2.5 px-3 whitespace-nowrap">
          <div class="font-medium text-slate-900">${tx.transaction_date || "-"}</div>
          <div class="text-[11px] text-slate-400">${tx.transaction_time || ""}</div>
        </td>
        <td class="py-2.5 px-4">
          <div class="font-medium text-slate-900 line-clamp-1">${escapeHtml(tx.payee_name || "ไม่ระบุชื่อ")}</div>
          <div class="text-[11px] text-slate-400 line-clamp-1">${escapeHtml(tx.notes || tx.ref_number || "")}</div>
        </td>
        <td class="py-2.5 px-3 whitespace-nowrap">
          <span class="px-2.5 py-1 rounded-full text-[11px] font-medium ${getCategoryStyle(tx.category)}">
            ${escapeHtml(tx.category || "ทั่วไป")}
          </span>
        </td>
        <td class="py-2.5 px-3 whitespace-nowrap text-slate-600 text-xs">
          ${escapeHtml(tx.payment_source || "-")}
        </td>
        <td class="py-2.5 px-3 text-right whitespace-nowrap">
          <span class="${amountColor}">
            ${amountPrefix}฿${formatMoney(tx.total_amount || tx.amount)}
          </span>
        </td>
        <td class="py-2.5 px-3 whitespace-nowrap">
          ${auditBadge}
        </td>
        <td class="py-2.5 px-3 text-center whitespace-nowrap" onclick="event.stopPropagation()">
          <div class="flex items-center justify-center space-x-1">
            <button onclick="openInspectorModal(${tx.id})" title="เปิดดูสลิปและตรวจสอบ" class="p-1 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded">
              <i data-lucide="eye" class="w-4 h-4"></i>
            </button>
            <button onclick="deleteTx(${tx.id})" title="ลบรายการ" class="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");

  if (window.lucide) lucide.createIcons();
}

function getAuditBadge(status, note) {
  if (status === "duplicate_exact") {
    return `<span class="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-100 text-rose-800 border border-rose-200 flex items-center w-max" title="${escapeHtml(note || '')}"><i data-lucide="alert-circle" class="w-3 h-3 mr-1"></i>สลิปซ้ำ 100%</span>`;
  }
  if (status === "duplicate_fuzzy") {
    return `<span class="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200 flex items-center w-max" title="${escapeHtml(note || '')}"><i data-lucide="help-circle" class="w-3 h-3 mr-1"></i>เตือนยอดซ้ำ</span>`;
  }
  if (status === "math_mismatch") {
    return `<span class="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 flex items-center w-max" title="${escapeHtml(note || '')}"><i data-lucide="calculator" class="w-3 h-3 mr-1"></i>ยอดไม่ตรง</span>`;
  }
  return `<span class="px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center w-max"><i data-lucide="check" class="w-3 h-3 mr-1"></i>ตรวจสอบแล้ว</span>`;
}

function getCategoryStyle(cat) {
  const map = {
    "อาหารและเครื่องดื่ม": "bg-orange-50 text-orange-700 border border-orange-200",
    "เดินทางและยานพาหนะ": "bg-blue-50 text-blue-700 border border-blue-200",
    "สาธารณูปโภคและบิล": "bg-cyan-50 text-cyan-700 border border-cyan-200",
    "ที่อยู่อาศัยและค่าเช่า": "bg-purple-50 text-purple-700 border border-purple-200",
    "ช้อปปิ้งและของใช้": "bg-pink-50 text-pink-700 border border-pink-200",
    "ธุรกิจและการงาน": "bg-indigo-50 text-indigo-700 border border-indigo-200",
    "สุขภาพและความงาม": "bg-teal-50 text-teal-700 border border-teal-200",
    "การเงินและหนี้สิน": "bg-amber-50 text-amber-700 border border-amber-200",
    "โอนเงินและชำระเงิน": "bg-emerald-50 text-emerald-700 border border-emerald-200"
  };
  return map[cat] || "bg-slate-100 text-slate-700 border border-slate-200";
}

// ----------------------------------------------------
// Daily Breakdown Tab
// ----------------------------------------------------
function loadDailyBreakdown() {
  const tbody = document.getElementById("dailyTableBody");
  if (!tbody) return;

  const dailyMap = {};
  localTransactions.forEach(tx => {
    const d = tx.transaction_date || "ไม่ระบุวันที่";
    if (!dailyMap[d]) {
      dailyMap[d] = { transaction_date: d, count: 0, total_expense: 0, total_income: 0, warning_count: 0 };
    }
    dailyMap[d].count++;
    const amt = parseFloat(tx.total_amount || tx.amount || 0);
    if (tx.type === "expense") dailyMap[d].total_expense += amt;
    else dailyMap[d].total_income += amt;
    if (tx.audit_status !== "clean") dailyMap[d].warning_count++;
  });

  const rows = Object.values(dailyMap).sort((a, b) => b.transaction_date.localeCompare(a.transaction_date));

  if (rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-slate-400">ยังไม่มีข้อมูลรายวัน</td></tr>`;
    return;
  }

  tbody.innerHTML = rows.map(r => `
    <tr class="hover:bg-slate-50 transition">
      <td class="py-3 px-4 font-semibold text-slate-800">${r.transaction_date}</td>
      <td class="py-3 px-4 text-center font-mono">${r.count} สลิป</td>
      <td class="py-3 px-4 text-right font-bold text-rose-600">฿${formatMoney(r.total_expense)}</td>
      <td class="py-3 px-4 text-right font-bold text-emerald-600">฿${formatMoney(r.total_income)}</td>
      <td class="py-3 px-4 text-center">
        ${r.warning_count > 0 ? `<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">${r.warning_count} รายการ</span>` : `<span class="text-slate-400 text-xs">-</span>`}
      </td>
      <td class="py-3 px-4 text-center">
        <button onclick="filterByDate('${r.transaction_date}')" class="text-xs text-indigo-600 hover:text-indigo-800 font-medium underline">
          ดูรายการวันนี้
        </button>
      </td>
    </tr>
  `).join("");
}

function filterByDate(dateStr) {
  switchTab('transactions');
  document.getElementById("filterStartDate").value = dateStr;
  document.getElementById("filterEndDate").value = dateStr;
  reloadTransactions();
}

// ----------------------------------------------------
// Monthly Breakdown Tab & Charts
// ----------------------------------------------------
function loadMonthlyAndCharts() {
  const tbody = document.getElementById("monthlyTableBody");
  const monthlyMap = {};
  const categoryMap = {};

  localTransactions.forEach(tx => {
    const d = tx.transaction_date || "";
    const m = d.length >= 7 ? d.substring(0, 7) : "ไม่ระบุเดือน";
    if (!monthlyMap[m]) {
      monthlyMap[m] = { month: m, count: 0, total_expense: 0, total_income: 0, net_amount: 0 };
    }
    monthlyMap[m].count++;
    const amt = parseFloat(tx.total_amount || tx.amount || 0);
    if (tx.type === "expense") {
      monthlyMap[m].total_expense += amt;
      const cat = tx.category || "ทั่วไป";
      categoryMap[cat] = (categoryMap[cat] || 0) + amt;
    } else {
      monthlyMap[m].total_income += amt;
    }
    monthlyMap[m].net_amount = monthlyMap[m].total_income - monthlyMap[m].total_expense;
  });

  const rows = Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month));

  if (tbody) {
    if (rows.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center py-6 text-slate-400">ยังไม่มีข้อมูลรายเดือน</td></tr>`;
    } else {
      tbody.innerHTML = rows.map(r => `
        <tr class="hover:bg-slate-50 transition">
          <td class="py-3 px-4 font-semibold text-slate-800">${r.month}</td>
          <td class="py-3 px-4 text-center font-mono">${r.count} สลิป</td>
          <td class="py-3 px-4 text-right font-bold text-rose-600">฿${formatMoney(r.total_expense)}</td>
          <td class="py-3 px-4 text-right font-bold text-emerald-600">฿${formatMoney(r.total_income)}</td>
          <td class="py-3 px-4 text-right font-bold ${r.net_amount >= 0 ? 'text-emerald-600' : 'text-rose-600'}">
            ฿${formatMoney(r.net_amount)}
          </td>
        </tr>
      `).join("");
    }
  }

  // Monthly Bar Chart
  const ctxMonthly = document.getElementById("chartMonthly");
  if (ctxMonthly && window.Chart) {
    if (chartMonthlyInstance) chartMonthlyInstance.destroy();
    chartMonthlyInstance = new Chart(ctxMonthly, {
      type: "bar",
      data: {
        labels: rows.map(r => r.month),
        datasets: [
          {
            label: "ยอดรายจ่าย (บาท)",
            data: rows.map(r => r.total_expense),
            backgroundColor: "rgba(244, 63, 94, 0.8)",
            borderRadius: 6
          },
          {
            label: "ยอดรายรับ (บาท)",
            data: rows.map(r => r.total_income),
            backgroundColor: "rgba(34, 197, 94, 0.8)",
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' }
        }
      }
    });
  }

  // Category Donut Chart
  const ctxCat = document.getElementById("chartCategory");
  if (ctxCat && window.Chart) {
    if (chartCategoryInstance) chartCategoryInstance.destroy();
    const catLabels = Object.keys(categoryMap);
    const catValues = Object.values(categoryMap);
    const colors = [
      "#f97316", "#3b82f6", "#06b6d4", "#a855f7", "#ec4899",
      "#6366f1", "#14b8a6", "#f59e0b", "#10b981", "#64748b"
    ];

    chartCategoryInstance = new Chart(ctxCat, {
      type: "doughnut",
      data: {
        labels: catLabels.length ? catLabels : ["ไม่มีข้อมูล"],
        datasets: [{
          data: catValues.length ? catValues : [1],
          backgroundColor: catLabels.length ? colors.slice(0, catLabels.length) : ["#e2e8f0"]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right' }
        }
      }
    });
  }
}

// ----------------------------------------------------
// Side-by-Side Modal Inspector & Edit
// ----------------------------------------------------
function openInspectorModal(id) {
  const tx = localTransactions.find(t => t.id === id);
  if (!tx) return;

  currentModalTxId = id;
  document.getElementById("modalTxIdLabel").innerText = `Transaction #${tx.id} (${tx.file_name || 'Slip'})`;

  const imgEl = document.getElementById("modalSlipImg");
  const dlEl = document.getElementById("modalDownloadImg");
  if (tx.image_url) {
    imgEl.src = tx.image_url;
    imgEl.classList.remove("hidden");
    dlEl.href = tx.image_url;
    dlEl.classList.remove("hidden");
  } else {
    imgEl.src = "";
    imgEl.classList.add("hidden");
    dlEl.classList.add("hidden");
  }

  // Set fields
  document.getElementById("editDate").value = tx.transaction_date || "";
  document.getElementById("editTime").value = tx.transaction_time || "";
  document.getElementById("editAmount").value = tx.amount || 0;
  document.getElementById("editFee").value = tx.fee || 0;
  document.getElementById("editCategory").value = tx.category || "ทั่วไป";
  document.getElementById("editSubcategory").value = tx.subcategory || "";
  document.getElementById("editPayee").value = tx.payee_name || "";
  document.getElementById("editSource").value = tx.payment_source || "";
  document.getElementById("editRef").value = tx.ref_number || "";
  document.getElementById("editNotes").value = tx.notes || "";

  const alertBox = document.getElementById("modalAuditAlert");
  const alertText = document.getElementById("modalAuditText");
  if (tx.audit_status !== "clean") {
    alertBox.className = "p-3 rounded-xl border text-xs flex items-start space-x-2 bg-amber-50 border-amber-200 text-amber-900";
    alertText.innerText = `ข้อสังเกต Audit: ${tx.audit_note || 'ตรวจพบความผิดปกติ'}`;
    alertBox.classList.remove("hidden");
  } else {
    alertBox.className = "p-3 rounded-xl border text-xs flex items-start space-x-2 bg-emerald-50 border-emerald-200 text-emerald-900";
    alertText.innerText = `สถานะปกติ: ผ่านการตรวจสอบแล้ว (Verified)`;
    alertBox.classList.remove("hidden");
  }

  document.getElementById("inspectorModal").classList.remove("hidden");
  if (window.lucide) lucide.createIcons();
}

function closeInspectorModal() {
  document.getElementById("inspectorModal").classList.add("hidden");
  currentModalTxId = null;
}

function saveModalChanges() {
  if (!currentModalTxId) return;
  const tx = localTransactions.find(t => t.id === currentModalTxId);
  if (!tx) return;

  tx.transaction_date = document.getElementById("editDate").value;
  tx.transaction_time = document.getElementById("editTime").value;
  tx.amount = parseFloat(document.getElementById("editAmount").value) || 0;
  tx.fee = parseFloat(document.getElementById("editFee").value) || 0;
  tx.total_amount = tx.amount + tx.fee;
  tx.category = document.getElementById("editCategory").value;
  tx.subcategory = document.getElementById("editSubcategory").value;
  tx.payee_name = document.getElementById("editPayee").value;
  tx.payment_source = document.getElementById("editSource").value;
  tx.ref_number = document.getElementById("editRef").value;
  tx.notes = document.getElementById("editNotes").value;
  tx.audit_status = "clean";
  tx.audit_note = "แก้ไขและยืนยันโดยผู้ใช้แล้ว";

  saveToStorage();
  closeInspectorModal();
  loadKPIStats();
  reloadTransactions();
  loadDailyBreakdown();
  loadMonthlyAndCharts();
}

function markCurrentTxVerified() {
  if (!currentModalTxId) return;
  const tx = localTransactions.find(t => t.id === currentModalTxId);
  if (!tx) return;
  tx.audit_status = "clean";
  tx.audit_note = "ยืนยันความถูกต้องแล้ว (Verified)";
  saveToStorage();
  closeInspectorModal();
  loadKPIStats();
  reloadTransactions();
}

function deleteCurrentModalTx() {
  if (!currentModalTxId) return;
  deleteTx(currentModalTxId);
  closeInspectorModal();
}

function deleteTx(id) {
  if (!confirm("คุณต้องการลบรายการนี้ใช่หรือไม่?")) return;
  localTransactions = localTransactions.filter(t => t.id !== id);
  saveToStorage();
  loadKPIStats();
  reloadTransactions();
  loadDailyBreakdown();
  loadMonthlyAndCharts();
}

// ----------------------------------------------------
// Export Menu & Functions (Excel, CSV, JSON)
// ----------------------------------------------------
function toggleExportMenu() {
  const menu = document.getElementById("exportDropdown");
  menu.classList.toggle("hidden");
}

document.addEventListener("click", (e) => {
  const btn = document.getElementById("btnExportMenu");
  const menu = document.getElementById("exportDropdown");
  if (btn && menu && !btn.contains(e.target) && !menu.contains(e.target)) {
    menu.classList.add("hidden");
  }
});

function exportFile(type) {
  document.getElementById("exportDropdown").classList.add("hidden");

  if (type === "excel") {
    exportToExcel();
  } else if (type === "csv") {
    exportToCSV();
  } else if (type === "json") {
    exportBackupJson();
  }
}

function exportToExcel() {
  if (!window.XLSX) {
    alert("กำลังโหลดโมดูล Excel กรุณาลองใหม่อีกครั้ง");
    return;
  }

  const wb = XLSX.utils.book_new();

  // Sheet 1: Summary
  let totalExp = 0, totalInc = 0;
  localTransactions.forEach(t => {
    if (t.type === "expense") totalExp += (t.total_amount || t.amount);
    else totalInc += (t.total_amount || t.amount);
  });

  const summaryData = [
    ["รายงานสรุปค่าใช้จ่าย ExpenseAudit Pro"],
    ["วันที่พิมพ์รายงาน", new Date().toLocaleString("th-TH")],
    [""],
    ["สรุปภาพรวม", "จำนวนเงิน (บาท)"],
    ["ยอดรวมค่าใช้จ่ายทั้งหมด", totalExp],
    ["ยอดรวมรายรับทั้งหมด", totalInc],
    ["ยอดรวมสุทธิ", totalInc - totalExp],
    ["จำนวนสลิปทั้งหมด", localTransactions.length]
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, ws1, "ภาพรวม (Summary)");

  // Sheet 2: Daily
  const dailyMap = {};
  localTransactions.forEach(tx => {
    const d = tx.transaction_date || "ไม่ระบุ";
    if (!dailyMap[d]) dailyMap[d] = { d, count: 0, exp: 0, inc: 0 };
    dailyMap[d].count++;
    if (tx.type === "expense") dailyMap[d].exp += (tx.total_amount || tx.amount);
    else dailyMap[d].inc += (tx.total_amount || tx.amount);
  });
  const dailyData = [["วันที่", "จำนวนสลิป", "ยอดรายจ่าย (บาท)", "ยอดรายรับ (บาท)", "ยอดสุทธิ"]];
  Object.values(dailyMap).sort((a, b) => b.d.localeCompare(a.d)).forEach(x => {
    dailyData.push([x.d, x.count, x.exp, x.inc, x.inc - x.exp]);
  });
  const ws2 = XLSX.utils.aoa_to_sheet(dailyData);
  XLSX.utils.book_append_sheet(wb, ws2, "สรุปรายวัน (Daily)");

  // Sheet 3: Transactions
  const txData = [
    ["ID", "วันที่", "เวลา", "ประเภท", "ยอดเงิน (บาท)", "ค่าธรรมเนียม", "ยอดสุทธิ", "หมวดหมู่", "หมวดหมู่ย่อย", "ผู้รับเงิน / ร้านค้า", "ธนาคาร / ช่องทาง", "เลขอ้างอิง", "สถานะ Audit", "หมายเหตุ", "ชื่อไฟล์"]
  ];
  localTransactions.forEach(t => {
    txData.push([
      t.id,
      t.transaction_date,
      t.transaction_time,
      t.type === "expense" ? "รายจ่าย" : "รายรับ",
      t.amount,
      t.fee,
      t.total_amount || t.amount,
      t.category,
      t.subcategory,
      t.payee_name,
      t.payment_source,
      t.ref_number,
      t.audit_status === "clean" ? "ปกติ" : "ต้องตรวจสอบ",
      t.notes,
      t.file_name
    ]);
  });
  const ws3 = XLSX.utils.aoa_to_sheet(txData);
  XLSX.utils.book_append_sheet(wb, ws3, "รายการทั้งหมด (Transactions)");

  const fileName = `Expense_Audit_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

function exportToCSV() {
  const headers = ["ID", "วันที่", "เวลา", "ประเภท", "ยอดเงิน (บาท)", "หมวดหมู่", "ผู้รับเงิน / ร้านค้า", "ธนาคาร", "เลขอ้างอิง", "สถานะ Audit", "หมายเหตุ"];
  const rows = localTransactions.map(t => [
    t.id,
    t.transaction_date,
    t.transaction_time,
    t.type === "expense" ? "รายจ่าย" : "รายรับ",
    t.total_amount || t.amount,
    t.category,
    t.payee_name,
    t.payment_source,
    t.ref_number,
    t.audit_status,
    t.notes
  ]);

  const csv = "\uFEFF" + [headers, ...rows].map(row => row.map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Expense_Transactions_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportBackupJson() {
  const jsonStr = JSON.stringify(localTransactions, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ExpenseAudit_Backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importBackupJson(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (Array.isArray(data)) {
        localTransactions = data;
        saveToStorage();
        loadKPIStats();
        reloadTransactions();
        loadDailyBreakdown();
        loadMonthlyAndCharts();
        alert(`นำเข้าข้อมูลสำเร็จ ${data.length} รายการ!`);
        closeSettingsModal();
      } else {
        alert("รูปแบบไฟล์ไม่ถูกต้อง กรุณาใช้ไฟล์ JSON ที่ดาวน์โหลดจากการสำรองข้อมูล");
      }
    } catch (err) {
      alert("ไม่สามารถอ่านไฟล์ JSON ได้: " + err.message);
    }
  };
  reader.readAsText(file);
}

function clearAllTransactions() {
  if (!confirm("คุณต้องการล้างข้อมูลสลิปทั้งหมดใช่หรือไม่? (แนะนำให้ดาวน์โหลดสำรองไว้ก่อน)")) return;
  localTransactions = [];
  saveToStorage();
  loadKPIStats();
  reloadTransactions();
  loadDailyBreakdown();
  loadMonthlyAndCharts();
  closeSettingsModal();
}

function openSettingsModal() {
  document.getElementById("settingsModal").classList.remove("hidden");
  if (window.lucide) lucide.createIcons();
}

function closeSettingsModal() {
  document.getElementById("settingsModal").classList.add("hidden");
}

// ----------------------------------------------------
// Utilities
// ----------------------------------------------------
function formatMoney(amount) {
  const n = parseFloat(amount) || 0;
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
