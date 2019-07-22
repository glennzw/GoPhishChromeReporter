//Listen for a GoPhish report from the main content page. This allows
// us to report to non-https pages (bypassing the Mixed Content restriction)

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    fetch(request.url)
    .then(function(response) {
        sendResponse({status: response.status});
        return true;
    }).catch(function(error) {
        sendResponse({status: "0", error: error});
        return true;
  });
    return true;
  });
