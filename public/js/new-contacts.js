// public/js/new-contact.js
const form = document.getElementById('contactForm');
const msg = document.getElementById('message');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  msg.textContent = '';

  const formData = new FormData(form);
  const payload = {
    firstName: formData.get('firstName')?.trim(),
    lastName: formData.get('lastName')?.trim(),
    email: formData.get('email')?.trim(),
    favoriteColor: formData.get('favoriteColor')?.trim(),
    birthday: formData.get('birthday')?.trim()
  };

  // simple client-side check
  const missing = Object.entries(payload)
    .filter(([, v]) => !v)
    .map(([k]) => k);

  if (missing.length) {
    msg.textContent = `Missing: ${missing.join(', ')}`;
    return;
  }

  try {
    const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      msg.textContent = data?.error ? `Error: ${data.error}` : `Error: HTTP ${res.status}`;
      return;
    }

    msg.textContent = 'Contact created!';
    form.reset();

    // Optional: take them to the list page
    // window.location.href = '/contacts.html';
  } catch (err) {
    console.error(err);
    msg.textContent = 'Network error creating contact.';
  }
});