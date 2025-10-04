// public/js/contacts.js
const loadBtn = document.getElementById('loadBtn');
const statusEl = document.getElementById('status');
const tbody = document.getElementById('contactsBody');

loadBtn.addEventListener('click', async () => {
  statusEl.textContent = 'Loading...';
  tbody.innerHTML = '';

  try {
    const res = await fetch('/api/contacts', { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      statusEl.textContent = 'No contacts found.';
      return;
    }

    const rows = data.map(c => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${escapeHtml(c.firstName || '')}</td>
        <td>${escapeHtml(c.lastName || '')}</td>
        <td>${escapeHtml(c.email || '')}</td>
        <td>${escapeHtml(c.favoriteColor || '')}</td>
        <td>${escapeHtml(c.birthday || '')}</td>
      `;
      return tr;
    });

    rows.forEach(r => tbody.appendChild(r));
    statusEl.textContent = `Loaded ${data.length} contact(s).`;
  } catch (err) {
    console.error(err);
    statusEl.textContent = 'Failed to load contacts.';
  }
});

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}