// js/license.js
// Core license verification logic for Cyber WhatsApp Pro

const LICENSE_API_URL = "https://cyberwhatsapp-back.vercel.app/api/verify-license";
const STORAGE_KEY = "cwp_license";
const CHECK_ALARM = "cwp_license_recheck";

// ── Context safety guard ──────────────────────────────────────
// Returns true if the extension context is still valid
function isContextValid() {
  try {
    return !!(chrome && chrome.runtime && chrome.runtime.id);
  } catch (_) {
    return false;
  }
}

// Safe wrapper for chrome.storage.local.get — returns {} if context is gone
async function safeStorageGet(keys) {
  if (!isContextValid()) return {};
  try {
    return await chrome.storage.local.get(keys);
  } catch (_) {
    return {};
  }
}

// Safe wrapper for chrome.storage.local.set — silently fails if context is gone
async function safeStorageSet(obj) {
  if (!isContextValid()) return;
  try {
    await chrome.storage.local.set(obj);
  } catch (_) {}
}

// Safe wrapper for chrome.storage.local.remove
async function safeStorageRemove(key) {
  if (!isContextValid()) return;
  try {
    await chrome.storage.local.remove(key);
  } catch (_) {}
}

// ── Helpers ───────────────────────────────────────────────────
async function getDeviceId() {
  const result = await safeStorageGet("cwp_device_id");
  if (result.cwp_device_id) return result.cwp_device_id;

  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  const id = Array.from(arr).map(b => b.toString(16).padStart(2, "0")).join("");
  await safeStorageSet({ cwp_device_id: id });
  return id;
}

export function isValidKeyFormat(key) {
  return /^[A-Z0-9]{2,10}-[A-Z0-9]{2,10}-[A-Z0-9]{2,10}-[A-Z0-9]{2,10}$/.test(key);
}

// ── Public API ────────────────────────────────────────────────
// ── Hardcoded test/owner keys (bypass server) ───────────────
const OWNER_KEYS = new Set([
  "5U6DE-SKO94-9127C-JRNBY",
  "FCUCS-6VM6S-UHD3B-EP7SB",
]);

export async function activateLicense(licenseKey) {
  if (!licenseKey || licenseKey.trim().length < 10) {
    return { success: false, error: "Please enter a valid activation key." };
  }

  const key = licenseKey.trim().toUpperCase();

  if (!isValidKeyFormat(key)) {
    return { success: false, error: "Invalid key format. Expected: XXXXX-XXXXX-XXXXX-XXXXX" };
  }

  // Hardcoded owner/test keys — activate instantly without hitting the server
  if (OWNER_KEYS.has(key)) {
    await safeStorageSet({
      [STORAGE_KEY]: {
        key,
        plan:     "lifetime",
        expiry:   null,
        lifetime: true,
        verified: Date.now(),
        premium:  true,
      },
    });
    scheduleRecheck();
    return { success: true, plan: "lifetime", expiry: null, lifetime: true };
  }

  // Guard: extension context must be valid before making any chrome.* calls
  if (!isContextValid()) {
    return { success: false, error: "Extension reloaded. Please close and reopen the popup." };
  }

  try {
    const deviceId = await getDeviceId();

    const controller = new AbortController();
    // Increased to 20s to survive Vercel cold starts
    const timeout = setTimeout(() => controller.abort(), 20000);

    let response;
    try {
      response = await fetch(LICENSE_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ licenseKey: key, deviceId }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      return { success: false, error: `Server error (${response.status}). Please try again.` };
    }

    const data = await response.json();

    if (data.valid) {
      await safeStorageSet({
        [STORAGE_KEY]: {
          key,
          plan:     data.plan,
          expiry:   data.expiry,
          lifetime: data.lifetime,
          verified: Date.now(),
          premium:  true,
        },
      });

      scheduleRecheck();
      return { success: true, plan: data.plan, expiry: data.expiry, lifetime: data.lifetime };
    } else {
      return { success: false, error: data.error || "Invalid or expired key." };
    }
  } catch (err) {
    console.error("[CWP License] Error:", err);

    // Distinguish between extension context loss vs real network error
    if (!isContextValid()) {
      return { success: false, error: "Extension reloaded. Please close and reopen the popup." };
    }
    if (err.name === "AbortError") {
      return { success: false, error: "Request timed out. Please try again." };
    }
    return { success: false, error: "Server unreachable. Check your internet." };
  }
}

export async function getLicense() {
  const result = await safeStorageGet(STORAGE_KEY);
  return result[STORAGE_KEY] || null;
}

export async function isPremium() {
  const license = await getLicense();
  if (!license || !license.premium) return false;

  if (!license.lifetime && license.expiry) {
    if (new Date(license.expiry) < new Date()) {
      await revokeLicense();
      return false;
    }
  }
  return true;
}

export async function revokeLicense() {
  await safeStorageRemove(STORAGE_KEY);
  if (isContextValid()) {
    try { chrome.alarms.clear(CHECK_ALARM); } catch (_) {}
  }
}

export async function recheckLicense() {
  const license = await getLicense();
  if (!license?.key) return;

  if (!isContextValid()) return;

  try {
    const deviceId = await getDeviceId();

    const response = await fetch(LICENSE_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ licenseKey: license.key, deviceId }),
    });

    if (!response.ok) return;

    const data = await response.json();

    if (!data.valid) {
      await revokeLicense();
    } else {
      await safeStorageSet({
        [STORAGE_KEY]: {
          ...license,
          plan:     data.plan,
          expiry:   data.expiry,
          lifetime: data.lifetime,
          premium:  true,
          verified: Date.now(),
        },
      });
    }
  } catch {
    // Silently fail — keep premium if server unreachable
  }
}

// ── Internal helpers ──────────────────────────────────────────
function scheduleRecheck() {
  if (!isContextValid()) return;
  try {
    chrome.alarms.clear(CHECK_ALARM, () => {
      chrome.alarms.create(CHECK_ALARM, { periodInMinutes: 360 });
    });
  } catch (_) {}
}