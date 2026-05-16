// js/background.js
// NOTE: The active service worker for this extension is js/probcg.js
// This file is kept as a reference / fallback stub.
// It does NOT use ES module imports so it can be safely loaded if needed.

const LICENSE_API_URL = "https://cyberwhatsapp-back.vercel.app/api/verify-license";
const CHECK_ALARM = "cwp_license_recheck";

// Periodic license re-check alarm handler
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === CHECK_ALARM) {
    recheckLicense();
  }
});

// On install — restore alarm if license exists
chrome.runtime.onInstalled.addListener(async () => {
  const result = await chrome.storage.local.get("cwp_license");
  if (result.cwp_license?.premium) {
    chrome.alarms.create(CHECK_ALARM, { periodInMinutes: 360 });
  }
});

chrome.runtime.onStartup.addListener(async () => {
  const result = await chrome.storage.local.get("cwp_license");
  if (result.cwp_license?.premium) {
    chrome.alarms.create(CHECK_ALARM, { periodInMinutes: 360 });
  }
});

async function recheckLicense() {
  const result = await chrome.storage.local.get(["cwp_license", "cwp_device_id"]);
  const license = result.cwp_license;
  if (!license?.key) return;

  const deviceId = result.cwp_device_id || null;

  try {
    const response = await fetch(LICENSE_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ licenseKey: license.key, deviceId }),
    });

    if (!response.ok) return;

    const data = await response.json();

    if (!data.valid) {
      chrome.storage.local.remove("cwp_license");
      chrome.alarms.clear(CHECK_ALARM);
    } else {
      chrome.storage.local.set({
        cwp_license: {
          ...license,
          plan: data.plan,
          expiry: data.expiry,
          lifetime: data.lifetime,
          premium: true,
          verified: Date.now(),
        },
      });
    }
  } catch {
    // Silently fail — keep premium if server unreachable
  }
}
