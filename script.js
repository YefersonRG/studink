let db;

document.addEventListener("DOMContentLoaded", function () {
  const abrir = document.getElementById('abrirModalAgenda');
  const cerrar = document.getElementById('cerrarModalAgenda');
  const modal = document.getElementById('modalAgenda');
  const eventForm = document.getElementById('eventForm');
  const eventosContainer = document.getElementById('eventos');
  const filtro = document.getElementById('filtroImportancia');

  // Abrir modal
  abrir.addEventListener('click', () => modal.style.display = 'block');
  cerrar.addEventListener('click', () => modal.style.display = 'none');
  window.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

  // Inicializar IndexedDB
  const request = indexedDB.open('agendaDB', 1);

  request.onerror = () => console.error('Error al abrir IndexedDB');
  request.onsuccess = (e) => {
    db = e.target.result;
    mostrarEventos();
  };

  request.onupgradeneeded = (e) => {
    db = e.target.result;
    if (!db.objectStoreNames.contains('eventos')) {
      const store = db.createObjectStore('eventos', { keyPath: 'id', autoIncrement: true });
    }
  };

  // Guardar evento
  eventForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(eventForm).entries());
    data.fecha = new Date(data.fecha).toISOString();
    const tx = db.transaction('eventos', 'readwrite');
    const store = tx.objectStore('eventos');
    store.add(data);
    tx.oncomplete = () => {
      modal.style.display = 'none';
      eventForm.reset();
      mostrarEventos();
    };
  });

  // Mostrar eventos
  function mostrarEventos() {
    const tx = db.transaction('eventos', 'readonly');
    const store = tx.objectStore('eventos');
    const req = store.getAll();

    req.onsuccess = () => {
      const eventos = req.result;
      const filtroVal = filtro.value;
      eventosContainer.innerHTML = '';

      eventos
        .filter(e => filtroVal === 'todas' || e.importancia === filtroVal)
        .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
        .forEach(ev => {
          const div = document.createElement('div');
          div.classList.add('evento');
          div.innerHTML = `
            <h3>${ev.titulo}</h3>
            <p>${new Date(ev.fecha).toLocaleDateString()}</p>
            <p>${ev.descripcion}</p>
            <p><strong>${ev.importancia}</strong></p>
            <button onclick="editarEvento(${ev.id})">Editar</button>
            <button onclick="eliminarEvento(${ev.id})">Eliminar</button>
          `;
          eventosContainer.appendChild(div);
        });
    };
  }

  // Filtro
  filtro.addEventListener('change', mostrarEventos);

  // Funciones globales
  window.eliminarEvento = function(id) {
    const tx = db.transaction('eventos', 'readwrite');
    const store = tx.objectStore('eventos');
    store.delete(id);
    tx.oncomplete = mostrarEventos;
  };

  window.editarEvento = function(id) {
    const tx = db.transaction('eventos', 'readonly');
    const store = tx.objectStore('eventos');
    const req = store.get(id);

    req.onsuccess = () => {
      const data = req.result;
      document.querySelector('[name="titulo"]').value = data.titulo;
      document.querySelector('[name="fecha"]').value = data.fecha.split('T')[0];
      document.querySelector('[name="descripcion"]').value = data.descripcion;
      document.querySelector('[name="importancia"]').value = data.importancia;
      modal.style.display = 'block';

      eventForm.onsubmit = function(e) {
        e.preventDefault();
        const updated = Object.fromEntries(new FormData(eventForm).entries());
        updated.fecha = new Date(updated.fecha).toISOString();
        updated.id = id;

        const tx2 = db.transaction('eventos', 'readwrite');
        const store2 = tx2.objectStore('eventos');
        store2.put(updated);
        tx2.oncomplete = () => {
          modal.style.display = 'none';
          eventForm.reset();
          mostrarEventos();
          eventForm.onsubmit = defaultGuardar;
        };
      };
    };
  };

  // Restaurar submit por defecto
  const defaultGuardar = eventForm.onsubmit;
});
