const App = {
  usuarioActual: null,
  rolActual: "estudiante",
  evaluacionActiva: null,
  indicePregunta: 0,
  respuestasUsuario: {},
  timerInterval: null,
  segundosRestantes: 0,
  ultimoResultado: null,

  async init() {
    this.registrarServiceWorker();
    this.restaurarSesionLocal();

    window.onSheetsDataUpdated = (datos) => {
      this.actualizarIndicadorNube(true);
      this.actualizarEstadisticasPortada(datos.estudiantes);
      this.renderComunidadPortada(datos.estudiantes);
      if (this.usuarioActual && this.rolActual === "estudiante") {
        this.renderHistorialEstudiante();
      }
      if (this.rolActual === "docente") {
        this.renderPanelDocente();
      }
    };

    await this.forzarSincronizacion();

    // Sincronización periódica automática cada 15 segundos entre todos los dispositivos
    setInterval(() => {
      if (navigator.onLine) {
        SheetsSync.sincronizarTodo();
      }
    }, 15000);
  },

  registrarServiceWorker() {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    }
  },

  actualizarIndicadorNube(conectado) {
    const pill = document.getElementById("sync-status");
    if (!pill) return;
    if (conectado) {
      pill.className = "sync-pill sync-ok";
      pill.textContent = `Nube Conectada (${SheetsSync.ultimaSincronizacion || "Al día"})`;
    } else {
      pill.className = "sync-pill sync-offline";
      pill.textContent = "Modo Offline (Respaldo Local)";
    }
  },

  async forzarSincronizacion() {
    const res = await SheetsSync.sincronizarTodo();
    this.actualizarIndicadorNube(res.ok);
    const est = this.obtenerEstudiantesNube();
    this.actualizarEstadisticasPortada(est);
    this.renderComunidadPortada(est);
    if (this.rolActual === "docente") this.renderPanelDocente();
    if (this.usuarioActual && this.rolActual === "estudiante") this.renderHistorialEstudiante();
  },

  obtenerEstudiantesNube() {
    try {
      return JSON.parse(localStorage.getItem("preu_cloud_estudiantes") || "[]");
    } catch {
      return [];
    }
  },

  obtenerResultadosNube() {
    try {
      return JSON.parse(localStorage.getItem("preu_cloud_resultados") || "[]");
    } catch {
      return [];
    }
  },

  cambiarTabRol(rol) {
    document.getElementById("tab-estudiante").classList.toggle("active", rol === "estudiante");
    document.getElementById("tab-docente").classList.toggle("active", rol === "docente");
    document.getElementById("form-estudiante").classList.toggle("hidden", rol !== "estudiante");
    document.getElementById("form-docente").classList.toggle("hidden", rol !== "docente");
  },

  irAVista(idVista) {
    document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
    const target = document.getElementById(idVista);
    if (target) target.classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  },

  restaurarSesionLocal() {
    const guardado = localStorage.getItem("preu_sesion_activa");
    if (guardado) {
      this.usuarioActual = JSON.parse(guardado);
      this.rolActual = "estudiante";
      this.activarBarraUsuario(this.usuarioActual.nombre);
    }
  },

  activarBarraUsuario(etiqueta) {
    const pill = document.getElementById("header-user-pill");
    const btnSalir = document.getElementById("btn-salir");
    pill.textContent = etiqueta;
    pill.classList.remove("hidden");
    btnSalir.classList.remove("hidden");
  },

  cerrarSesion() {
    clearInterval(this.timerInterval);
    this.usuarioActual = null;
    this.rolActual = "estudiante";
    localStorage.removeItem("preu_sesion_activa");
    document.getElementById("header-user-pill").classList.add("hidden");
    document.getElementById("btn-salir").classList.add("hidden");
    this.irAVista("vista-portada");
  },

  async procesarIngresoEstudiante(e) {
    e.preventDefault();
    const btn = document.getElementById("btn-submit-estudiante");
    btn.disabled = true;
    btn.textContent = "Sincronizando con Google Sheets...";

    const cedula = document.getElementById("est-cedula").value.trim();
    const nombre = document.getElementById("est-nombre").value.trim();
    const contacto = document.getElementById("est-contacto").value.trim();
    const curso = document.getElementById("est-curso").value;

    const estudiante = { id: cedula, cedula, nombre, contacto, curso };
    this.usuarioActual = estudiante;
    this.rolActual = "estudiante";
    localStorage.setItem("preu_sesion_activa", JSON.stringify(estudiante));

    // Enviar inscripción a Google Sheets para reflejarse en todos los teléfonos
    await SheetsSync.registrarEstudiante(estudiante);

    btn.disabled = false;
    btn.textContent = "Ingresar y Sincronizar";

    this.activarBarraUsuario(`${nombre} (${cedula})`);
    document.getElementById("bienvenida-estudiante").textContent = `Bienvenido/a, ${nombre}`;
    document.getElementById("subtitulo-estudiante").textContent = `ID: ${cedula} • ${curso}`;
    this.renderTemas();
    this.renderHistorialEstudiante();
    this.irAVista("vista-estudiante");
  },

  async procesarIngresoDocente(e) {
    e.preventDefault();
    const clave = document.getElementById("doc-clave").value.trim();
    if (clave !== "PROFE2026" && clave !== "1234") {
      alert("Clave docente incorrecta. Usa PROFE2026.");
      return;
    }
    this.rolActual = "docente";
    this.usuarioActual = { nombre: "Docente Profe Fernando" };
    this.activarBarraUsuario("Docente Administrador");
    await this.forzarSincronizacion();
    this.renderPanelDocente();
    this.irAVista("vista-docente");
  },

  actualizarEstadisticasPortada(estudiantes) {
    const el = document.getElementById("stat-total-inscritos");
    if (el) el.textContent = estudiantes.length;
  },

  renderComunidadPortada(estudiantes) {
    const cont = document.getElementById("lista-comunidad-portada");
    if (!cont) return;
    if (!estudiantes.length) {
      cont.innerHTML = `<p class="text-muted">Aún no hay estudiantes registrados en la nube. ¡Sé el primero en inscribirte!</p>`;
      return;
    }
    cont.innerHTML = estudiantes
      .slice()
      .reverse()
      .map(
        (est) => `
        <div class="student-chip">
          <span class="dot"></span>
          <strong>${this.escaparHTML(est.nombre)}</strong>
          <span class="text-muted">• ${this.escaparHTML(est.curso || "PRE-U")}</span>
        </div>`
      )
      .join("");
  },

  renderTemas() {
    const grid = document.getElementById("grid-temas");
    const nivel = document.getElementById("filtro-dificultad").value;
    grid.innerHTML = OFFICIAL_TOPICS.map(
      (t) => `
      <div class="topic-card">
        <div>
          <span class="tag-gold">${t.icono} ${t.area}</span>
          <h4>${t.nombre}</h4>
          <p class="topic-meta">10 preguntas • Nivel: ${nivel} • Calificación /1000</p>
        </div>
        <button class="btn btn-primary btn-sm" onclick="App.iniciarPracticaTema('${t.id}', '${t.nombre}')">Practicar Tema</button>
      </div>`
    ).join("");
  },

  iniciarPracticaTema(topicId, nombreTema) {
    const nivel = document.getElementById("filtro-dificultad").value;
    const preguntas = obtenerPreguntasParaEvaluacion(topicId, nivel, 10);
    this.arrancarSimulador(`Práctica: ${nombreTema}`, preguntas, 15 * 60);
  },

  iniciarDesafioFinal() {
    const preguntas = obtenerPreguntasParaEvaluacion("ALL", "Todos", 70);
    this.arrancarSimulador("Desafío Final Oficial PRE-U (70 Preguntas)", preguntas, 90 * 60);
  },

  arrancarSimulador(titulo, preguntas, segundos) {
    this.evaluacionActiva = { titulo, preguntas };
    this.indicePregunta = 0;
    this.respuestasUsuario = {};
    this.segundosRestantes = segundos;

    document.getElementById("sim-titulo").textContent = titulo;
    document.getElementById("sim-badge").textContent = preguntas.length === 70 ? "EXAMEN OFICIAL" : "PRÁCTICA TEMÁTICA";
    this.renderPreguntaActual();
    this.iniciarTemporizador();
    this.irAVista("vista-simulador");
  },

  iniciarTemporizador() {
    clearInterval(this.timerInterval);
    const actualizar = () => {
      const min = String(Math.floor(this.segundosRestantes / 60)).padStart(2, "0");
      const seg = String(this.segundosRestantes % 60).padStart(2, "0");
      document.getElementById("sim-timer").textContent = `${min}:${seg}`;
      if (this.segundosRestantes <= 0) {
        clearInterval(this.timerInterval);
        this.finalizarSimulador();
      }
      this.segundosRestantes--;
    };
    actualizar();
    this.timerInterval = setInterval(actualizar, 1000);
  },

  renderPreguntaActual() {
    const { preguntas } = this.evaluacionActiva;
    const q = preguntas[this.indicePregunta];
    const total = preguntas.length;

    document.getElementById("q-numero").textContent = `Pregunta ${this.indicePregunta + 1} de ${total}`;
    document.getElementById("q-nivel").textContent = `Nivel ${q.nivel}`;
    document.getElementById("q-enunciado").textContent = q.enunciado;

    const svgCont = document.getElementById("q-svg-container");
    if (q.svg) {
      svgCont.innerHTML = q.svg;
      svgCont.classList.remove("hidden");
    } else {
      svgCont.innerHTML = "";
      svgCont.classList.add("hidden");
    }

    const letras = ["A", "B", "C", "D"];
    const elegida = this.respuestasUsuario[this.indicePregunta];
    document.getElementById("q-opciones").innerHTML = q.opciones
      .map(
        (op, i) => `
        <button class="option-btn ${elegida === i ? "selected" : ""}" onclick="App.seleccionarOpcion(${i})">
          <strong>${letras[i]})</strong> ${this.escaparHTML(op)}
        </button>`
      )
      .join("");

    const progreso = ((this.indicePregunta + 1) / total) * 100;
    document.getElementById("sim-progress-fill").style.width = `${progreso}%`;

    document.getElementById("btn-prev").disabled = this.indicePregunta === 0;
    const esUltima = this.indicePregunta === total - 1;
    document.getElementById("btn-next").classList.toggle("hidden", esUltima);
    document.getElementById("btn-finalizar").classList.toggle("hidden", !esUltima);

    this.renderPaleta();
  },

  seleccionarOpcion(indiceOpcion) {
    this.respuestasUsuario[this.indicePregunta] = indiceOpcion;
    this.renderPreguntaActual();
  },

  preguntaAnterior() {
    if (this.indicePregunta > 0) {
      this.indicePregunta--;
      this.renderPreguntaActual();
    }
  },

  preguntaSiguiente() {
    if (this.indicePregunta < this.evaluacionActiva.preguntas.length - 1) {
      this.indicePregunta++;
      this.renderPreguntaActual();
    }
  },

  irAPregunta(idx) {
    this.indicePregunta = idx;
    this.renderPreguntaActual();
  },

  renderPaleta() {
    const total = this.evaluacionActiva.preguntas.length;
    const pal = document.getElementById("sim-palette");
    let html = "";
    for (let i = 0; i < total; i++) {
      const respondida = this.respuestasUsuario[i] !== undefined ? "answered" : "";
      const actual = i === this.indicePregunta ? "current" : "";
      html += `<button class="pal-btn ${respondida} ${actual}" onclick="App.irAPregunta(${i})">${i + 1}</button>`;
    }
    pal.innerHTML = html;
  },

  async finalizarSimulador() {
    clearInterval(this.timerInterval);
    const { titulo, preguntas } = this.evaluacionActiva;
    let aciertos = 0;

    preguntas.forEach((q, idx) => {
      if (this.respuestasUsuario[idx] === q.correcta) aciertos++;
    });

    const total = preguntas.length;
    const puntaje = Math.round((aciertos / total) * 1000);
    const aprobado = puntaje >= 700;
    const codigoCert = aprobado
      ? `PREU-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`
      : "No alcanza mínimo (700 pts)";

    this.ultimoResultado = {
      id: this.usuarioActual?.id || "INVITADO",
      cedula: this.usuarioActual?.cedula || "INVITADO",
      nombre: this.usuarioActual?.nombre || "Estudiante",
      evaluacion: titulo,
      puntaje,
      aciertos,
      total,
      certificado: codigoCert,
      fecha: new Date().toLocaleDateString("es-EC")
    };

    // Guardar puntaje y certificado automáticamente en Google Sheets
    await SheetsSync.guardarResultado(this.ultimoResultado);

    document.getElementById("res-titulo").textContent = titulo;
    document.getElementById("res-detalle-estudiante").textContent = `${this.ultimoResultado.nombre} • ${aciertos} aciertos de ${total} preguntas`;
    document.getElementById("res-puntaje").textContent = puntaje;
    document.getElementById("btn-ver-certificado").classList.toggle("hidden", !aprobado);

    const letras = ["A", "B", "C", "D"];
    document.getElementById("lista-revision").innerHTML = preguntas
      .map((q, idx) => {
        const resp = this.respuestasUsuario[idx];
        const esCorrecta = resp === q.correcta;
        const textoUsuario = resp !== undefined ? `${letras[resp]}) ${q.opciones[resp]}` : "Sin responder";
        const textoCorrecta = `${letras[q.correcta]}) ${q.opciones[q.correcta]}`;
        return `
          <div class="review-item">
            <p><strong>${idx + 1}. ${this.escaparHTML(q.enunciado)}</strong></p>
            <p class="${esCorrecta ? "badge-ok" : "badge-bad"}">
              Tu respuesta: ${this.escaparHTML(textoUsuario)} ${esCorrecta ? "✔" : `✘ (Correcta: ${this.escaparHTML(textoCorrecta)})`}
            </p>
            <div class="explanation-box"><strong>Explicación:</strong> ${this.escaparHTML(q.explicacion)}</div>
          </div>`;
      })
      .join("");

    this.irAVista("vista-resultados");
  },

  abrirCertificadoActual() {
    if (!this.ultimoResultado) return;
    document.getElementById("cert-nombre").textContent = this.ultimoResultado.nombre.toUpperCase();
    document.getElementById("cert-cedula").textContent = `C.I. / ID: ${this.ultimoResultado.id}`;
    document.getElementById("cert-evaluacion").textContent = this.ultimoResultado.evaluacion;
    document.getElementById("cert-puntaje").textContent = `${this.ultimoResultado.puntaje} / 1000 puntos`;
    document.getElementById("cert-codigo").textContent = this.ultimoResultado.certificado;
    document.getElementById("cert-fecha").textContent = this.ultimoResultado.fecha;
    this.irAVista("vista-certificado");
  },

  renderHistorialEstudiante() {
    const cont = document.getElementById("historial-estudiante");
    if (!cont || !this.usuarioActual) return;
    const todos = this.obtenerResultadosNube();
    const mios = todos.filter(
      (r) =>
        r.id.toLowerCase() === this.usuarioActual.id.toLowerCase() ||
        r.nombre.toLowerCase() === this.usuarioActual.nombre.toLowerCase()
    );

    if (!mios.length) {
      cont.innerHTML = `<p class="text-muted">Aún no registras evaluaciones en la nube.</p>`;
      return;
    }

    cont.innerHTML = mios
      .slice()
      .reverse()
      .map(
        (r) => `
        <div class="history-item">
          <strong>${this.escaparHTML(r.evaluacion)}</strong><br/>
          <span>Puntaje: <strong>${r.puntaje}/1000</strong> (${r.aciertos}/${r.total})</span><br/>
          <small class="text-muted">${this.escaparHTML(r.fecha)} • Cert: ${this.escaparHTML(r.certificado)}</small>
        </div>`
      )
      .join("");
  },

  renderPanelDocente() {
    const estudiantes = this.obtenerEstudiantesNube();
    const resultados = this.obtenerResultadosNube();
    const filtro = (document.getElementById("doc-buscar")?.value || "").toLowerCase();

    document.getElementById("doc-total-est").textContent = estudiantes.length;
    document.getElementById("doc-total-res").textContent = resultados.length;

    const promedio = resultados.length
      ? Math.round(resultados.reduce((acc, r) => acc + Number(r.puntaje || 0), 0) / resultados.length)
      : 0;
    document.getElementById("doc-promedio").textContent = `${promedio} pts`;

    const certs = resultados.filter((r) => r.certificado && r.certificado.startsWith("PREU-")).length;
    document.getElementById("doc-certificados").textContent = certs;

    const estFiltrados = estudiantes.filter(
      (e) => e.nombre.toLowerCase().includes(filtro) || e.id.toLowerCase().includes(filtro)
    );

    document.getElementById("tabla-docente-estudiantes").innerHTML = estFiltrados.length
      ? estFiltrados
          .slice()
          .reverse()
          .map(
            (e) => `
          <tr>
            <td>${this.escaparHTML(e.fechaRegistro)}</td>
            <td><strong>${this.escaparHTML(e.id)}</strong></td>
            <td>${this.escaparHTML(e.nombre)}</td>
            <td>${this.escaparHTML(e.contacto || "-")}</td>
            <td>${this.escaparHTML(e.curso)}</td>
            <td><span class="tag-gold">${this.escaparHTML(e.estado)}</span></td>
          </tr>`
          )
          .join("")
      : `<tr><td colspan="6" class="text-muted">No hay estudiantes inscritos que coincidan.</td></tr>`;

    document.getElementById("tabla-docente-resultados").innerHTML = resultados.length
      ? resultados
          .slice()
          .reverse()
          .map(
            (r) => `
          <tr>
            <td>${this.escaparHTML(r.fecha)}</td>
            <td><strong>${this.escaparHTML(r.nombre)}</strong> (${this.escaparHTML(r.id)})</td>
            <td>${this.escaparHTML(r.evaluacion)}</td>
            <td>${r.aciertos}/${r.total}</td>
            <td><strong>${r.puntaje} / 1000</strong></td>
            <td>${this.escaparHTML(r.certificado)}</td>
          </tr>`
          )
          .join("")
      : `<tr><td colspan="6" class="text-muted">Aún no hay evaluaciones registradas en Google Sheets.</td></tr>`;
  },

  exportarJSON() {
    const respaldo = {
      exportadoEl: new Date().toISOString(),
      estudiantes: this.obtenerEstudiantesNube(),
      resultados: this.obtenerResultadosNube()
    };
    const blob = new Blob([JSON.stringify(respaldo, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `respaldo-preu-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  escaparHTML(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
};

document.addEventListener("DOMContentLoaded", () => App.init());
