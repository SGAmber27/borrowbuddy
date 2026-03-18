// ===============================
// Borrow Buddy Approval System JS (safe, non-redeclaration)
// - Uses existing global `requests` and DOM elements when present
// - Guards against missing modal on student pages
// ===============================

if (typeof requests === 'undefined' || !Array.isArray(requests)) {
  window.requests = [
    { item: "Python Book", code: "BK001", status: "Pending", dueDate: "", approvedDate: "", student: "Juan Dela Cruz" },
    { item: "Arduino Kit", code: "EQ004", status: "Pending", dueDate: "", approvedDate: "", student: "Maria Santos" }
  ];
}

const myRequestsEl = document.getElementById("myRequests");

function renderRequests() {
  if (!myRequestsEl) {
    console.warn('myRequests container not found; skipping renderRequests.');
    return;
  }

  myRequestsEl.innerHTML = "";
  requests.forEach((req, index) => {
    const card = document.createElement("div");
    card.className = 'request-card';
    card.innerHTML = `
      <h3 class="item-name">${req.item}</h3>
      <p class="item-code">${req.code}</p>
      <p class="status">${req.status}</p>
      <p class="due-date">${req.dueDate || '-'}</p>
      <p class="approved-date">${req.approvedDate || '-'}</p>
    `;
    card.addEventListener('click', () => openApprovalModal(index));
    myRequestsEl.appendChild(card);
  });
}

renderRequests();

// Modal elements (may be absent on student pages)
const modal = document.getElementById("approvalModal");
const closeModal = document.getElementById("closeModal");
const rejectRequestBtn = document.getElementById("rejectRequest");
const approvalForm = document.getElementById("approvalForm");

let currentIndex = null;

function openApprovalModal(index) {
  currentIndex = index;
  const req = requests[index];

  if (!modal) {
    alert('Approval modal is not available on this page.');
    return;
  }

  const itemNameEl = document.getElementById("itemName");
  const itemCodeEl = document.getElementById("itemCode");
  const studentNameEl = document.getElementById("studentName");
  const dueDateEl = document.getElementById("dueDate");

  if (itemNameEl) itemNameEl.value = req.item || '';
  if (itemCodeEl) itemCodeEl.value = req.code || '';
  if (studentNameEl) studentNameEl.value = req.student || '';
  if (dueDateEl) {
    const today = new Date().toISOString().split('T')[0];
    dueDateEl.setAttribute('min', today);
    dueDateEl.value = req.dueDate || '';
  }

  modal.style.display = 'block';
}

if (closeModal) closeModal.onclick = () => { if (modal) modal.style.display = 'none'; };
window.addEventListener('click', (event) => { if (modal && event.target === modal) modal.style.display = 'none'; });

if (approvalForm) {
  approvalForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (currentIndex === null) return;
    const dueDateVal = document.getElementById('dueDate')?.value;
    if (!dueDateVal) { alert('Please select a due date before approving.'); return; }

    requests[currentIndex].status = 'Approved';
    requests[currentIndex].dueDate = dueDateVal;
    requests[currentIndex].approvedDate = new Date().toLocaleString();

    try { localStorage.setItem('requests', JSON.stringify(requests)); } catch (e) { console.error('Could not save requests', e); }

    renderRequests();
    if (modal) modal.style.display = 'none';
    alert('✅ Borrow Request Approved!');
  });
}

if (rejectRequestBtn) {
  rejectRequestBtn.addEventListener('click', () => {
    if (currentIndex === null) return;
    requests[currentIndex].status = 'Rejected';
    requests[currentIndex].approvedDate = new Date().toLocaleString();
    try { localStorage.setItem('requests', JSON.stringify(requests)); } catch (e) { console.error('Could not save requests', e); }
    renderRequests();
    if (modal) modal.style.display = 'none';
    alert('❌ Request Rejected.');
  });
}
