(function () {
    init();
})();

function init() {
    try {
        // Fetch whatsapp number + license status
        chrome.storage.local.get(["my_number", "customer_email", "cwp_license"], function (result) {
            if (result.my_number) {
                setLocalStorageItem("whatsapp_number", result.my_number);
            }
            if (result.customer_email) {
                setLocalStorageItem("user_email", result.customer_email);
            }
            // Sync license/premium status to the success page
            const lic = result.cwp_license;
            if (lic && lic.premium) {
                setLocalStorageItem("cwp_premium", "true");
                setLocalStorageItem("cwp_plan", lic.plan || "premium");
                if (lic.lifetime) {
                    setLocalStorageItem("cwp_lifetime", "true");
                }
                if (lic.key) {
                    setLocalStorageItem("cwp_key_hint", lic.key.split("-")[0] + "-****");
                }
            } else {
                setLocalStorageItem("cwp_premium", "false");
            }
        });

        // Fetch browser's logged-in email
        chrome.runtime.sendMessage({ type: "get_chrome_email" }, function (response) {
            if (chrome.runtime.lastError) {
                console.log("Error fetching email:", chrome.runtime.lastError.message);
                return;
            }
            if (response && response.email) {
                setLocalStorageItem("browser_email", response.email);
            }
        });
    } catch (e) {
        console.log(e);
    }
}

// Set value to localStorage
function setLocalStorageItem(key, value, prefix = 'PROS::', stringify = false) {
    key = prefix ? (prefix + key) : key;
    value = stringify ? JSON.stringify(value) : value;

    let prevValue = window.localStorage.getItem(key);
    // console.log("key = [" + key + "] value = [" + prevValue + " -> " + value + "]");
    if (!prevValue || prevValue != value) {
        window.localStorage.setItem(key, value);
    }
}
