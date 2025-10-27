const scanBtn = document.getElementById("scanBtn");
const urlInput = document.getElementById("urlInput");
const mediaTypeSelect = document.getElementById("mediaType");
const resultDiv = document.getElementById("result");

scanBtn.addEventListener("click", async () => {
  const url = urlInput.value.trim();
  const media_type = mediaTypeSelect.value;

  if (!url) {
    resultDiv.innerHTML = "⚠️ Please enter a valid media URL.";
    resultDiv.style.background = "#ef4444";
    return;
  }

  scanBtn.disabled = true;
  scanBtn.textContent = "Scanning...";
  resultDiv.innerHTML = "";

  try {
    const response = await fetch("http://localhost:8000/api/core/extension-scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, media_type })
    });

    const data = await response.json();

    if (response.ok) {
      const isFake = data.is_deepfake;
      const confidence = data.confidence || 0;

      if (isFake) {
        resultDiv.innerHTML = `❌ Deepfake Detected<br><small>Confidence: ${(confidence * 100).toFixed(1)}%</small>`;
        resultDiv.style.background = "#dc2626";
      } else {
        resultDiv.innerHTML = `✅ Real Media<br><small>Confidence: ${(confidence * 100).toFixed(1)}%</small>`;
        resultDiv.style.background = "#16a34a";
      }
    } else {
      resultDiv.innerHTML = "⚠️ Scan failed. Please try again.";
      resultDiv.style.background = "#facc15";
    }
  } catch (error) {
    console.error("Error:", error);
    resultDiv.innerHTML = "❌ Error connecting to server.";
    resultDiv.style.background = "#dc2626";
  }

  scanBtn.disabled = false;
  scanBtn.textContent = "Scan Now";
});
