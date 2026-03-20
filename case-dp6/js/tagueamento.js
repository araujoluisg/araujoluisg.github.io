gtag('config', 'G-096NHNN8Q2', {
  send_page_view: true
});

//clicks menu - geral
document.addEventListener('click', function (event) {
  const contato = event.target.closest('.menu-lista-contato');
  const download = event.target.closest('.menu-lista-download');

  if (contato) {
    gtag('event', 'click', {
      page_location: window.location.href,
      element_name: 'entre_em_contato',
      element_group: 'menu'
    });
  }

  if (download) {
    gtag('event', 'file_download', {
      page_location: window.location.href,
      element_name: 'download_pdf',
      element_group: 'menu'
    });
  }
});

//clicks cards - analise
document.addEventListener('click', function (event) {
  if (!window.location.pathname.includes('analise.html')) return;

  const card = event.target.closest('.card-montadoras');

  if (card) {
    const nome = card.dataset.name;

    gtag('event', 'click', {
      page_location: window.location.href,
      element_name: nome.toLowerCase(),
      element_group: 'ver_mais'
    });
  }
});

//form start - sobre
document.addEventListener('focusout', function (event) {
  if (!window.location.pathname.includes('sobre.html')) return;

  const field = event.target;
  const form = field.closest('form');

  if (!form || form.dataset.started) return;

  if (!field.value || field.value.trim() === '') return;

  form.dataset.started = 'true';

  gtag('event', 'form_start', {
    page_location: window.location.href,
    form_id: form.id || 'sem_id',
    form_name: form.name || 'sem_nome',
    form_destination: form.action || 'sem_destino'
  });
});

//form submit - sobre
document.addEventListener('submit', function (event) {
  const form = event.target;

  const button = form.querySelector('button[type="submit"]');

  gtag('event', 'form_submit', {
    page_location: window.location.href,
    form_id: form.id || 'sem_id',
    form_name: form.name || 'sem_nome',
    form_destination: form.action || 'sem_destino',
    form_submit_text: button ? button.innerText.trim().toLowerCase() : 'sem_texto'
  });
});

//view_form_success - sobre
jQuery('.contato').on('submit', function (e) {
  var form = e.target;

  setTimeout(function () {
    gtag('event', 'view_form_success', {
      page_location: window.location.href,
      form_id: form.id || 'sem_id',
      form_name: form.name || 'sem_nome',
    });
  }, 2200); 
});