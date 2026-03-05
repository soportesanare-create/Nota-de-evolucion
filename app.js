
const ECOG = [
  { value: "", label: "Selecciona…" , desc: "" },
  { value: "0", label: "0 Asintomático, actividad normal", desc: "Asintomático, actividad normal" },
  { value: "1", label: "1 Sintomático, puede deambular", desc: "Sintomático, puede deambular" },
  { value: "2", label: "2 Encamado <50% día, asistencia mínima", desc: "Encamado <50% día, asistencia mínima" },
  { value: "3", label: "3 Encamado >50% día, asistencia notable", desc: "Encamado >50% día, asistencia notable" },
  { value: "4", label: "4 Encamado todo el día, gravemente limitado", desc: "Encamado todo el día, gravemente limitado" },
  { value: "5", label: "5 Fallecido", desc: "Fallecido" },
];

const STORAGE_KEY = "sanare_nota_v1";

function $(sel, root=document){ return root.querySelector(sel); }
function $all(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }

function loadState(){
  try{ return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); }
  catch(e){ return {}; }
}
function saveState(state){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function ensureStateShape(state){
  state.meta ??= {};
  state.text ??= {};
  state.ingreso ??= {};
  state.egreso ??= {};
  return state;
}

function bindTopFields(state){
  const map = {
    alergias: ["meta","alergias"],
    seguro: ["meta","seguro"],
    folio: ["meta","folio"],
    nombre: ["meta","nombre"],
    edad: ["meta","edad"],
    sexo: ["meta","sexo"],
    diagnostico: ["meta","diagnostico"],
    sintomas: ["text","sintomas"],
    hallazgos: ["text","hallazgos"],
    esquema: ["text","esquema"],
    intencion: ["text","intencion"],
    cicloDia: ["text","cicloDia"],
    proxima: ["text","proxima"],
    reporte: ["text","reporte"],
    realizo: ["text","realizo"],
  };

  Object.entries(map).forEach(([id, path])=>{
    const el = document.getElementById(id);
    if(!el) return;
    const [a,b] = path;
    el.value = state[a]?.[b] ?? "";
    el.addEventListener("input", ()=>{
      state[a] ??= {};
      state[a][b] = el.value;
      saveState(state);
    });
  });
}

function downloadWord(){
  // Genera un .doc (HTML compatible con Word) para edición.
  const v = (id)=> (document.getElementById(id)?.value ?? "").trim();
  const vit = (scope,key)=>{
    const el = document.querySelector(`[data-scope="${scope}"][data-key="${key}"]`);
    return (el?.value ?? "").trim();
  };

  const nombre = v("nombre") || "nota";
  const safeName = nombre.replace(/[^a-z0-9\-_ ]/gi, "").trim().replace(/\s+/g,"_") || "nota";
  const filename = `Nota_Evolucion_${safeName}.doc`;

  const html = `<!doctype html>
  <html><head><meta charset="utf-8">
  <title>Nota de evolución</title>
  <style>
    body{font-family:Arial,Helvetica,sans-serif; color:#111;}
    h1{margin:0 0 4px; font-size:18px;}
    .meta{margin:0 0 12px; font-size:12px; color:#444;}
    .box{border:1px solid #ddd; padding:10px; margin:10px 0; border-radius:8px;}
    .lbl{font-size:11px; letter-spacing:.08em; text-transform:uppercase; color:#666; margin-bottom:4px;}
    .row{display:flex; gap:10px; flex-wrap:wrap;}
    .col{flex:1; min-width:220px;}
    table{width:100%; border-collapse:collapse; font-size:12px;}
    th,td{border:1px solid #ddd; padding:6px; text-align:left; vertical-align:top;}
    th{background:#f5f5f5;}
    .muted{color:#666; font-size:11px;}
    .pre{white-space:pre-wrap;}
  </style></head>
  <body>
    <h1>Nota de evolución</h1>
    <div class="meta">Sanaré • Centro oncológico y alta especialidad</div>

    <div class="box">
      <div class="row">
        <div class="col"><div class="lbl">Alergias</div><div>${escapeHtml(v("alergias"))}</div></div>
        <div class="col"><div class="lbl">Seguro</div><div>${escapeHtml(v("seguro"))}</div></div>
        <div class="col"><div class="lbl">No. expediente</div><div>${escapeHtml(v("folio"))}</div></div>
      </div>
      <div style="height:10px"></div>
      <div class="row">
        <div class="col" style="flex:2"><div class="lbl">Nombre</div><div>${escapeHtml(v("nombre"))}</div></div>
        <div class="col"><div class="lbl">Edad</div><div>${escapeHtml(v("edad"))}</div></div>
        <div class="col"><div class="lbl">Sexo</div><div>${escapeHtml(v("sexo"))}</div></div>
      </div>
      <div style="height:10px"></div>
      <div><div class="lbl">Diagnóstico</div><div>${escapeHtml(v("diagnostico"))}</div></div>
    </div>

    <div class="box">
      <div class="lbl">Ingreso (signos vitales)</div>
      <table>
        <thead><tr>
          <th>Fecha</th><th>Hora</th><th>Peso</th><th>Talla</th><th>TA</th><th>FC</th><th>FR</th><th>SatO2</th><th>Temp</th><th>ECOG</th>
        </tr></thead>
        <tbody><tr>
          <td>${escapeHtml(vit("ingreso","fecha"))}</td>
          <td>${escapeHtml(vit("ingreso","hora"))}</td>
          <td>${escapeHtml(vit("ingreso","peso"))}</td>
          <td>${escapeHtml(vit("ingreso","talla"))}</td>
          <td>${escapeHtml(vit("ingreso","ta"))}</td>
          <td>${escapeHtml(vit("ingreso","fc"))}</td>
          <td>${escapeHtml(vit("ingreso","fr"))}</td>
          <td>${escapeHtml(vit("ingreso","sato2"))}</td>
          <td>${escapeHtml(vit("ingreso","temp"))}</td>
          <td>${escapeHtml(vit("ingreso","ecog"))}</td>
        </tr></tbody>
      </table>
      <div style="height:10px"></div>
      <div class="lbl">Egreso (signos vitales)</div>
      <table>
        <thead><tr>
          <th>Fecha</th><th>Hora</th><th>Peso</th><th>Talla</th><th>TA</th><th>FC</th><th>FR</th><th>SatO2</th><th>Temp</th><th>ECOG</th>
        </tr></thead>
        <tbody><tr>
          <td>${escapeHtml(vit("egreso","fecha"))}</td>
          <td>${escapeHtml(vit("egreso","hora"))}</td>
          <td>${escapeHtml(vit("egreso","peso"))}</td>
          <td>${escapeHtml(vit("egreso","talla"))}</td>
          <td>${escapeHtml(vit("egreso","ta"))}</td>
          <td>${escapeHtml(vit("egreso","fc"))}</td>
          <td>${escapeHtml(vit("egreso","fr"))}</td>
          <td>${escapeHtml(vit("egreso","sato2"))}</td>
          <td>${escapeHtml(vit("egreso","temp"))}</td>
          <td>${escapeHtml(vit("egreso","ecog"))}</td>
        </tr></tbody>
      </table>
      <div class="muted" style="margin-top:6px">Nota: ECOG se exporta como el valor seleccionado (0-5).</div>
    </div>

    <div class="box">
      <div class="row">
        <div class="col"><div class="lbl">Síntomas al interrogatorio dirigido</div><div class="pre">${escapeHtml(v("sintomas"))}</div></div>
        <div class="col"><div class="lbl">Hallazgos de la exploración física</div><div class="pre">${escapeHtml(v("hallazgos"))}</div></div>
      </div>
    </div>

    <div class="box">
      <div class="row">
        <div class="col"><div class="lbl">Esquema de tratamiento</div><div>${escapeHtml(v("esquema"))}</div></div>
        <div class="col"><div class="lbl">Próxima cita</div><div>${escapeHtml(v("proxima"))}</div></div>
      </div>
      <div style="height:10px"></div>
      <div class="row">
        <div class="col"><div class="lbl">Intención</div><div>${escapeHtml(v("intencion"))}</div></div>
        <div class="col"><div class="lbl">Ciclo / Día</div><div>${escapeHtml(v("cicloDia"))}</div></div>
      </div>
    </div>

    <div class="box">
      <div class="lbl">Reporte / Notas</div>
      <div class="pre">${escapeHtml(v("reporte"))}</div>
      <div style="height:10px"></div>
      <div class="lbl">Quién realizó</div>
      <div>${escapeHtml(v("realizo"))}</div>
    </div>
    <div class="muted" style="margin-top:14px;">Dra. Karen Elizabeth Gómez Rodríguez<br/>Dr. Efraín Camarín Sánchez</div>
  </body></html>`;

  const blob = new Blob([html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(()=>URL.revokeObjectURL(url), 1500);
}

function escapeHtml(str){
  return String(str ?? "")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/\"/g,"&quot;")
    .replace(/'/g,"&#039;");
}

function populateEcogSelects(){
  $all(".ecogSelect").forEach(sel=>{
    sel.innerHTML = "";
    ECOG.forEach(item=>{
      const opt = document.createElement("option");
      opt.value = item.value;
      // Opciones: solo número (la explicación se muestra en popover)
      opt.textContent = item.value === "" ? item.label : item.label;
      sel.appendChild(opt);
    });
  });
}



function renderEcogPopover(scope, value){
  const pop = document.getElementById(`ecogPopover_${scope}`);
  if(!pop) return;
  const v = String(value ?? "");
  const items = ECOG.filter(x=>x.value!=="");
  const rows = items.map(it=>{
    const active = it.value===v ? "active" : "";
    return `<li class="ecogItem ${active}"><div class="n">${it.value}</div><div class="d">${it.desc}</div></li>`;
  }).join("");
  pop.innerHTML = `<div class="ttl">ECOG:</div><ul class="ecogList">${rows}</ul>`;
}

function showEcogPopover(scope){
  const pop = document.getElementById(`ecogPopover_${scope}`);
  if(!pop) return;
  pop.classList.add("show");
  pop.setAttribute("aria-hidden","false");
}

function hideEcogPopover(scope){
  const pop = document.getElementById(`ecogPopover_${scope}`);
  if(!pop) return;
  pop.classList.remove("show");
  pop.setAttribute("aria-hidden","true");
}

function bindVitals(state){
  $all("input[data-scope], select[data-scope]").forEach(el=>{
    const scope = el.dataset.scope;
    const key = el.dataset.key;
    el.value = state[scope]?.[key] ?? "";
    if(el.tagName === "SELECT" && key === "ecog"){
    }
    el.addEventListener("input", ()=>{
      state[scope] ??= {};
      state[scope][key] = el.value;
      saveState(state);
      if(el.tagName === "SELECT" && key === "ecog"){
        }
    });
    el.addEventListener("change", ()=>{
      state[scope] ??= {};
      state[scope][key] = el.value;
      saveState(state);
      if(el.tagName === "SELECT" && key === "ecog"){
        }
    });
  });
}

function bindActions(){
  $("#btnPrint").addEventListener("click", ()=>window.print());
  const wordBtn = $("#btnWord");
  if(wordBtn){
    wordBtn.addEventListener("click", downloadWord);
  }
  $("#btnReset").addEventListener("click", ()=>{
    if(!confirm("¿Seguro que deseas limpiar todos los datos guardados en este navegador?")) return;
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  });
}

(function init(){
  let state = ensureStateShape(loadState());
  populateEcogSelects();
  bindTopFields(state);
  bindVitals(state);
  bindActions();

  // ECOG popovers (se actualizan al seleccionar)
  renderEcogPopover("ingreso", state.ingreso.ecog ?? "");
  renderEcogPopover("egreso", state.egreso.ecog ?? "");
})();


document.addEventListener("click", (e)=>{
  const t = e.target;
  // si haces click dentro del wrapper, no ocultes
  if(t && (t.closest && t.closest(".ecogWrap"))) return;
  hideEcogPopover("ingreso");
  hideEcogPopover("egreso");
});


/* ===== Impresión: ajustar escala para 1 hoja ===== */
(function setupPrintScale(){
  const probe = () => document.getElementById("mmProbe");
  const wrapSel = () => document.querySelector(".printWrap");
  function computeAndApplyScale(){
    const p = probe();
    const w = wrapSel();
    if(!p || !w) return;
    // A4 en px según el navegador (usa mm reales)
    const pageW = p.offsetWidth;
    const pageH = p.offsetHeight;

    // Oculta botones en print; pero en pantalla no afecta.
    const contentW = w.scrollWidth;
    const contentH = w.scrollHeight;

    // Deja un poquito de “aire” para que no corte por 1-2px
    const safety = 0.985;

    const sW = pageW / Math.max(1, contentW);
    const sH = pageH / Math.max(1, contentH);
    let s = Math.min(1, sW, sH) * safety;

    // Límite inferior razonable (evita que se haga ilegible)
    s = Math.max(0.55, Math.min(1, s));

    document.documentElement.style.setProperty("--print-scale", s.toFixed(3));
  }

  window.addEventListener("beforeprint", computeAndApplyScale);
  window.addEventListener("afterprint", () => {
    document.documentElement.style.removeProperty("--print-scale");
  });

  // En algunos Chrome, beforeprint no dispara con "Guardar como PDF" hasta que ya abrió el diálogo.
  // Esto ayuda a que quede listo si el usuario presiona imprimir dos veces.
  document.addEventListener("click", (e) => {
    const btn = e.target && (e.target.id === "btnPrint" || e.target.closest?.("#btnPrint"));
    if(btn) computeAndApplyScale();
  });
})();
