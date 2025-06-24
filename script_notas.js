let dbNotas;
let materiaSeleccionadaId = null;

document.addEventListener("DOMContentLoaded", () => {
  const modalMateria = document.getElementById("modalMateria");
  const modalNota = document.getElementById("modalNota");
  const formMateria = document.getElementById("formMateria");
  const formNota = document.getElementById("formNota");
  const lista = document.getElementById("listaMaterias");

  // Abrir la base de datos
  const request = indexedDB.open("notasDB", 2);

  request.onupgradeneeded = (e) => {
    dbNotas = e.target.result;
    if (!dbNotas.objectStoreNames.contains("materias")) {
      const store = dbNotas.createObjectStore("materias", { keyPath: "id", autoIncrement: true });
      store.createIndex("nombre", "materia", { unique: false });
    }
  };

  request.onsuccess = (e) => {
    dbNotas = e.target.result;
    mostrarMaterias();
  };

  request.onerror = () => {
    console.error("Error al abrir la base de datos.");
  };

  // Abrir y cerrar modales
  document.getElementById("abrirModalMateria").onclick = () => {
    modalMateria.classList.add("mostrar");
    formMateria.reset();
    formMateria.dataset.id = "";
  };

  document.getElementById("cerrarModalMateria").onclick = () => cerrarModal(modalMateria);
  document.getElementById("cerrarModalNota").onclick = () => cerrarModal(modalNota);

  function cerrarModal(modal) {
    modal.classList.remove("mostrar");
  }

  // Guardar materia
  formMateria.onsubmit = (e) => {
    e.preventDefault();
    const datos = Object.fromEntries(new FormData(formMateria).entries());
    datos.evaluaciones = parseInt(datos.evaluaciones);
    datos.notas = [];

    const tx = dbNotas.transaction("materias", "readwrite");
    const store = tx.objectStore("materias");

    const idExistente = formMateria.dataset.id;

    if (idExistente) {
      datos.id = Number(idExistente);
      datos.notas = JSON.parse(formMateria.dataset.notas || "[]");
      store.put(datos);
    } else {
      store.add(datos);
    }

    tx.oncomplete = () => {
      cerrarModal(modalMateria);
      mostrarMaterias(); // <-- Asegura que se actualice la lista
    };
  };

  // Guardar nota
  formNota.onsubmit = (e) => {
    e.preventDefault();
    const nombre = formNota.nombre.value.trim();
    const valor = parseFloat(formNota.valor.value);
    const maximo = parseFloat(formNota.maximo.value);

    const tx = dbNotas.transaction("materias", "readwrite");
    const store = tx.objectStore("materias");
    const get = store.get(materiaSeleccionadaId);

    get.onsuccess = () => {
      const materia = get.result;
      if (materia.notas.length >= materia.evaluaciones) {
        alert("Ya se han ingresado todas las evaluaciones para esta materia.");
        cerrarModal(modalNota);
        return;
      }

      materia.notas.push({ nombre, valor, maximo });
      store.put(materia);
      cerrarModal(modalNota);
      mostrarMaterias();
    };
  };

  // Mostrar materias
  function mostrarMaterias() {
    if (!dbNotas) return;

    const tx = dbNotas.transaction("materias", "readonly");
    const store = tx.objectStore("materias");
    const getAll = store.getAll();

    getAll.onsuccess = () => {
      lista.innerHTML = "";

      getAll.result.forEach(materia => {
        const totalObtenido = materia.notas.reduce((a, n) => a + n.valor, 0);

        let promedioTexto = "Sin notas";
        if (materia.notas.length > 0) {
          if (materia.tipo === "puntos") {
            const promedio = totalObtenido / materia.evaluaciones;
            promedioTexto = `Promedio: ${promedio.toFixed(2)} pts`;
          } else if (materia.tipo === "porcentaje") {
            const porcentajes = materia.notas.map(n => (n.valor / n.maximo) * 100);
            const promedio = porcentajes.reduce((a, b) => a + b, 0) / materia.evaluaciones;
            promedioTexto = `Promedio: ${promedio.toFixed(2)} %`;
          }
        }

        const div = document.createElement("div");
        div.classList.add("materia-card");

        const listaNotas = materia.notas.length > 0
          ? materia.notas.map((n, index) =>
              `<div style="margin-top: 0.3rem;">
                <strong>${n.nombre}</strong>: ${n.valor} / ${n.maximo} ${
                  materia.tipo === "porcentaje" ? `(${((n.valor / n.maximo) * 100).toFixed(2)}%)` : "pts"
                }
                <button class="editar-nota" data-id="${materia.id}" data-index="${index}">✏️</button>
                <button class="eliminar-nota" data-id="${materia.id}" data-index="${index}">🗑️</button>
              </div>`
            ).join("")
          : "<p>No hay notas</p>";

        const botonAgregar = materia.notas.length >= materia.evaluaciones
          ? `<button class="agregar-nota" disabled style="opacity:0.5; cursor:not-allowed;">Agregar Nota</button>`
          : `<button class="agregar-nota">Agregar Nota</button>`;

        div.innerHTML = `
          <h4>${materia.materia}</h4>
          <p><strong>Tipo:</strong> ${materia.tipo}</p>
          <p><strong>Evaluaciones:</strong> ${materia.evaluaciones}</p>
          <p><strong>${promedioTexto}</strong></p>
          <div><strong>Notas:</strong></div>
          ${listaNotas}
          <div class="acciones">
            ${botonAgregar}
            <button class="editar-materia">Editar</button>
            <button class="eliminar-materia">Eliminar</button>
          </div>
        `;

        // Eventos
        div.querySelector(".agregar-nota")?.addEventListener("click", () => {
          materiaSeleccionadaId = materia.id;
          modalNota.classList.add("mostrar");
          formNota.reset();
        });

        div.querySelector(".editar-materia").onclick = () => {
          modalMateria.classList.add("mostrar");
          formMateria.materia.value = materia.materia;
          formMateria.evaluaciones.value = materia.evaluaciones;
          formMateria.tipo.value = materia.tipo;
          formMateria.dataset.id = materia.id;
          formMateria.dataset.notas = JSON.stringify(materia.notas);
        };

        div.querySelector(".eliminar-materia").onclick = () => {
          const tx = dbNotas.transaction("materias", "readwrite");
          const store = tx.objectStore("materias");
          store.delete(materia.id);
          tx.oncomplete = mostrarMaterias;
        };

        div.querySelectorAll(".editar-nota").forEach(btn => {
          btn.onclick = () => {
            const id = parseInt(btn.dataset.id);
            const index = parseInt(btn.dataset.index);
            const tx = dbNotas.transaction("materias", "readwrite");
            const store = tx.objectStore("materias");
            const get = store.get(id);

            get.onsuccess = () => {
              const materia = get.result;
              const nota = materia.notas[index];
              formNota.nombre.value = nota.nombre;
              formNota.maximo.value = nota.maximo;
              formNota.valor.value = nota.valor;

              modalNota.classList.add("mostrar");

              formNota.onsubmit = (e) => {
                e.preventDefault();
                nota.nombre = formNota.nombre.value.trim();
                nota.maximo = parseFloat(formNota.maximo.value);
                nota.valor = parseFloat(formNota.valor.value);
                store.put(materia);
                cerrarModal(modalNota);
                mostrarMaterias();
              };
            };
          };
        });

        div.querySelectorAll(".eliminar-nota").forEach(btn => {
          btn.onclick = () => {
            const id = parseInt(btn.dataset.id);
            const index = parseInt(btn.dataset.index);
            const tx = dbNotas.transaction("materias", "readwrite");
            const store = tx.objectStore("materias");
            const get = store.get(id);

            get.onsuccess = () => {
              const materia = get.result;
              materia.notas.splice(index, 1);
              store.put(materia);
              mostrarMaterias();
            };
          };
        });

        lista.appendChild(div);
      });
    };
  }
});
