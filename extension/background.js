// background.js

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "detectDeepfake",
    title: "Detect Deepfake with AI Media Scanner",
    contexts: ["image"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "detectDeepfake" && info.srcUrl) {
    chrome.storage.local.set({ selectedMediaUrl: info.srcUrl, selectedMediaType: "image" }, () => {

      const popupUrl = chrome.runtime.getURL("popup.html");
      chrome.windows.create({
        url: popupUrl,
        type: "popup",
        width: 380,
        height: 520
      }, (win) => {
      });
    });
  }
});
