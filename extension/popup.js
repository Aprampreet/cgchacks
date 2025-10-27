const scanBtn = document.getElementById("scanBtn");
const urlInput = document.getElementById("urlInput");
const mediaTypeSelect = document.getElementById("mediaType");
const resultDiv = document.getElementById("result");

console.log("popup loaded");

chrome.storage.local.get(["selectedMediaUrl", "selectedMediaType"], (data) => {
  if (chrome.runtime.lastError) {
    console.error("storage.get error:", chrome.runtime.lastError);
    return;
  }
  if (data.selectedMediaUrl) {
    console.log("Auto-loaded selected media url:", data.selectedMediaUrl);
    urlInput.value = data.selectedMediaUrl;
    if (data.selectedMediaType) mediaTypeSelect.value = data.selectedMediaType;
    chrome.storage.local.remove(["selectedMediaUrl", "selectedMediaType"]);
    autoScan(data.selectedMediaUrl, data.selectedMediaType || "image");
  }
});

scanBtn.addEventListener("click", async () => {
  const url = urlInput.value.trim();
  const media_type = mediaTypeSelect.value;
  if (!url) return showResult("Please enter a valid media URL.", "warn");
  await scanMedia(url, media_type);
});

async function autoScan(url, media_type = "image") {
  scanBtn.disabled = true;
  scanBtn.textContent = "Scanning...";
  resultDiv.style.display = "block";
  resultDiv.className = "loading";
  resultDiv.textContent = "";
  await scanMedia(url, media_type);
  scanBtn.disabled = false;
  scanBtn.textContent = "Scan Now";
}

async function scanMedia(url, media_type) {
  try {
    const endpoint = "http://localhost:8000/api/core/extension-scan";
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, media_type })
    });

    let data = {};
    try {
      data = await response.json();
    } catch (e) {
      console.warn("Response not JSON", e);
    }

    if (response.ok) {
      const isFake = !!data.is_deepfake;
      const confidenceNum = data.confidence ?? data.final_confidence ?? 0;
      const confidence = Math.min(Math.max(Number(confidenceNum) || 0, 0), 1) * 100;
      if (isFake) {
        showResult(`Deepfake Detected`, "error", `Confidence: ${confidence.toFixed(1)}%`);
      } else {
        showResult(`Real Media`, "success", `Confidence: ${confidence.toFixed(1)}%`);
      }
    } else {
      const msg = data?.message || `Scan failed (status ${response.status})`;
      showResult(`${msg}`, "warn");
    }
  } catch (err) {
    console.error("scanMedia error:", err);
    showResult("Unable to connect to the server.", "error");
  }
}

function showResult(message, type, smallText = "") {
  resultDiv.className = type;
  resultDiv.style.display = "block";
  resultDiv.innerHTML = `${message}${smallText ? `<small>${smallText}</small>` : ""}`;
}
