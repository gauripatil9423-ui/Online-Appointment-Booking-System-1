const form = document.getElementById('bookingForm');
const dateInput = document.getElementById('date');
const timeSelect = document.getElementById('time');
const message = document.getElementById('formMessage');
const list = document.getElementById('appointmentList');
const refreshBtn = document.getElementById('refreshBtn');

const pad = n => String(n).padStart(2, '0');
const localDate = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
dateInput.min = localDate(new Date());
dateInput.value = localDate(new Date(Date.now() + 86400000));

function fillTimes() {
  const chosenDate = dateInput.value;
  const previous = timeSelect.value;
  timeSelect.innerHTML = '<option value="">Select time</option>';
  for (let h = 9; h < 17; h++) {
    for (const m of [0, 30]) {
      const value = `${pad(h)}:${pad(m)}`;
      const slot = new Date(`${chosenDate}T${value}:00`);
      if (chosenDate === localDate(new Date()) && slot <= new Date()) continue;
      const label = slot.toLocaleTimeString([], {hour:'numeric', minute:'2-digit'});
      const option = new Option(label, value);
      timeSelect.add(option);
    }
  }
  if ([...timeSelect.options].some(o => o.value === previous)) timeSelect.value = previous;
}
dateInput.addEventListener('change', fillTimes);
fillTimes();

function showMessage(text, kind) {
  message.textContent = text;
  message.className = `message ${kind || ''}`;
}
function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
async function loadAppointments() {
  list.innerHTML = '<div class="empty">Loading appointments…</div>';
  try {
    const response = await fetch('/api/appointments');
    if (!response.ok) throw new Error('Could not load appointments.');
    const appointments = await response.json();
    if (!appointments.length) {
      list.innerHTML = '<div class="empty">No appointments yet. Use the form above to create your first booking.</div>';
      return;
    }
    list.innerHTML = appointments.map(a => {
      const d = new Date(a.dateTime);
      const statusClass = a.status === 'Cancelled' ? 'cancelled' : '';
      return `<article class="appointment-card">
        <div class="date-tile"><b>${pad(d.getDate())}</b><small>${d.toLocaleString([], {month:'short'}).toUpperCase()}</small></div>
        <div class="appointment-info"><h3>${escapeHtml(a.service)}</h3>
          <p>${escapeHtml(a.name)} · ${escapeHtml(a.email)}</p>
          <p>${d.toLocaleDateString([], {weekday:'short',year:'numeric',month:'short',day:'numeric'})} at ${d.toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})}</p>
          <span class="status ${statusClass}">${escapeHtml(a.status.toUpperCase())}</span>
        </div>
        <div class="appointment-actions">${a.status !== 'Cancelled' ? `<button class="cancel-button" data-cancel="${a.id}">Cancel</button>` : ''}<button class="delete-button" data-delete="${a.id}">Delete</button></div>
      </article>`;
    }).join('');
  } catch (error) {
    list.innerHTML = `<div class="empty">${escapeHtml(error.message)} Make sure the .NET server is running, then refresh.</div>`;
  }
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  showMessage('', '');
  const date = dateInput.value;
  const time = timeSelect.value;
  if (!date || !time) {
    showMessage('Please choose both a date and a time.', 'error');
    return;
  }
  const submit = form.querySelector('button[type="submit"]');
  submit.disabled = true;
  submit.textContent = 'Booking…';
  try {
    const response = await fetch('/api/appointments', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        service: document.getElementById('service').value,
        dateTime: `${date}T${time}:00`
      })
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.message || 'Booking failed. Please try again.');
    form.reset();
    dateInput.value = localDate(new Date(Date.now() + 86400000));
    fillTimes();
    showMessage('Appointment confirmed! Your booking appears in the appointments list below.', 'success');
    await loadAppointments();
    document.getElementById('appointments').scrollIntoView({behavior:'smooth', block:'start'});
  } catch (error) {
    showMessage(error.message, 'error');
  } finally {
    submit.disabled = false;
    submit.innerHTML = 'Confirm appointment <span>→</span>';
  }
});

list.addEventListener('click', async event => {
  const cancelButton = event.target.closest('[data-cancel]');
  const deleteButton = event.target.closest('[data-delete]');
  if (!cancelButton && !deleteButton) return;
  const button = cancelButton || deleteButton;
  const id = button.dataset.cancel || button.dataset.delete;
  const isDelete = Boolean(deleteButton);
  if (!confirm(isDelete ? 'Permanently delete this appointment?' : 'Cancel this appointment?')) return;
  button.disabled = true;
  try {
    const response = await fetch(isDelete ? `/api/appointments/${id}` : `/api/appointments/${id}/cancel`, {
      method: isDelete ? 'DELETE' : 'PATCH'
    });
    if (!response.ok) throw new Error('Action failed. Please refresh and try again.');
    await loadAppointments();
  } catch (error) {
    alert(error.message);
    button.disabled = false;
  }
});
refreshBtn.addEventListener('click', loadAppointments);
loadAppointments();
