let dbProfesores;

document.addEventListener("DOMContentLoaded", () => {
  const abrirBtn = document.getElementById("abrirModalProfesor");
  const cerrarBtn = document.getElementById("cerrarModalProfesor");
  const modal = document.getElementById("modalProfesor");
  const form = document.getElementById("formProfesor");
  const lista = document.getElementById("listaProfesores");
  const tituloModal = document.getElementById("tituloModal");

  let editandoId = null;

  // IndexedDB
  const request = indexedDB.open("profesoresDB", 1);

  request.onerror = () => console.error("No se pudo abrir IndexedDB");
  request.onsuccess = (e) => {
    dbProfesores = e.target.result;
    mostrarProfesores();
  };

  request.onupgradeneeded = (e) => {
    dbProfesores = e.target.result;
    if (!dbProfesores.objectStoreNames.contains("profesores")) {
      dbProfesores.createObjectStore("profesores", { keyPath: "id", autoIncrement: true });
    }
  };

  // Abrir modal
  abrirBtn.addEventListener("click", () => {
    modal.style.display = "flex";
    form.reset();
    editandoId = null;
    tituloModal.textContent = "Nuevo Profesor";
  });

  cerrarBtn.addEventListener("click", () => (modal.style.display = "none"));
  window.addEventListener("click", (e) => { if (e.target === modal) modal.style.display = "none"; });

  // Guardar profesor
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());

    const tx = dbProfesores.transaction("profesores", "readwrite");
    const store = tx.objectStore("profesores");

    if (editandoId !== null) {
      data.id = editandoId;
      store.put(data);
    } else {
      store.add(data);
    }

    tx.oncomplete = () => {
      modal.style.display = "none";
      form.reset();
      mostrarProfesores();
    };
  });

  // Mostrar profesores
  function mostrarProfesores() {
    const tx = dbProfesores.transaction("profesores", "readonly");
    const store = tx.objectStore("profesores");
    const req = store.getAll();

    req.onsuccess = () => {
      lista.innerHTML = "";
      req.result.forEach(p => {
        const div = document.createElement("div");
        div.classList.add("profesor-card");
        div.innerHTML = `
          <h4>${p.nombre} ${p.apellido}</h4>
          <p><strong>Materia:</strong> ${p.materia}</p>
          ${p.telefono ? `<p><strong>Tel:</strong> ${p.telefono}</p>` : ""}
          ${p.correo ? `<p><strong>Email:</strong> ${p.correo}</p>` : ""}
          <div class="acciones">
            <button class="editar">Editar</button>
            <button class="eliminar">Eliminar</button>
          </div>
        `;
        const btnEditar = div.querySelector(".editar");
        const btnEliminar = div.querySelector(".eliminar");

        btnEditar.addEventListener("click", () => {
          editandoId = p.id;
          form.nombre.value = p.nombre;
          form.apellido.value = p.apellido;
          form.materia.value = p.materia;
          form.telefono.value = p.telefono || "";
          form.correo.value = p.correo || "";
          tituloModal.textContent = "Editar Profesor";
          modal.style.display = "flex";
        });

        btnEliminar.addEventListener("click", () => {
          const confirmacion = confirm(`¿Eliminar al profesor ${p.nombre} ${p.apellido}?`);
          if (confirmacion) {
            const tx = dbProfesores.transaction("profesores", "readwrite");
            const store = tx.objectStore("profesores");
            store.delete(p.id);
            tx.oncomplete = mostrarProfesores;
          }
        });

        lista.appendChild(div);
      });
    };
  }
});
