// ExpenseAudit Pro - Client Application Logic

let currentBatchId = null;
let batchPollInterval = null;
let currentModalTxId = null;
let chartMonthlyInstance = null;
let chartCategoryInstance = null;
let searchDebounceTimer = null;

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) {
    lucide.createIcons();
  }
  loadKPIStats();
  reloadTransactions();
  checkSettings();
});

// ----------------------------------------------------
// Navigation Tab Switching
// ----------------------------------------------------
function switchTab(tabName) {
  const tabs = ['transactions', 'daily', 'monthly'];
  tabs.forEach(t => {
    const btn = document.getElementById(`tabBtn${capitalize(t)}`);
    const content = document.getElementById(`tabContent${capitalize(t)}`);
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
// Drag & Drop / Batch Upload (100 - 200+ Files)
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
    uploadBatchFiles(files);
  }
}

function handleFileSelect(e) {
  const files = e.target.files;
  if (files && files.length > 0) {
    uploadBatchFiles(files);
  }
}

async function uploadBatchFiles(fileList) {
  const files = Array.from(fileList);
  if (files.length === 0) return;

  const progressContainer = document.getElementById("batchProgressContainer");
  const progressBar = document.getElementById("batchProgressBar");
  const progressLabel = document.getElementById("batchProgressLabel");
  const progressPercent = document.getElementById("batchProgressPercent");
  const countStats = document.getElementById("batchCountStats");

  progressContainer.classList.remove("hidden");
  progressBar.style.width = "0%";
  progressLabel.innerText = `กำลังอัปโหลด ${files.length} ไฟล์ไปยังเซิร์ฟเวอร์...`;
  progressPercent.innerText = "0%";
  countStats.innerText = `0 / ${files.length} ไฟล์`;

  const formData = new FormData();
  for (let i = 0; i < files.length; i++) {
    formData.append("files", files[i]);
  }

  try {
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData
    });
    const result = await res.json();

    if (!res.ok) {
      alert("เกิดข้อผิดพลาดในการอัปโหลด: " + (result.error || "Unknown error"));
      progressContainer.classList.add("hidden");
      return;
    }

    currentBatchId = result.batch_id;
    progressLabel.innerText = `AI กำลังวิเคราะห์สลิปและบิล (${files.length} รายการ)...`;
    startBatchPolling(currentBatchId, files.length);

  } catch (err) {
    alert("การเชื่อมต่อล้มเหลว: " + err.message);
    progressContainer.classList.add("hidden");
  }
}

function startBatchPolling(batchId, totalFiles) {
  if (batchPollInterval) clearInterval(batchPollInterval);

  batchPollInterval = setInterval(async () => {
    try {
      const res = await fetch(`/api/batch/${batchId}/status`);
      if (!res.ok) return;
      const data = await res.json();

      const done = (data.processed_files || 0) + (data.failed_files || 0);
      const pct = data.percentage || 0;

      document.getElementById("batchProgressBar").style.width = `${pct}%`;
      document.getElementById("batchProgressPercent").innerText = `${pct}%`;
      document.getElementById("batchCountStats").innerText = `${done} / ${data.total_files} ไฟล์ (สำเร็จ: ${data.processed_files}, ผิดพลาด: ${data.failed_files})`;

      if (data.is_finished || done >= data.total_files) {
        clearInterval(batchPollInterval);
        batchPollInterval = null;
        document.getElementById("batchProgressLabel").innerText = "ประมวลผลและ Audit เสร็จสมบูรณ์แล้ว!";
        document.getElementById("batchProgressBar").style.width = "100%";
        document.getElementById("batchProgressPercent").innerText = "100%";

        setTimeout(() => {
          document.getElementById("batchProgressContainer").classList.add("hidden");
          // Reset file input
          document.getElementById("batchFileInput").value = "";
        }, 3500);

        // Refresh all components
        loadKPIStats();
        reloadTransactions();
        loadDailyBreakdown();
        loadMonthlyAndCharts();
      }
    } catch (e) {
      console.error("Polling error:", e);
    }
  }, 1000);
}

// ----------------------------------------------------
// Transactions Table & Filters
// ----------------------------------------------------
function debounceReloadTransactions() {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    reloadTransactions();
  }, 300);
}

async function reloadTransactions() {
  const search = document.getElementById("filterSearch").value;
  const category = document.getElementById("filterCategory").value;
  const auditStatus = document.getElementById("filterAudit").value;
  const startDate = document.getElementById("filterStartDate").value;
  const endDate = document.getElementById("filterEndDate").value;

  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (category) params.append("category", category);
  if (auditStatus) params.append("audit_status", auditStatus);
  if (startDate) params.append("start_date", startDate);
  if (endDate) params.append("end_date", endDate);

  const tbody = document.getElementById("transactionTableBody");
  tbody.innerHTML = `
    <tr>
      <td colspan="8" class="text-center py-8 text-slate-400">
        <div class="inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2"></div>
        <div>กำลังโหลดข้อมูลธุรกรรม...</div>
      </td>
    </tr>
  `;

  try {
    const res = await fetch(`/api/transactions?${params.toString()}`);
    const data = await res.json();
    renderTransactionsTable(data.transactions || []);
  } catch (err) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center py-8 text-rose-500">
          ไม่สามารถโหลดข้อมูลได้: ${err.message}
        </td>
      </tr>
    `;
  }
}

function renderTransactionsTable(transactions) {
  const tbody = document.getElementById("transactionTableBody");
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
    return `<span class="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-100 text-rose-800 border border-rose-200 flex items-center w-max" title="${escapeHtml(note)}"><i data-lucide="alert-circle" class="w-3 h-3 mr-1"></i>สลิปซ้ำ 100%</span>`;
  }
  if (status === "duplicate_fuzzy") {
    return `<span class="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200 flex items-center w-max" title="${escapeHtml(note)}"><i data-lucide="help-circle" class="w-3 h-3 mr-1"></i>เตือนยอดซ้ำ</span>`;
  }
  if (status === "math_mismatch") {
    return `<span class="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 flex items-center w-max" title="${escapeHtml(note)}"><i data-lucide="calculator" class="w-3 h-3 mr-1"></i>ยอดไม่ตรง</span>`;
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
    "การเงินและหนี้สิน": "bg-amber-50 text-amber-700 border border-amber-200"
  };
  return map[cat] || "bg-slate-100 text-slate-700 border border-slate-200";
}

// ----------------------------------------------------
// Daily Breakdown Tab
// ----------------------------------------------------
async function loadDailyBreakdown() {
  const tbody = document.getElementById("dailyTableBody");
  tbody.innerHTML = `<tr><td colspan="6" class="text-center py-6 text-slate-400">กำลังคำนวณยอดรายวัน...</td></tr>`;

  try {
    const res = await fetch("/api/analytics/daily");
    const data = await res.json();
    const rows = data.daily || [];

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
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-6 text-rose-500">โหลดข้อมูลรายวันผิดพลาด: ${err.message}</td></tr>`;
  }
}

function filterByDate(dateStr) {
  document.getElementById("filterStartDate").value = dateStr;
  document.getElementById("filterEndDate").value = dateStr;
  switchTab("transactions");
  reloadTransactions();
}

// ----------------------------------------------------
// Monthly & Charts
// ----------------------------------------------------
async function loadMonthlyAndCharts() {
  try {
    const [resMonth, resCat] = await Promise.all([
      fetch("/api/analytics/monthly"),
      fetch("/api/analytics/categories")
    ]);
    const dataMonth = await resMonth.json();
    const dataCat = await resCat.json();

    renderMonthlyTable(dataMonth.monthly || []);
    renderMonthlyChart(dataMonth.monthly || []);
    renderCategoryChart(dataCat.categories || []);
  } catch (err) {
    console.error("Error loading monthly data:", err);
  }
}

function renderMonthlyTable(rows) {
  const tbody = document.getElementById("monthlyTableBody");
  if (rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center py-6 text-slate-400">ยังไม่มีข้อมูลรายเดือน</td></tr>`;
    return;
  }

  tbody.innerHTML = rows.map(r => {
    const net = (r.total_income || 0) - (r.total_expense || 0);
    const netColor = net >= 0 ? "text-emerald-600 font-bold" : "text-rose-600 font-bold";

    return `
      <tr class="hover:bg-slate-50 transition">
        <td class="py-3 px-4 font-semibold text-slate-900">${r.month}</td>
        <td class="py-3 px-4 text-center font-mono">${r.count} รายการ</td>
        <td class="py-3 px-4 text-right font-bold text-rose-600">฿${formatMoney(r.total_expense)}</td>
        <td class="py-3 px-4 text-right font-bold text-emerald-600">฿${formatMoney(r.total_income)}</td>
        <td class="py-3 px-4 text-right ${netColor}">฿${formatMoney(net)}</td>
      </tr>
    `;
  }).join("");
}

function renderMonthlyChart(rows) {
  const ctx = document.getElementById("chartMonthly").getContext("2d");
  if (chartMonthlyInstance) chartMonthlyInstance.destroy();

  const labels = rows.map(r => r.month).reverse();
  const expenses = rows.map(r => r.total_expense).reverse();
  const incomes = rows.map(r => r.total_income).reverse();

  chartMonthlyInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "รายจ่าย (Expenses)",
          data: expenses,
          backgroundColor: "#f43f5e",
          borderRadius: 6
        },
        {
          label: "รายรับ (Income)",
          data: incomes,
          backgroundColor: "#10b981",
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (val) => "฿" + Number(val).toLocaleString()
          }
        }
      }
    }
  });
}

function renderCategoryChart(categories) {
  const ctx = document.getElementById("chartCategory").getContext("2d");
  if (chartCategoryInstance) chartCategoryInstance.destroy();

  const labels = categories.map(c => c.category);
  const dataVals = categories.map(c => c.total);

  const colors = [
    "#f97316", "#3b82f6", "#06b6d4", "#a855f7",
    "#ec4899", "#6366f1", "#14b8a6", "#eab308", "#64748b"
  ];

  chartCategoryInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [{
        data: dataVals,
        backgroundColor: colors.slice(0, labels.length)
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom"
        }
      }
    }
  });
}

// ----------------------------------------------------
// Side-by-Side Slip Inspector Modal
// ----------------------------------------------------
async function openInspectorModal(txId) {
  currentModalTxId = txId;
  try {
    const res = await fetch(`/api/transactions/${txId}`);
    if (!res.ok) return;
    const tx = await res.json();

    document.getElementById("modalTxIdLabel").innerText = `Transaction #${tx.id} • Ref: ${tx.ref_number || "N/A"}`;
    const imgEl = document.getElementById("modalSlipImg");
    const linkEl = document.getElementById("modalDownloadImg");

    if (tx.image_url) {
      imgEl.src = tx.image_url;
      imgEl.classList.remove("hidden");
      linkEl.href = tx.image_url;
      linkEl.classList.remove("hidden");
    } else {
      imgEl.classList.add("hidden");
      linkEl.classList.add("hidden");
    }

    // Populate editable fields
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

    // Audit alert block
    const alertBox = document.getElementById("modalAuditAlert");
    const alertText = document.getElementById("modalAuditText");
    if (tx.audit_status === "clean") {
      alertBox.className = "p-3 rounded-xl border text-xs flex items-start space-x-2 bg-emerald-50 border-emerald-200 text-emerald-800";
      alertText.innerHTML = `<strong>ผ่านการตรวจสอบ (Audit Clean):</strong> ${escapeHtml(tx.audit_note || "ไม่พบข้อสังเกตหรือรายการซ้ำ")}`;
    } else {
      alertBox.className = "p-3 rounded-xl border text-xs flex items-start space-x-2 bg-amber-50 border-amber-200 text-amber-900";
      alertText.innerHTML = `<strong>แจ้งเตือนจากระบบ Audit:</strong> ${escapeHtml(tx.audit_note || tx.audit_status)}`;
    }

    document.getElementById("inspectorModal").classList.remove("hidden");
    if (window.lucide) lucide.createIcons();
  } catch (e) {
    alert("ไม่สามารถเปิดข้อมูลสลิปได้: " + e.message);
  }
}

function closeInspectorModal() {
  document.getElementById("inspectorModal").classList.add("hidden");
  currentModalTxId = null;
}

async function saveModalChanges() {
  if (!currentModalTxId) return;

  const updates = {
    transaction_date: document.getElementById("editDate").value,
    transaction_time: document.getElementById("editTime").value,
    amount: parseFloat(document.getElementById("editAmount").value) || 0,
    fee: parseFloat(document.getElementById("editFee").value) || 0,
    category: document.getElementById("editCategory").value,
    subcategory: document.getElementById("editSubcategory").value,
    payee_name: document.getElementById("editPayee").value,
    payment_source: document.getElementById("editSource").value,
    ref_number: document.getElementById("editRef").value,
    notes: document.getElementById("editNotes").value
  };
  updates.total_amount = updates.amount + updates.fee;

  try {
    const res = await fetch(`/api/transactions/${currentModalTxId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates)
    });
    if (res.ok) {
      closeInspectorModal();
      reloadTransactions();
      loadKPIStats();
      loadDailyBreakdown();
    } else {
      alert("บันทึกการแก้ไขไม่สำเร็จ");
    }
  } catch (e) {
    alert("เกิดข้อผิดพลาด: " + e.message);
  }
}

async function markCurrentTxVerified() {
  if (!currentModalTxId) return;
  try {
    const res = await fetch(`/api/audit/verify/${currentModalTxId}`, { method: "POST" });
    if (res.ok) {
      closeInspectorModal();
      reloadTransactions();
      loadKPIStats();
    }
  } catch (e) {
    alert("ข้อผิดพลาด: " + e.message);
  }
}

async function deleteCurrentModalTx() {
  if (!currentModalTxId) return;
  if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรายการธุรกรรมนี้?")) return;

  try {
    const res = await fetch(`/api/transactions/${currentModalTxId}`, { method: "DELETE" });
    if (res.ok) {
      closeInspectorModal();
      reloadTransactions();
      loadKPIStats();
      loadDailyBreakdown();
    }
  } catch (e) {
    alert("ลบไม่สำเร็จ: " + e.message);
  }
}

async function deleteTx(txId) {
  if (!confirm("ต้องการลบรายการนี้ใช่หรือไม่?")) return;
  try {
    const res = await fetch(`/api/transactions/${txId}`, { method: "DELETE" });
    if (res.ok) {
      reloadTransactions();
      loadKPIStats();
      loadDailyBreakdown();
    }
  } catch (e) {
    alert("ลบไม่สำเร็จ: " + e.message);
  }
}

// ----------------------------------------------------
// Global Audit Recheck
// ----------------------------------------------------
async function runGlobalRecheck() {
  const btn = document.getElementById("btnRecheck");
  const origHtml = btn.innerHTML;
  btn.innerHTML = `<span class="inline-block w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span> <span>กำลัง Recheck...</span>`;
  btn.disabled = true;

  try {
    const res = await fetch("/api/audit/recheck-all", { method: "POST" });
    const data = await res.json();
    alert(`ตรวจสอบและ Recheck ทั้งระบบเสร็จสิ้น!\n${data.message}`);
    reloadTransactions();
    loadKPIStats();
    loadDailyBreakdown();
  } catch (e) {
    alert("เกิดข้อผิดพลาดในการ Recheck: " + e.message);
  } finally {
    btn.innerHTML = origHtml;
    btn.disabled = false;
    if (window.lucide) lucide.createIcons();
  }
}

// ----------------------------------------------------
// KPI Stats
// ----------------------------------------------------
async function loadKPIStats() {
  try {
    const res = await fetch("/api/analytics/stats");
    const data = await res.json();
    document.getElementById("statExpense").innerText = `฿ ${formatMoney(data.total_expense || 0)}`;
    document.getElementById("statIncome").innerText = `฿ ${formatMoney(data.total_income || 0)}`;
    document.getElementById("statFlagged").innerText = `${(data.total_flagged || 0).toLocaleString()} รายการ`;
    document.getElementById("statCount").innerText = `${(data.total_count || 0).toLocaleString()} รูป`;
  } catch (e) {
    console.error("Error loading KPI stats:", e);
  }
}

// ----------------------------------------------------
// Exports
// ----------------------------------------------------
function toggleExportMenu() {
  const menu = document.getElementById("exportDropdown");
  menu.classList.toggle("hidden");
}

document.addEventListener("click", (e) => {
  const menu = document.getElementById("exportDropdown");
  const btn = document.getElementById("btnExportMenu");
  if (!btn.contains(e.target) && !menu.contains(e.target)) {
    menu.classList.add("hidden");
  }
});

function exportFile(type) {
  document.getElementById("exportDropdown").classList.add("hidden");
  const search = document.getElementById("filterSearch").value;
  const category = document.getElementById("filterCategory").value;
  const auditStatus = document.getElementById("filterAudit").value;
  const startDate = document.getElementById("filterStartDate").value;
  const endDate = document.getElementById("filterEndDate").value;

  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (category) params.append("category", category);
  if (auditStatus) params.append("audit_status", auditStatus);
  if (startDate) params.append("start_date", startDate);
  if (endDate) params.append("end_date", endDate);

  const endpoint = type === 'excel' ? '/api/export/excel' : '/api/export/csv';
  window.location.href = `${endpoint}?${params.toString()}`;
}

// ----------------------------------------------------
// Settings & API Key
// ----------------------------------------------------
function openSettingsModal() {
  document.getElementById("settingsModal").classList.remove("hidden");
  checkSettings();
}

function closeSettingsModal() {
  document.getElementById("settingsModal").classList.add("hidden");
}

async function checkSettings() {
  try {
    const res = await fetch("/api/settings");
    const data = await res.json();
    const stEl = document.getElementById("apiKeyStatus");
    const alertBox = document.getElementById("apiKeyMissingAlert");
    if (data.has_api_key) {
      stEl.innerText = `สถานะ: มีการตั้งค่า Key แล้ว (${data.masked_key}) - พร้อมอ่านภาพจริง 100%`;
      stEl.className = "text-xs mt-1 text-emerald-600 font-semibold";
      if (alertBox) alertBox.classList.add("hidden");
    } else {
      stEl.innerText = "สถานะ: ยังไม่มี Key (กรุณากรอก API Key เพื่อเริ่มใช้งานจริง)";
      stEl.className = "text-xs mt-1 text-amber-600 font-semibold";
      if (alertBox) alertBox.classList.remove("hidden");
    }
    return data.has_api_key;
  } catch (e) {
    console.error("Settings check failed:", e);
    return false;
  }
}

async function saveApiKey() {
  const key = document.getElementById("inputApiKey").value.trim();
  if (!key) {
    alert("กรุณากรอก Gemini API Key");
    return;
  }
  try {
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key: key })
    });
    if (res.ok) {
      alert("บันทึก Google Gemini API Key เรียบร้อยแล้ว!\nระบบพร้อมสแกนและ Audit ข้อมูลจริงจากสลิปของคุณแล้วครับ");
      closeSettingsModal();
      checkSettings();
    }
  } catch (e) {
    alert("บันทึกไม่สำเร็จ: " + e.message);
  }
}

// ----------------------------------------------------
// Utility Helpers
// ----------------------------------------------------
function formatMoney(num) {
  return Number(num || 0).toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function escapeHtml(text) {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function clearAllTransactions() {
  if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการล้างข้อมูลสลิปและธุรกรรมทั้งหมด?")) return;
  try {
    const res = await fetch("/api/clear-all", { method: "POST" });
    if (res.ok) {
      reloadTransactions();
      loadKPIStats();
      loadDailyBreakdown();
      loadMonthlyAndCharts();
      closeSettingsModal();
      alert("ล้างข้อมูลเรียบร้อยแล้ว");
    }
  } catch (e) {
    alert("เกิดข้อผิดพลาด: " + e.message);
  }
}

