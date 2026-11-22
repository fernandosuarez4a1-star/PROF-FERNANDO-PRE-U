const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzqvMWE9AVkSwpV3M_3rgQC-ygRCM6Hdavy7BFamRRraJGGsYUIS5yLbN5StShUhae8cA/exec";

window.SheetsSync = {
  url: GOOGLE_SCRIPT_URL,
  ultimaSincronizacion: null,

  // 1. Registrar estudiante en Google Sheets
  async registrarEstudiante(datosEstudiante) {
    try {
      const respuesta = await fetch(this.url, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          accion: "registrar_estudiante",
          datos: {
            id: datosEstudiante.id || datosEstudiante.cedula || datosEstudiante.nombre,
            cedula: datosEstudiante.cedula || datosEstudiante.id || "",
            nombre: datosEstudiante.nombre || "",
            contacto: datosEstudiante.contacto || "",
            curso: datosEstudiante.curso || "PRE-U Oficial"
          }
        })
      });
      const json = await respuesta.json();
      await this.sincronizarTodo();
      return json;
    } catch (error) {
      console.warn("Sin conexión temporal al registrar en Sheets:", error);
      return { ok: false, error: error.toString() };
    }
  },

  // 2. Guardar puntaje y certificado en Google Sheets
  async guardarResultado(datosResultado) {
    try {
      const respuesta = await fetch(this.url, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          accion: "guardar_resultado",
          datos: {
            id: datosResultado.id || datosResultado.cedula || "",
            cedula: datosResultado.cedula || datosResultado.id || "",
            nombre: datosResultado.nombre || "",
            evaluacion: datosResultado.evaluacion || "Simulador PRE-U",
            puntaje: datosResultado.puntaje || 0,
            aciertos: datosResultado.aciertos || 0,
            total: datosResultado.total || 0,
            certificado: datosResultado.certificado || "N/A"
          }
        })
      });
      const json = await respuesta.json();
      await this.sincronizarTodo();
      return json;
    } catch (error) {
      console.warn("Sin conexión temporal al guardar resultado en Sheets:", error);
      return { ok: false, error: error.toString() };
    }
  },

  // 3. Descargar todos los estudiantes y resultados desde Google Sheets
  async sincronizarTodo() {
    try {
      const respuesta = await fetch(this.url + "?t=" + Date.now());
      const data = await respuesta.json();
      if (data && data.ok) {
        const estudiantesNormalizados = (data.estudiantes || []).map((est) => ({
          fechaRegistro: est["Fecha Registro"] || "",
          id: String(est["ID_Cedula"] || est["Nombre"] || "").trim(),
          nombre: String(est["Nombre"] || "").trim(),
          contacto: String(est["Contacto"] || "").trim(),
          curso: String(est["Curso"] || "PRE-U Oficial").trim(),
          estado: String(est["Estado"] || "Inscrito").trim()
        }));

        const resultadosNormalizados = (data.resultados || []).map((res) => ({
          fecha: res["Fecha"] || "",
          id: String(res["ID_Cedula"] || "").trim(),
          nombre: String(res["Nombre"] || "").trim(),
          evaluacion: String(res["Evaluacion"] || "Simulador").trim(),
          puntaje: Number(res["Puntaje"] || 0),
          aciertos: Number(res["Aciertos"] || 0),
          total: Number(res["Total"] || 0),
          certificado: String(res["Codigo_Certificado"] || "N/A").trim()
        }));

        localStorage.setItem("preu_cloud_estudiantes", JSON.stringify(estudiantesNormalizados));
        localStorage.setItem("preu_cloud_resultados", JSON.stringify(resultadosNormalizados));
        this.ultimaSincronizacion = new Date().toLocaleTimeString("es-EC");

        if (typeof window.onSheetsDataUpdated === "function") {
          window.onSheetsDataUpdated({
            estudiantes: estudiantesNormalizados,
            resultados: resultadosNormalizados
          });
        }

        return { ok: true, estudiantes: estudiantesNormalizados, resultados: resultadosNormalizados };
      }
      return { ok: false, estudiantes: [], resultados: [] };
    } catch (error) {
      console.warn("Error leyendo desde Google Sheets:", error);
      return { ok: false, estudiantes: [], resultados: [] };
    }
  }
};
