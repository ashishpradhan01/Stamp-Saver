chrome.runtime.onInstalled.addListener(() => {
    chrome.action.disable();
    chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
      let urlRule = {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: {urlContains: 'www.youtube.com'},
          })
        ],
        actions: [new chrome.declarativeContent.ShowAction()],
      };
      let rules = [urlRule];
      chrome.declarativeContent.onPageChanged.addRules(rules);
    });
  });

// When someone uninstall this extension
chrome.runtime.onInstalled.addListener(details => {
  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.runtime.setUninstallURL('https://forms.gle/TktBmeGBqRdUgJGL7');
  }
});