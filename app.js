/* Made For More interactions. Configure FORM_ENDPOINT below after creating your Formspree form. */
const FORM_ENDPOINT = "https://formspree.io/f/mjygneno";

const menuButton = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Open navigation menu' : 'Close navigation menu');
  navLinks.classList.toggle('open', !isOpen);
});
navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation menu');
  navLinks.classList.remove('open');
}));

const projectGrid = document.querySelector('#project-grid');
const modal = document.querySelector('#project-modal');
let projects = [];

function renderProjects(category = 'All') {
  const visibleProjects = category === 'All' ? projects : projects.filter(project => project.category === category);
  if (!visibleProjects.length) {
    projectGrid.innerHTML = '<p class="empty-projects">No projects in this category yet. Check back soon.</p>';
    return;
  }
  projectGrid.innerHTML = visibleProjects.map((project, index) => `
    <article class="project-card" tabindex="0" role="button" aria-label="View ${escapeHtml(project.title)} project details" data-project-id="${escapeHtml(project.id)}" style="animation-delay:${index * 60}ms">
      <div class="project-image"><img src="${escapeHtml(project.image)}" alt="${escapeHtml(project.alt || project.title)}" loading="lazy"><span class="category-pill">${escapeHtml(project.category)}</span></div>
      <div class="project-info"><div class="project-meta"><h3>${escapeHtml(project.title)}</h3><span aria-hidden="true">↗</span></div><p>${escapeHtml(project.shortDescription || project.description)}</p></div>
    </article>`).join('');
  projectGrid.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', () => openProject(card.dataset.projectId));
    card.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openProject(card.dataset.projectId); }
    });
  });
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

function openProject(id) {
  const project = projects.find(item => item.id === id);
  if (!project) return;
  document.querySelector('#modal-category').textContent = project.category.toUpperCase() + ' PROJECT';
  document.querySelector('#modal-title').textContent = project.title;
  document.querySelector('#modal-description').textContent = project.description;
  const media = document.querySelector('#modal-media');
  if (project.video) {
    media.innerHTML = `<video controls playsinline preload="metadata" poster="${escapeHtml(project.image)}"><source src="${escapeHtml(project.video)}">Your browser does not support video playback.</video>`;
  } else {
    media.innerHTML = `<img src="${escapeHtml(project.image)}" alt="${escapeHtml(project.alt || project.title)}">`;
  }
  const link = document.querySelector('#modal-link');
  link.href = project.link || '#';
  link.hidden = !project.link || project.link === '#';
  modal.showModal();
}

document.querySelector('.modal-close').addEventListener('click', () => modal.close());
modal.addEventListener('click', event => { if (event.target === modal) modal.close(); });
modal.addEventListener('close', () => { document.querySelector('#modal-media').replaceChildren(); });
document.querySelectorAll('.filter-button').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.filter-button').forEach(item => {
    const active = item === button;
    item.classList.toggle('active', active);
    item.setAttribute('aria-pressed', String(active));
  });
  renderProjects(button.dataset.filter);
}));

fetch('projects.json')
  .then(response => { if (!response.ok) throw new Error('Could not load projects'); return response.json(); })
  .then(data => { projects = Array.isArray(data) ? data : []; renderProjects(); })
  .catch(() => { projectGrid.innerHTML = '<p class="empty-projects">Projects could not be loaded. Please refresh the page.</p>'; });

const form = document.querySelector('#contact-form');
const status = document.querySelector('#form-status');
const submitButton = form.querySelector('.submit-button');
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function setFieldError(input, message = '') {
  const field = input.closest('.field');
  if (!field) return;
  field.classList.toggle('invalid', Boolean(message));
  const error = field.querySelector('.field-error');
  if (error) error.textContent = message;
  if (message) input.setAttribute('aria-invalid', 'true');
  else input.removeAttribute('aria-invalid');
}

function validateForm() {
  let valid = true;
  const name = form.elements.name;
  const email = form.elements.email;
  const service = form.elements.service;
  const details = form.elements.details;
  const checks = [
    [name, name.value.trim() ? '' : 'Please enter your name.'],
    [email, !email.value.trim() ? 'Please enter your email address.' : (!emailPattern.test(email.value.trim()) ? 'Enter a valid email address.' : '')],
    [service, service.value ? '' : 'Please choose a service.'],
    [details, details.value.trim() ? '' : 'Please tell us a little about your project.']
  ];
  checks.forEach(([input, error]) => { setFieldError(input, error); if (error) valid = false; });
  return valid;
}

form.querySelectorAll('input,select,textarea').forEach(input => input.addEventListener('input', () => {
  if (input.closest('.field')?.classList.contains('invalid')) validateForm();
}));

form.addEventListener('submit', async event => {
  event.preventDefault();
  status.textContent = '';
  status.classList.remove('error');
  if (form.elements._gotcha.value) return; // Honeypot: silently discard bot submissions.
  if (!validateForm()) {
    form.querySelector('[aria-invalid="true"]')?.focus();
    status.textContent = 'Please check the highlighted fields and try again.';
    status.classList.add('error');
    return;
  }
  if (FORM_ENDPOINT.includes('REPLACE_WITH_YOUR_FORM_ID')) {
    status.textContent = 'The form is ready, but email delivery needs setup. Please email madeformore555@gmail.com directly for now.';
    status.classList.add('error');
    return;
  }
  submitButton.disabled = true;
  submitButton.classList.add('is-loading');
  submitButton.querySelector('.submit-label').textContent = 'Sending';
  try {
    const response = await fetch(FORM_ENDPOINT, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' }
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.errors?.map(error => error.message).join(' ') || 'We could not send your message. Please try again or email us directly.');
    }
    form.reset();
    status.textContent = "Thanks! We'll get back to you soon.";
    form.querySelectorAll('.field').forEach(field => field.classList.remove('invalid'));
    form.querySelectorAll('[aria-invalid]').forEach(input => input.removeAttribute('aria-invalid'));
    form.querySelectorAll('.field-error').forEach(error => error.textContent = '');
  } catch (error) {
    status.textContent = error.message || 'Something went wrong. Please try again.';
    status.classList.add('error');
  } finally {
    submitButton.disabled = false;
    submitButton.classList.remove('is-loading');
    submitButton.querySelector('.submit-label').textContent = 'Send your enquiry';
  }
});

document.querySelector('#year').textContent = new Date().getFullYear();

// Gentle reveal effects. Content remains visible when reduced motion is enabled or JS observers are unavailable.
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
  }), { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(item => observer.observe(item));
} else {
  document.querySelectorAll('.reveal').forEach(item => item.classList.add('visible'));
}
