// ===== PERSONALIZA AQUÍ LOS DATOS DEL EVENTO =====
const CONFIG = {
  nombres: "Alirio Rangel Ochoa y Everlith Araujo Guethe",
  fechaISO: "2026-11-13T16:00:00-05:00",
  horaTexto: "4:00 p. m.",
  lugar: "Hacienda Los Sueños",
  direccion: "Dirección de ejemplo · Valledupar, Cesar",
  mapa: "https://maps.google.com/?q=Valledupar%2C+Cesar%2C+Colombia",
  // Cambia este número por el WhatsApp de quien recibirá las confirmaciones.
  whatsappConfirmaciones: "573001234567",
  // Pega aquí el enlace público cuando publiques (GitHub Pages, Netlify...).
  // Si lo dejas vacío se usa la dirección que esté abierta en el navegador.
  urlPublica: ""
};

const FECHA_LARGA = "viernes 13 de noviembre de 2026";
const params = new URLSearchParams(location.search);
const invitado = (params.get("invitado") || "").trim().slice(0, 60);

// Enlace limpio de la invitación (sin nombre de invitado ni modo admin)
function enlaceBase() {
  const url = new URL(CONFIG.urlPublica || location.href);
  url.search = "";
  url.hash = "";
  return url.toString();
}

function toast(texto) {
  let el = document.getElementById("toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    el.setAttribute("role", "status");
    document.body.appendChild(el);
  }
  el.textContent = texto;
  el.classList.add("visible");
  clearTimeout(toast.t);
  toast.t = setTimeout(() => el.classList.remove("visible"), 2600);
}

const envelope = document.getElementById("envelope");
const stage = document.getElementById("envelopeStage");
const tapHint = document.getElementById("tapHint");
const belowContent = document.getElementById("belowContent");

document.getElementById("eventTimeText").textContent = `Hora: ${CONFIG.horaTexto}`;
document.getElementById("venueText").textContent = `Lugar: ${CONFIG.lugar}`;
document.getElementById("addressText").textContent = CONFIG.direccion;
document.getElementById("mapButton").href = CONFIG.mapa;

document.getElementById("guestText").textContent = invitado ? `Para ${invitado}` : "";

const message = invitado
  ? `Hola, soy ${invitado}. Confirmo mi asistencia al matrimonio de ${CONFIG.nombres}, el ${FECHA_LARGA}.`
  : `Hola, confirmo mi asistencia al matrimonio de ${CONFIG.nombres}, el ${FECHA_LARGA}. Mi nombre es: `;
const rsvpUrl = `https://wa.me/${CONFIG.whatsappConfirmaciones}?text=${encodeURIComponent(message)}`;
document.getElementById("rsvpButton").href = rsvpUrl;
document.getElementById("rsvpButtonBottom").href = rsvpUrl;

function openEnvelope() {
  const isOpen = envelope.classList.toggle("opened");
  envelope.setAttribute("aria-expanded", String(isOpen));
  stage.classList.toggle("opened-stage", isOpen);
  tapHint.textContent = isOpen
    ? "Desliza hacia abajo para ver todos los detalles"
    : "Toca el sobre para abrir tu invitación";
  if (isOpen) {
    belowContent.classList.remove("hidden");
    // Desplaza suavemente hacia la tarjeta y el contenido en pantallas pequeñas.
    setTimeout(() => {
      stage.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 350);
  } else {
    belowContent.classList.add("hidden");
  }
}
envelope.addEventListener("click", openEnvelope);
envelope.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    openEnvelope();
  }
});

// Cuenta regresiva: hora local de Colombia (UTC-05:00).
function updateCountdown() {
  const target = new Date(CONFIG.fechaISO).getTime();
  const diff = target - Date.now();
  const values = diff <= 0
    ? [0, 0, 0, 0]
    : [
        Math.floor(diff / 86400000),
        Math.floor((diff % 86400000) / 3600000),
        Math.floor((diff % 3600000) / 60000),
        Math.floor((diff % 60000) / 1000)
      ];
  ["days", "hours", "minutes", "seconds"].forEach((id, i) => {
    document.getElementById(id).textContent = String(values[i]).padStart(2, "0");
  });
}
updateCountdown();
setInterval(updateCountdown, 1000);

// La música solo se inicia después de que la persona pulse el botón.
const music = document.getElementById("weddingMusic");
const musicButton = document.getElementById("musicButton");
musicButton.addEventListener("click", async () => {
  if (music.paused) {
    try {
      await music.play();
      musicButton.setAttribute("aria-pressed", "true");
      musicButton.innerHTML = '♫ <span>Pausar música</span>';
    } catch {
      alert("Agrega tu archivo MP3 en assets/musica.mp3 y vuelve a intentarlo.");
    }
  } else {
    music.pause();
    musicButton.setAttribute("aria-pressed", "false");
    musicButton.innerHTML = '♫ <span>Activar música</span>';
  }
});

// ===== COMPARTIR POR WHATSAPP =====
function textoCompartir(nombre) {
  const enlace = nombre ? `${enlaceBase()}?invitado=${encodeURIComponent(nombre)}` : enlaceBase();
  return `💍 ${nombre ? nombre + ", e" : "E"}stás invitado al matrimonio de Alirio y Everlith.\n` +
         `📅 ${FECHA_LARGA}\n\n` +
         `Abre tu invitación aquí:\n${enlace}`;
}

document.getElementById("shareButton").addEventListener("click", async () => {
  const texto = textoCompartir("");
  const esMovil = /Android|iPhone|iPad/i.test(navigator.userAgent);
  if (navigator.share && esMovil) {
    try { await navigator.share({ title: document.title, text: texto }); return; }
    catch (e) { if (e.name === "AbortError") return; }
  }
  window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, "_blank", "noopener");
});

// ===== PANEL DE LOS NOVIOS: abre la página con ?admin=1 =====
if (params.get("admin") === "1") {
  document.getElementById("adminPanel").classList.remove("hidden");
}
document.getElementById("adminSend").addEventListener("click", () => {
  const nombre = document.getElementById("adminName").value.trim();
  if (!nombre) return toast("Escribe el nombre del invitado");
  let tel = document.getElementById("adminPhone").value.replace(/\D/g, "");
  if (tel.length === 10 && tel.startsWith("3")) tel = "57" + tel;   // celular colombiano
  const destino = tel ? `https://wa.me/${tel}` : "https://wa.me/";
  window.open(`${destino}?text=${encodeURIComponent(textoCompartir(nombre))}`, "_blank", "noopener");
  document.getElementById("adminName").value = "";
  document.getElementById("adminPhone").value = "";
  document.getElementById("adminName").focus();
});
