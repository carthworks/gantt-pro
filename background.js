// Background service worker for Gantt Pro
chrome.action.onClicked.addListener((tab) => {
    chrome.tabs.create({
        url: chrome.runtime.getURL('index.html')
    });
});
