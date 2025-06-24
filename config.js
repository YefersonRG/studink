document.addEventListener("DOMContentLoaded", () => {
    aplicarConfiguraciones();
  
    const selectTema = document.getElementById("modo-tema");
    const selectIdioma = document.getElementById("idioma-select");
    const btnBorrar = document.getElementById("btn-borrar-datos");
  
    if (selectTema) {
      selectTema.value = localStorage.getItem("tema") || "light";
      selectTema.onchange = () => {
        localStorage.setItem("tema", selectTema.value);
        aplicarTema();
      };
    }
  
    if (selectIdioma) {
      selectIdioma.value = localStorage.getItem("idioma") || "es";
      selectIdioma.onchange = () => {
        localStorage.setItem("idioma", selectIdioma.value);
        aplicarIdioma();
      };
    }
  
    if (btnBorrar) {
      btnBorrar.onclick = () => {
        mostrarConfirmacion(() => {
          indexedDB.deleteDatabase("notasDB");
          localStorage.clear();
          alert("✅ Todos los datos han sido eliminados.");
          location.reload();
        });
      };
    }
  });
  
  function aplicarConfiguraciones() {
    aplicarTema();
    aplicarIdioma();
  }
  
  function aplicarTema() {
    const tema = localStorage.getItem("tema") || "light";
    document.body.classList.toggle("modo-oscuro", tema === "dark");
  }
  
  function aplicarIdioma() {
    const idioma = localStorage.getItem("idioma") || "es";
  
    const textos = {
      es: {
        "titulo-app": "Studink",
        "titulo-config": "⚙️ Configuración",
        "descripcion-config": "Personaliza la aplicación según tus preferencias.",
        "label-tema": "🌗 Tema de la app",
        "label-idioma": "🌍 Idioma",
        "btn-borrar-datos": "Borrar todo",
        "titulo-index": "📅 Agenda",
        "descripcion-index": "Organiza tus eventos importantes, exámenes o entregas.",
        "titulo-horario": "📚 Mi Horario Semanal",
        "descripcion-horario": "Haz clic en cualquier celda para escribir una materia.",
        "titulo-notas": "📘 Control de Notas",
        "descripcion-notas": "Registra materias y lleva el seguimiento de tus evaluaciones.",
        "titulo-profesores": "👨‍🏫 Profesores",
        "descripcion-profesores": "Registra aquí a tus docentes y las materias que enseñan.",
        "menu-agenda": "Agenda",
        "menu-horario": "Horario",
        "menu-notas": "Notas",
        "menu-config": "Config",
        "btn-agregar-evento": "Agregar",
        "label-filtro-importancia": "Filtrar por importancia:",
        "opt-todas": "Todas",
        "opt-normal": "Normal",
        "opt-medio": "Medio",
        "opt-importante": "Importante",
        "opt-super": "Súper importante",
        "titulo-modal-agenda": "Nuevo Evento",
        "opt-select-importancia": "Seleccionar importancia",
        "opt-modal-normal": "Normal",
        "opt-modal-medio": "Medio",
        "opt-modal-importante": "Importante",
        "opt-modal-super": "Súper importante",
        "btn-guardar-evento": "Guardar",
        "titulo-horario": "📚 Mi Horario Semanal",
        "descripcion-horario": "Haz clic en cualquier celda para escribir una materia.",
        "th-hora": "Hora",
        "th-lunes": "Lunes",
        "th-martes": "Martes",
        "th-miercoles": "Miércoles",
        "th-jueves": "Jueves",
        "th-viernes": "Viernes",
        "titulo-notas": "📘 Control de Notas",
        "descripcion-notas": "Registra materias y lleva el seguimiento de tus evaluaciones.",
        "btn-nueva-materia": "Nueva Materia",
        "titulo-modal-materia": "Nueva Materia",
        "btn-guardar-materia": "Guardar",
        "titulo-modal-nota": "Nueva Evaluación",
        "btn-guardar-nota": "Guardar",
        
      },
      en: {
        "titulo-app": "Studink",
        "titulo-config": "⚙️ Settings",
        "descripcion-config": "Customize the app to your preferences.",
        "label-tema": "🌗 App Theme",
        "label-idioma": "🌍 Language",
        "btn-borrar-datos": "Delete all",
        "titulo-index": "📅 Schedule",
        "descripcion-index": "Organize important events, exams or deadlines.",
        "titulo-horario": "📚 Weekly Schedule",
        "descripcion-horario": "Click on any cell to write a subject.",
        "titulo-notas": "📘 Grade Tracker",
        "descripcion-notas": "Track your grades and evaluations.",
        "titulo-profesores": "👨‍🏫 Professors",
        "descripcion-profesores": "Register your professors and their subjects.",
        "menu-agenda": "Schedule",
        "menu-horario": "Timetable",
        "menu-notas": "Grades",
        "menu-config": "Settings",
        "btn-agregar-evento": "Add",
        "label-filtro-importancia": "Filter by importance:",
        "opt-todas": "All",
        "opt-normal": "Normal",
        "opt-medio": "Medium",
        "opt-importante": "Important",
        "opt-super": "Super Important",
        "titulo-modal-agenda": "New Event",
        "opt-select-importancia": "Select importance",
        "opt-modal-normal": "Normal",
        "opt-modal-medio": "Medium",
        "opt-modal-importante": "Important",
        "opt-modal-super": "Super Important",
        "btn-guardar-evento": "Save",
        "titulo-horario": "📚 Weekly Schedule",
        "descripcion-horario": "Click on any cell to write a subject.",
        "th-hora": "Time",
        "th-lunes": "Monday",
        "th-martes": "Tuesday",
        "th-miercoles": "Wednesday",
        "th-jueves": "Thursday",
        "th-viernes": "Friday",
        "titulo-notas": "📘 Grade Tracker",
        "descripcion-notas": "Track your subjects and evaluations.",
        "btn-nueva-materia": "New Subject",
        "titulo-modal-materia": "New Subject",
        "btn-guardar-materia": "Save",
        "titulo-modal-nota": "New Evaluation",
        "btn-guardar-nota": "Save",
        
      }
    };
  
    const trad = textos[idioma];
    for (const id in trad) {
      const el = document.getElementById(id);
      if (el) el.textContent = trad[id];
    }
  }
  
  function mostrarConfirmacion(callbackAceptar) {
    const confirmar = document.createElement("div");
    confirmar.style.position = "fixed";
    confirmar.style.top = 0;
    confirmar.style.left = 0;
    confirmar.style.right = 0;
    confirmar.style.bottom = 0;
    confirmar.style.background = "rgba(0,0,0,0.6)";
    confirmar.style.display = "flex";
    confirmar.style.alignItems = "center";
    confirmar.style.justifyContent = "center";
    confirmar.style.zIndex = 2000;
  
    confirmar.innerHTML = `
      <div style="background:#fff; padding:2rem; border-radius:12px; max-width:90%; width:320px; text-align:center; box-shadow:0 4px 20px rgba(0,0,0,0.2)">
        <h3>¿Borrar todos los datos?</h3>
        <p>Esta acción eliminará toda tu información guardada. ¿Deseas continuar?</p>
        <div style="margin-top:1rem; display:flex; gap:1rem; justify-content:center;">
          <button id="confirmar-si" style="padding:0.6rem 1rem; background:#ff5252; color:#fff; border:none; border-radius:6px; cursor:pointer;">Sí</button>
          <button id="confirmar-no" style="padding:0.6rem 1rem; background:#ccc; border:none; border-radius:6px; cursor:pointer;">No</button>
        </div>
      </div>
    `;
  
    document.body.appendChild(confirmar);
  
    document.getElementById("confirmar-si").onclick = () => {
      document.body.removeChild(confirmar);
      callbackAceptar();
    };
  
    document.getElementById("confirmar-no").onclick = () => {
      document.body.removeChild(confirmar);
    };
  }
  