let db;

document.addEventListener("DOMContentLoaded", () => {
  const request = indexedDB.open("horarioDB", 1);

  request.onerror = () => console.error("Error al abrir la base de datos");
  request.onsuccess = (e) => {
    db = e.target.result;
    cargarHorario();
  };

  request.onupgradeneeded = (e) => {
    db = e.target.result;
    if (!db.objectStoreNames.contains("horario")) {
      db.createObjectStore("horario", { keyPath: "clave" }); // clave = `${dia}-${hora}`
    }
  };

  document.querySelectorAll('#tablaHorario td[contenteditable="true"]').forEach(celda => {
    celda.addEventListener("input", () => {
      const dia = celda.getAttribute("data-dia");
      const hora = celda.getAttribute("data-hora");
      const clave = `${dia}-${hora}`;
      const valor = celda.innerText.trim();

      const tx = db.transaction("horario", "readwrite");
      const store = tx.objectStore("horario");
      store.put({ clave, dia, hora, valor });
    });
  });
});

function cargarHorario() {
  const tx = db.transaction("horario", "readonly");
  const store = tx.objectStore("horario");
  const request = store.getAll();

  request.onsuccess = () => {
    request.result.forEach(item => {
      const celda = document.querySelector(`td[data-dia="${item.dia}"][data-hora="${item.hora}"]`);
      if (celda) celda.innerText = item.valor;
    });
  };
}
