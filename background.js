chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "convert-hindi",
      title: "Convert to Roman (Hinglish)",
      contexts: ["selection"]
    });
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "convert-hindi") {
    // Send the message SPECIFICALLY to the frame where the click happened
    chrome.tabs.sendMessage(
      tab.id, 
      { action: "convertSelection" },
      { frameId: info.frameId } 
    ).catch(error => {
      console.error("Error sending message:", error);
    });
  }
});