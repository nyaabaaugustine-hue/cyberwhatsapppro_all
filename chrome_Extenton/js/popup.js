// js/popup.js — Cyber WhatsApp Pro · License Gate  v5
// ─ Popup stays open on every open; NO auto-redirect anywhere.
// ─ "Open WhatsApp Pro Panel" opens propup.html in a new tab (popup stays visible).
// ─ Silent background re-verify syncs plan/expiry from server on every open.
// ─ Deactivate button always reachable via the ▾ toggle in the status card.
// ─ Clean status detail line — no stale expiry shown for lifetime/owner keys.
// ─ Migration: malformed legacy license objects are cleared on first load.

const LICENSE_API_URL = "https://cyberwhatsapp-back.vercel.app/api/verify-license";
const STORAGE_KEY     = "cwp_license";
const CHECK_ALARM     = "cwp_license_recheck";

// Owner / master keys — verified locally, never hit the server
const OWNER_KEYS = new Set([
  "5U6DE-SKO94-9127C-JRNBY",
  "FCUCS-6VM6S-UHD3B-EP7SB",
]);

// ── Storage helpers ────────────────────────────────────────────
async function storageGet(keys) {
  try { return await chrome.storage.local.get(keys); } catch (_) { return {}; }
}
async function storageSet(obj) {
  try { await chrome.storage.local.set(obj); } catch (_) {}
}
async function storageRemove(key) {
  try { await chrome.storage.local.remove(key); } catch (_) {}
}

// ── Key format ─────────────────────────────────────────────────
// Accepts XXXXX-XXXXX-XXXXX-XXXXX (standard) OR any X-X-X-X pattern
// with 2-10 chars per segment (covers owner/promo keys like CWP-PRO-2026-X8A91)
function isValidKeyFormat(key) {
  return /^[A-Z0-9]{2,10}-[A-Z0-9]{2,10}-[A-Z0-9]{2,10}-[A-Z0-9]{2,10}$/.test(key);
}

// ── Device ID ─────────────────────────────────────────────────
async function getDeviceId() {
  const r = await storageGet("cwp_device_id");
  if (r.cwp_device_id) return r.cwp_device_id;
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  const id = Array.from(arr).map(b => b.toString(16).padStart(2, "0")).join("");
  await storageSet({ cwp_device_id: id });
  return id;
}

// ── License storage ────────────────────────────────────────────
async function getLicense() {
  const r = await storageGet(STORAGE_KEY);
  const lic = r[STORAGE_KEY] || null;
  // Migration: old-format objects (no key / no premium flag) are discarded
  if (lic && (!lic.key || !lic.premium)) {
    await storageRemove(STORAGE_KEY);
    return null;
  }
  return lic;
}

async function isPremium() {
  const lic = await getLicense();
  if (!lic || !lic.premium) return false;
  if (lic.lifetime) return true;                              // lifetime → never expires
  if (lic.expiry && new Date(lic.expiry) < new Date()) {     // timed key past expiry
    await storageRemove(STORAGE_KEY);
    return false;
  }
  return true;
}

async function revokeLicense() {
  await storageRemove(STORAGE_KEY);
  try { chrome.alarms.clear(CHECK_ALARM); } catch (_) {}
}

// ── Silent background re-verify ────────────────────────────────
// Runs after the UI is already painted; never blocks init.
// • Owner keys → skipped (no server needed)
// • Server says invalid → revoke + flip UI to free
// • Server says valid   → refresh stored plan/expiry, update detail line
async function silentReVerify(license) {
  if (!license?.key) return;
  if (OWNER_KEYS.has(license.key)) return;   // master keys are always valid

  try {
    const deviceId = await getDeviceId();
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(), 8000);    // 8-second ceiling; fire and forget

    const resp = await fetch(LICENSE_API_URL, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ licenseKey: license.key, deviceId }),
      signal:  ctrl.signal,
    });

    if (!resp.ok) return;                    // server error → keep current state

    const data = await resp.json();

    if (!data.valid) {
      await revokeLicense();
      showFree();                            // key revoked on server → show free state
    } else {
      // Refresh stored fields with latest server values
      const refreshed = {
        ...license,
        plan:     data.plan     ?? license.plan,
        expiry:   data.expiry   ?? license.expiry,
        lifetime: data.lifetime ?? license.lifetime,
        premium:  true,
        verified: Date.now(),
      };
      await storageSet({ [STORAGE_KEY]: refreshed });
      updateStatusDetail(refreshed);        // update the detail line in-place
    }
  } catch (_) {
    // Network/timeout — silently keep the current UI state
  }
}

// ── Activate ───────────────────────────────────────────────────
async function activateLicense(rawKey) {
  const key = rawKey.trim().toUpperCase();

  if (!isValidKeyFormat(key))
    return { success: false, error: "Format must be XXXXX-XXXXX-XXXXX-XXXXX" };

  // Owner / master key — activate instantly, no network call
  if (OWNER_KEYS.has(key)) {
    const licObj = {
      key, plan: "lifetime", expiry: null,
      lifetime: true, verified: Date.now(), premium: true,
    };
    await storageSet({ [STORAGE_KEY]: licObj });
    try {
      chrome.alarms.clear(CHECK_ALARM, () =>
        chrome.alarms.create(CHECK_ALARM, { periodInMinutes: 360 })
      );
    } catch (_) {}
    return { success: true, licObj };
  }

  // Standard server verification
  try {
    const deviceId = await getDeviceId();
    const ctrl  = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 15000);

    const resp = await fetch(LICENSE_API_URL, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ licenseKey: key, deviceId }),
      signal:  ctrl.signal,
    }).finally(() => clearTimeout(timer));

    if (!resp.ok)
      return { success: false, error: `Server error (${resp.status}). Try again.` };

    const data = await resp.json();

    if (data.valid) {
      const licObj = {
        key,
        plan:     data.plan,
        expiry:   data.expiry   ?? null,
        lifetime: !!data.lifetime,
        verified: Date.now(),
        premium:  true,
      };
      await storageSet({ [STORAGE_KEY]: licObj });
      try {
        chrome.alarms.clear(CHECK_ALARM, () =>
          chrome.alarms.create(CHECK_ALARM, { periodInMinutes: 360 })
        );
      } catch (_) {}
      return { success: true, licObj };
    }

    return { success: false, error: data.error || "Invalid or expired key." };

  } catch (err) {
    if (err.name === "AbortError")
      return { success: false, error: "Request timed out. Check your internet." };
    return { success: false, error: "Cannot reach server. Check your internet." };
  }
}

// ── Open the panel — sends message to active WhatsApp tab to show floating iframe ──
function openPanel() {
  // Find the active WhatsApp Web tab and toggle the floating panel
  chrome.tabs.query({ url: "*://web.whatsapp.com/*" }, (tabs) => {
    if (tabs.length > 0) {
      // Send to the first (most recently active) WhatsApp tab
      const target = tabs.find(t => t.active) || tabs[0];
      chrome.tabs.sendMessage(target.id, { action: "cwp_open_panel" }, () => {
        // Ignore errors if content script not yet ready
        if (chrome.runtime.lastError) {}
      });
      // Switch focus to that tab so user sees the panel appear
      chrome.tabs.update(target.id, { active: true });
      chrome.windows.update(target.windowId, { focused: true });
    } else {
      // No WhatsApp tab open — open one (panel auto-injects when loaded)
      chrome.tabs.create({ url: "https://web.whatsapp.com/" });
    }
  });
}

// ══════════════════════════════════════════════════════════════
// DOM HELPERS
// ══════════════════════════════════════════════════════════════
const $ = id => document.getElementById(id);

const licenseInput   = $("licenseInput");
const activateBtn    = $("activateBtn");
const messageBox     = $("messageBox");
const deactivateBtn  = $("deactivateBtn");
const licToggle      = $("licToggle");
const deactivateWrap = $("deactivateWrap");
const openWaBtn      = $("openWaBtn");

function showMsg(text, type) {
  messageBox.textContent = text;
  messageBox.className   = `message-box show ${type}`;
}
function clearMsg() {
  messageBox.textContent = "";
  messageBox.className   = "message-box";
}
function setLoading(on) {
  activateBtn.disabled = on;
  activateBtn.classList.toggle("loading", on);
  activateBtn.querySelector(".btn-text").textContent =
    on ? "Verifying…" : "Activate Premium";
}

// ── Build the detail line (key hint only — no expiry clutter) ────
function buildDetailText(license) {
  const hint = license.key
    ? license.key.split("-")[0] + "-****-****-****"
    : "";
  if (license.lifetime) {
    return `🔓 Lifetime Premium  ·  ${hint}`;
  }
  // Only show expiry if it actually exists and is NOT a lifetime key
  if (license.expiry && !license.lifetime) {
    const d       = new Date(license.expiry);
    const now     = new Date();
    // Don't show past expiry dates (license should have been revoked already)
    if (d > now) {
      const dateStr = d.toLocaleDateString(undefined, {
        year: "numeric", month: "short", day: "numeric",
      });
      return `✅ Active · Expires ${dateStr}  ·  ${hint}`;
    }
  }
  return `✅ Active Premium  ·  ${hint}`;
}

// Re-renders only the detail line after a background re-verify
function updateStatusDetail(license) {
  $("statusDetail").textContent = buildDetailText(license);
}

// ── Show FREE state ────────────────────────────────────────────
function showFree() {
  $("planBadge").textContent = "FREE";
  $("planBadge").classList.remove("premium");
  $("statusCard").classList.remove("active");
  $("statusIcon").textContent   = "🔒";
  $("statusPlan").textContent   = "Free Plan";
  $("statusPlan").classList.remove("premium");
  $("statusDetail").textContent = "Enter your key to unlock premium";
  licToggle.classList.add("hidden");
  $("activationSection").classList.remove("hidden");
  $("premiumSection").classList.add("hidden");
  // Reset the toggle state so it's clean if user re-activates
  toggleOpen = false;
  deactivateWrap.classList.add("hidden");
  licToggle.textContent = "▾";
  licToggle.classList.remove("open");
}

// ── Show PREMIUM state ─────────────────────────────────────────
function showPremium(license) {
  const planLabel = license.lifetime
    ? "LIFETIME"
    : (license.plan ?? "PREMIUM").toUpperCase();

  $("planBadge").textContent = planLabel;
  $("planBadge").classList.add("premium");
  $("statusCard").classList.add("active");
  $("statusIcon").textContent = "✅";
  $("statusPlan").textContent = planLabel + " Plan";
  $("statusPlan").classList.add("premium");
  $("statusDetail").textContent = buildDetailText(license);

  $("activationSection").classList.add("hidden");
  $("premiumSection").classList.remove("hidden");
  licToggle.classList.remove("hidden");
}

// ══════════════════════════════════════════════════════════════
// EVENT LISTENERS
// ══════════════════════════════════════════════════════════════

// ── ▾ Toggle → reveals / hides the Deactivate button ──────────
let toggleOpen = false;
licToggle.addEventListener("click", () => {
  toggleOpen = !toggleOpen;
  licToggle.textContent = toggleOpen ? "▴" : "▾";
  licToggle.classList.toggle("open", toggleOpen);
  deactivateWrap.classList.toggle("hidden", !toggleOpen);
});

// ── Key auto-format ─────────────────────────────────────────
// Standard 5-5-5-5 keys get dashes auto-inserted.
// Custom/promo keys (e.g. CWP-PRO-2026-X8A91) preserve typed dashes.
licenseInput.addEventListener("input", e => {
  const raw   = e.target.value.toUpperCase();
  const alnum = raw.replace(/[^A-Z0-9-]/g, "");   // keep dashes the user typed
  const chars = alnum.replace(/-/g, "");            // pure alphanums
  if (alnum.indexOf("-") === -1 && chars.length <= 20) {
    // No dashes yet — auto-insert every 5 (standard XXXXX-XXXXX-XXXXX-XXXXX)
    e.target.value = chars.match(/.{1,5}/g)?.join("-") || chars;
  } else {
    // Dashes already present (promo/custom key) — preserve as typed
    e.target.value = alnum.slice(0, 44);
  }
  clearMsg();
});

// ── Activate ───────────────────────────────────────────────────
activateBtn.addEventListener("click", async () => {
  const raw = licenseInput.value.trim();
  if (!raw) {
    showMsg("Please enter your activation key.", "error");
    licenseInput.focus();
    return;
  }

  setLoading(true);
  clearMsg();

  const result = await activateLicense(raw);
  setLoading(false);

  if (result.success) {
    // Show the premium panel — popup stays open, NO auto-redirect
    showPremium(result.licObj);
    showMsg("✅ License activated! Use the button below to open the panel.", "success");
  } else {
    showMsg("❌ " + result.error, "error");
  }
});

// ── Open WhatsApp Pro Panel ────────────────────────────────────
// This is the ONLY place openPanel() is called — explicit user action only.
openWaBtn.addEventListener("click", () => {
  openPanel();
});

// ── Deactivate ─────────────────────────────────────────────────
deactivateBtn.addEventListener("click", async () => {
  if (!confirm("Deactivate this license on this device?\nYou can re-activate at any time with your key.")) return;
  await revokeLicense();
  showFree();
  showMsg("License deactivated. Enter your key to re-activate.", "error");
  // Make sure the activation section is fully visible
  $('activationSection').classList.remove('hidden');
  $('premiumSection').classList.add('hidden');
});

// ══════════════════════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════════════════════
async function init() {
  const premium = await isPremium();
  if (premium) {
    const lic = await getLicense();
    showPremium(lic);
    // Fire-and-forget: silently refresh from server after UI is already shown
    silentReVerify(lic);
  } else {
    showFree();
  }
}

init();
