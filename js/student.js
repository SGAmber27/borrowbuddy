// ===============================
// Borrow Buddy Approval System JS (safe, non-redeclaration)
// - Uses existing global `requests` and DOM elements when present
// - Guards against missing modal on student pages
// ===============================

// Load requests from Supabase
let requests = []; // Will be populated by initSupabase() callers

const myRequestsEl = document.getElementById("myRequests");

async function loadStudentRequests() {
  requests = await getRequestsAsync();
  renderRequests();
}

async function renderRequests() {
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

await loadStudentRequests();

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
  approvalForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (currentIndex === null) return;
    const dueDateVal = document.getElementById('dueDate')?.value;
    if (!dueDateVal) { alert('Please select a due date before approving.'); return; }

    await updateRequestAsync(requests[currentIndex].id, {
      status: 'Approved',
      dueDate: dueDateVal,
      approvedAt: new Date().toISOString()
    });

    showNotification('✅ Request Approved!', 'success');
    renderRequests();
    if (modal) modal.style.display = 'none';

  });
}

if (rejectRequestBtn) {
  rejectRequestBtn.addEventListener('click', async () => {
    if (currentIndex === null) return;
    await updateRequestAsync(requests[currentIndex].id, {
      status: 'Rejected',
      rejectedAt: new Date().toISOString()
    });

    showNotification('❌ Request Rejected', 'warning');
    renderRequests();
    if (modal) modal.style.display = 'none';

  });
}
