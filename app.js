
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
    proxima: ["text","proxima"],
    reporte: ["text","reporte"],
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
