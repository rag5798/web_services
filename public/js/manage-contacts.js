// public/js/manage-contacts.js

// ---- ROUTES: keep API + page paths in one place ----
const ROUTES = {
  apiList: '/api/contacts',                                   // CHANGED
  apiItem: (id) => `/api/contacts/${encodeURIComponent(id)}`, // CHANGED
  pageList: '/contacts',              // (now the list page)
  pageNew: '/contacts/new',
  pageManage: '/contacts/manage'
}

// Optional: wire nav links if they exist in your HTML
const linkList = document.getElementById('linkList');
const linkNew = document.getElementById('linkNew');
const linkManage = document.getElementById('linkManage');
if (linkList) linkList.href = ROUTES.pageList;
if (linkNew) linkNew.href = ROUTES.pageNew;
if (linkManage) linkManage.href = ROUTES.pageManage;

const tbody = document.getElementById('contactsBody');
const refreshBtn = document.getElementById('refreshBtn');
const listStatus = document.getElementById('listStatus');

const createForm = document.getElementById('createForm');
const createMsg = document.getElementById('createMsg');

const updateForm = document.getElementById('updateForm');
const updateMsg = document.getElementById('updateMsg');
const updateIdSel = document.getElementById('updateId');

const deleteForm = document.getElementById('deleteForm');
const deleteMsg = document.getElementById('deleteMsg');
const deleteIdSel = document.getElementById('deleteId');

let cache = []; // store contacts for quick lookups

function escapeHtml(str) {
  return String(str ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

async function loadContacts() {
  listStatus.textContent = 'Loading...';
  tbody.innerHTML = '';
  updateIdSel.innerHTML = '<option value="">-- select an id --</option>';
  deleteIdSel.innerHTML = '<option value="">-- select an id --</option>';

  try {
    const res = await fetch(ROUTES.apiList, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    cache = Array.isArray(data) ? data : [];

    // table
    const rows = cache.map(c => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="small">${escapeHtml(c._id)}</td>
        <td>${escapeHtml((c.firstName || '') + ' ' + (c.lastName || ''))}</td>
        <td>${escapeHtml(c.email || '')}</td>
        <td>${escapeHtml(c.favoriteColor || '')}</td>
        <td>${escapeHtml(c.birthday || '')}</td>
      `;
      return tr;
    });
    rows.forEach(r => tbody.appendChild(r));

    // select options
    for (const c of cache) {
      const optU = document.createElement('option');
      optU.value = c._id;
      optU.textContent = `${c._id} — ${c.firstName || ''} ${c.lastName || ''}`;
      updateIdSel.appendChild(optU);

      const optD = document.createElement('option');
      optD.value = c._id;
      optD.textContent = `${c._id} — ${c.firstName || ''} ${c.lastName || ''}`;
      deleteIdSel.appendChild(optD);
    }

    listStatus.textContent = `Loaded ${cache.length} contact(s).`;
    listStatus.className = 'status ok';
  } catch (e) {
    console.error(e);
    listStatus.textContent = 'Failed to load contacts.';
    listStatus.className = 'status err';
  }
}

// Prefill update form when an ID is chosen
updateIdSel.addEventListener('change', () => {
  const id = updateIdSel.value;
  const c = cache.find(x => x._id === id);
  const fields = updateForm.elements;
  if (c) {
    fields.firstName.value = c.firstName || '';
    fields.lastName.value = c.lastName || '';
    fields.email.value = c.email || '';
    fields.favoriteColor.value = c.favoriteColor || '';
    fields.birthday.value = (c.birthday || '').slice(0, 10); // yyyy-mm-dd
  } else {
    fields.firstName.value = '';
    fields.lastName.value = '';
    fields.email.value = '';
    fields.favoriteColor.value = '';
    fields.birthday.value = '';
  }
});

// CREATE -> POST /contacts
createForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  createMsg.textContent = '';
  createMsg.className = 'status';

  const fd = new FormData(createForm);
  const payload = {
    firstName: fd.get('firstName')?.trim(),
    lastName: fd.get('lastName')?.trim(),
    email: fd.get('email')?.trim(),
    favoriteColor: fd.get('favoriteColor')?.trim(),
    birthday: fd.get('birthday')?.trim()
  };

  const missing = Object.entries(payload).filter(([, v]) => !v).map(([k]) => k);
  if (missing.length) {
    createMsg.textContent = `Missing: ${missing.join(', ')}`;
    createMsg.className = 'status err';
    return;
  }

  try {
    const res = await fetch(ROUTES.apiList, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      createMsg.textContent = body?.error ? `Error: ${body.error}` : `Error: HTTP ${res.status}`;
      createMsg.className = 'status err';
      return;
    }
    createMsg.textContent = `Created! New id: ${body.id}`;
    createMsg.className = 'status ok';
    createForm.reset();
    await loadContacts();
  } catch (err) {
    console.error(err);
    createMsg.textContent = 'Network error creating contact.';
    createMsg.className = 'status err';
  }
});

// UPDATE -> PUT /contacts/:id
updateForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  updateMsg.textContent = '';
  updateMsg.className = 'status';

  const id = updateIdSel.value;
  if (!id) {
    updateMsg.textContent = 'Please choose a contact to update.';
    updateMsg.className = 'status err';
    return;
  }

  const fd = new FormData(updateForm);
  const payload = {
    firstName: fd.get('firstName')?.trim(),
    lastName: fd.get('lastName')?.trim(),
    email: fd.get('email')?.trim(),
    favoriteColor: fd.get('favoriteColor')?.trim(),
    birthday: fd.get('birthday')?.trim()
  };

  const missing = Object.entries(payload).filter(([, v]) => !v).map(([k]) => k);
  if (missing.length) {
    updateMsg.textContent = `Missing: ${missing.join(', ')}`;
    updateMsg.className = 'status err';
    return;
  }

  try {
    const res = await fetch(ROUTES.apiItem(id), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      updateMsg.textContent = body?.error ? `Error: ${body.error}` : `Error: HTTP ${res.status}`;
      updateMsg.className = 'status err';
      return;
    }

    updateMsg.textContent = 'Updated successfully.';
    updateMsg.className = 'status ok';
    await loadContacts();
  } catch (err) {
    console.error(err);
    updateMsg.textContent = 'Network error updating contact.';
    updateMsg.className = 'status err';
  }
});

// DELETE -> DELETE /contacts/:id
deleteForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  deleteMsg.textContent = '';
  deleteMsg.className = 'status';

  const id = deleteIdSel.value;
  if (!id) {
    deleteMsg.textContent = 'Please choose a contact to delete.';
    deleteMsg.className = 'status err';
    return;
  }

  if (!confirm('Delete this contact?')) return;

  try {
    const res = await fetch(ROUTES.apiItem(id), {
      method: 'DELETE',
      headers: { 'Accept': 'application/json' }
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      deleteMsg.textContent = body?.error ? `Error: ${body.error}` : `Error: HTTP ${res.status}`;
      deleteMsg.className = 'status err';
      return;
    }

    deleteMsg.textContent = 'Deleted successfully.';
    deleteMsg.className = 'status ok';
    await loadContacts();
  } catch (err) {
    console.error(err);
    deleteMsg.textContent = 'Network error deleting contact.';
    deleteMsg.className = 'status err';
  }
});

refreshBtn.addEventListener('click', loadContacts);

// initial load
loadContacts();