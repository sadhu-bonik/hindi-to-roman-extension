document.getElementById('convertBtn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  // Send message to content script
  chrome.tabs.sendMessage(tab.id, { action: "convert" });
  // Optional: Close popup
  window.close();
});