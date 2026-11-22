const SVG_CHARTS = {
  trianguloRectangulo: `<svg width="240" height="140" viewBox="0 0 240 140"><polygon points="40,115 190,115 40,25" fill="#EFF6FF" stroke="#0F2942" stroke-width="2.5"/><rect x="40" y="100" width="15" height="15" fill="none" stroke="#B48327" stroke-width="2"/><text x="15" y="75" font-size="13" fill="#0F2942" font-weight="bold">h = 6</text><text x="105" y="133" font-size="13" fill="#0F2942" font-weight="bold">b = 8</text><text x="125" y="62" font-size="13" fill="#B48327" font-weight="bold">c = ?</text></svg>`,
  funcionLineal: `<svg width="240" height="150" viewBox="0 0 240 150"><line x1="20" y1="120" x2="220" y2="120" stroke="#5C6B7A" stroke-width="1.5"/><line x1="50" y1="15" x2="50" y2="135" stroke="#5C6B7A" stroke-width="1.5"/><line x1="30" y1="130" x2="200" y2="25" stroke="#1E4E79" stroke-width="3"/><circle cx="50" cy="118" r="4" fill="#B48327"/><circle cx="147" cy="58" r="4" fill="#B48327"/><text x="58" y="114" font-size="11" fill="#0F2942">(0, 2)</text><text x="154" y="56" font-size="11" fill="#0F2942">(3, 8)</text></svg>`,
  circuloArea: `<svg width="200" height="140" viewBox="0 0 200 140"><circle cx="100" cy="70" r="50" fill="#F7EFE0" stroke="#0F2942" stroke-width="2.5"/><line x1="100" y1="70" x2="150" y2="70" stroke="#B48327" stroke-width="2.5"/><circle cx="100" cy="70" r="3" fill="#0F2942"/><text x="112" y="63" font-size="12" fill="#0F2942" font-weight="bold">r = 5 cm</text></svg>`
};

const OFFICIAL_TOPICS = [
  { id: "t1", nombre: "1. Razonamiento Numérico y Operaciones", area: "Matemática", icono: "🔢" },
  { id: "t2", nombre: "2. Sucesiones, Series y Patrones", area: "Razonamiento", icono: "📈" },
  { id: "t3", nombre: "3. Porcentajes, Razones y Proporciones", area: "Matemática", icono: "⚖️" },
  { id: "t4", nombre: "4. Ecuaciones e Inecuaciones", area: "Álgebra", icono: "🧮" },
  { id: "t5", nombre: "5. Funciones y Análisis Gráfico", area: "Álgebra", icono: "📊" },
  { id: "t6", nombre: "6. Geometría Plana, Áreas y Volúmenes", area: "Geometría", icono: "📐" },
  { id: "t7", nombre: "7. Estadística Descriptiva y Probabilidad", area: "Datos", icono: "🎲" },
  { id: "t8", nombre: "8. Razonamiento Lógico y Abstracto", area: "Lógica", icono: "🧩" },
  { id: "t9", nombre: "9. Comprensión Lectora y Razonamiento Verbal", area: "Lengua", icono: "📚" },
  { id: "t10", nombre: "10. Física Aplicada: Cinemática y Dinámica", area: "Ciencias", icono: "⚡" },
  { id: "t11", nombre: "11. Química General y Estequiometría", area: "Ciencias", icono: "🧪" }
];

const BASE_QUESTIONS = [
  { topicId: "t1", nivel: "Básico", enunciado: "Si 4 cuadernos cuestan $10, ¿cuánto costarán 14 cuadernos del mismo valor?", opciones: ["$32", "$35", "$38", "$40"], correcta: 1, explicacion: "Cada cuaderno cuesta 10 / 4 = $2.50. Por 14 cuadernos: 14 × 2.50 = $35." },
  { topicId: "t1", nivel: "Medio", enunciado: "Un tanque se llena con una llave en 6 horas y con otra en 3 horas. Si se abren ambas juntas, ¿en cuántas horas se llena?", opciones: ["1.5 horas", "2 horas", "4.5 horas", "9 horas"], correcta: 1, explicacion: "1/6 + 1/3 = 3/6 = 1/2 del tanque por hora; por lo tanto tarda 2 horas." },
  { topicId: "t2", nivel: "Básico", enunciado: "Determina el siguiente término en la sucesión: 3, 7, 13, 21, 31, ...", opciones: ["39", "41", "43", "45"], correcta: 2, explicacion: "Las diferencias crecen de 2 en 2: +4, +6, +8, +10, luego +12 → 31 + 12 = 43." },
  { topicId: "t2", nivel: "Difícil", enunciado: "Halla el término que continúa: 2, 6, 18, 54, ...", opciones: ["108", "148", "162", "216"], correcta: 2, explicacion: "Progresión geométrica de razón r = 3: 54 × 3 = 162." },
  { topicId: "t3", nivel: "Básico", enunciado: "Un artículo de $120 tiene un descuento del 25%. ¿Cuál es el precio final a pagar?", opciones: ["$85", "$90", "$95", "$100"], correcta: 1, explicacion: "El 25% de 120 es 30. Precio final: 120 - 30 = $90." },
  { topicId: "t3", nivel: "Medio", enunciado: "En un aula hay 24 mujeres y 16 hombres. ¿Qué porcentaje del total son hombres?", opciones: ["35%", "40%", "45%", "60%"], correcta: 1, explicacion: "Total = 40 estudiantes. Hombres: (16 / 40) × 100 = 40%." },
  { topicId: "t4", nivel: "Básico", enunciado: "Resuelve para x: 3(x - 4) + 2 = 2x + 5", opciones: ["x = 11", "x = 13", "x = 15", "x = 17"], correcta: 2, explicacion: "3x - 12 + 2 = 2x + 5 → 3x - 10 = 2x + 5 → x = 15." },
  { topicId: "t4", nivel: "Difícil", enunciado: "La suma de tres números pares consecutivos es 78. ¿Cuál es el número mayor?", opciones: ["24", "26", "28", "30"], correcta: 2, explicacion: "x + (x+2) + (x+4) = 78 → 3x + 6 = 78 → x = 24. El mayor es 24 + 4 = 28." },
  { topicId: "t5", nivel: "Medio", enunciado: "Observa la recta que pasa por (0, 2) y (3, 8). ¿Cuál es su pendiente m?", svg: SVG_CHARTS.funcionLineal, opciones: ["m = 1", "m = 2", "m = 3", "m = 6"], correcta: 1, explicacion: "m = (8 - 2) / (3 - 0) = 6 / 3 = 2." },
  { topicId: "t6", nivel: "Básico", enunciado: "Calcula la hipotenusa c del triángulo rectángulo mostrado:", svg: SVG_CHARTS.trianguloRectangulo, opciones: ["9", "10", "12", "14"], correcta: 1, explicacion: "Por Pitágoras: c = √(6² + 8²) = √(36 + 64) = √100 = 10." },
  { topicId: "t6", nivel: "Medio", enunciado: "Calcula el área exacta del círculo de radio r = 5 cm:", svg: SVG_CHARTS.circuloArea, opciones: ["10π cm²", "20π cm²", "25π cm²", "50π cm²"], correcta: 2, explicacion: "Área = π · r² = π · 5² = 25π cm²." },
  { topicId: "t7", nivel: "Básico", enunciado: "Al lanzar un dado normal de 6 caras, ¿cuál es la probabilidad de obtener un número primo?", opciones: ["1/6", "1/3", "1/2", "2/3"], correcta: 2, explicacion: "Los primos en un dado son {2, 3, 5}: 3 casos favorables de 6 = 3/6 = 1/2." },
  { topicId: "t8", nivel: "Medio", enunciado: "Si todos los ingenieros son analíticos y Carlos es ingeniero, se concluye necesariamente que:", opciones: ["Carlos es analítico", "Todos los analíticos son ingenieros", "Carlos no estudia", "Ninguna es correcta"], correcta: 0, explicacion: "Por silogismo categórico universal afirmativo (Modus Ponens), Carlos pertenece al conjunto de los analíticos." },
  { topicId: "t9", nivel: "Básico", enunciado: "Selecciona el sinónimo contextual más preciso de 'EFÍMERO':", opciones: ["Eterno", "Fugaz", "Sólido", "Extenso"], correcta: 1, explicacion: "Efímero significa aquello que tiene una duración muy breve o pasajera (fugaz)." },
  { topicId: "t10", nivel: "Medio", enunciado: "Un móvil parte del reposo con aceleración constante de 4 m/s². ¿Qué velocidad alcanza a los 5 segundos?", opciones: ["9 m/s", "15 m/s", "20 m/s", "25 m/s"], correcta: 2, explicacion: "vf = v0 + a·t = 0 + 4 × 5 = 20 m/s." },
  { topicId: "t11", nivel: "Básico", enunciado: "¿Cuál es la masa molar aproximada del agua (H₂O) si H = 1 g/mol y O = 16 g/mol?", opciones: ["16 g/mol", "17 g/mol", "18 g/mol", "20 g/mol"], correcta: 2, explicacion: "M(H₂O) = 2(1) + 16 = 18 g/mol." }
];

// Generador que garantiza preguntas suficientes por tema y para el Desafío Final de 70 preguntas
function obtenerPreguntasParaEvaluacion(topicId, nivelFiltro, cantidad) {
  let pool = BASE_QUESTIONS.filter((q) => {
    const okTema = topicId === "ALL" || q.topicId === topicId;
    const okNivel = !nivelFiltro || nivelFiltro === "Todos" || q.nivel === nivelFiltro;
    return okTema && okNivel;
  });

  if (pool.length === 0) {
    pool = BASE_QUESTIONS.filter((q) => topicId === "ALL" || q.topicId === topicId);
  }

  const resultado = [];
  let idx = 0;
  while (resultado.length < cantidad) {
    const base = pool[idx % pool.length];
    resultado.push({
      ...base,
      uid: `${base.topicId}-${idx}-${Math.random().toString(36).slice(2, 6)}`
    });
    idx++;
  }
  return resultado;
}
