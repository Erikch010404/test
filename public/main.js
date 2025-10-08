const form = document.getElementById('registrationForm');
const statusEl = document.getElementById('status');
const listEl = document.getElementById('registrations');

function setError(field, message) {
	const p = document.querySelector(`.error[data-error-for="${field}"]`);
	if (p) p.textContent = message || '';
}

function clearErrors() {
	['firstName','lastName','email','phone'].forEach((f) => setError(f, ''));
}

function isValidEmail(email) {
	const emailRegex = /^[\w.!#$%&'*+/=?^`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/;
	return emailRegex.test(String(email).toLowerCase());
}

function isValidPhone(phone) {
	if (!phone) return true;
	const digits = phone.replace(/\D/g, '');
	return digits.length >= 7 && digits.length <= 15;
}

async function loadRegistrations() {
	try {
		const res = await fetch('/api/registrations');
		const data = await res.json();
		listEl.innerHTML = '';
		data.forEach(r => {
			const li = document.createElement('li');
			li.textContent = `${r.first_name} ${r.last_name} — ${r.email}${r.phone ? ' — ' + r.phone : ''}`;
			listEl.appendChild(li);
		});
	} catch (e) {
		console.error(e);
	}
}

form.addEventListener('submit', async (e) => {
	e.preventDefault();
	clearErrors();
	statusEl.textContent = '';

	const formData = new FormData(form);
	const firstName = formData.get('firstName')?.toString().trim();
	const lastName = formData.get('lastName')?.toString().trim();
	const email = formData.get('email')?.toString().trim();
	const phone = formData.get('phone')?.toString().trim();
	const description = formData.get('description')?.toString().trim();

	let hasError = false;
	if (!firstName) { setError('firstName', 'First name is required'); hasError = true; }
	if (!lastName) { setError('lastName', 'Last name is required'); hasError = true; }
	if (!email) { setError('email', 'Email is required'); hasError = true; }
	else if (!isValidEmail(email)) { setError('email', 'Please enter a valid email'); hasError = true; }
	if (phone && !isValidPhone(phone)) { setError('phone', 'Invalid phone number'); hasError = true; }

	if (hasError) return;

	try {
		const res = await fetch('/api/register', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ firstName, lastName, email, phone, description })
		});
		if (!res.ok) {
			const err = await res.json().catch(() => ({ error: 'Request failed' }));
			statusEl.textContent = err.error || 'Something went wrong';
			return;
		}
		statusEl.textContent = 'Registration successful!';
		form.reset();
		await loadRegistrations();
	} catch (err) {
		statusEl.textContent = 'Network error';
	}
});

loadRegistrations();


