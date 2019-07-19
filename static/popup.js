 $(document).ready(function(){
            console.log("Loading...");

            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                var tab = tabs[0];
                tab_url = tab.url;
                if (tab_url.search(/mail.google.com/) == -1){
                    $("#inputs").replaceWith("Please open configuration tool from a browser tab with GMail open.");
                } else {

                    chrome.tabs.executeScript({code:'JSON.stringify(localStorage)'},function(result) {
                        data = JSON.parse(result[0]);
                        GoPhishServer = data.GoPhishServer;
                        reportEmailAddress = data.reportEmailAddress;
                        //console.log(GoPhishServer);
                        $("#server").val(GoPhishServer);
                        $("#inputEmail").val(reportEmailAddress);
                    });

                $( "#target" ).submit(function( event ) {
                        GoPhishServer = $("#server").val();
                        reportEmailAddress = $("#inputEmail").val();
                        if (GoPhishServer.slice(-1) != "/") {   //Ensure trailing slash
                            GoPhishServer = GoPhishServer + "/"
                        }
                        //console.log("Saving server as " + GoPhishServer);
                        //console.log("Saving report email as " + reportEmailAddress);
                        chrome.tabs.executeScript({code:'localStorage.setItem("GoPhishServer", "'+ GoPhishServer +'");'},function(result) {});
                        chrome.tabs.executeScript({code:'localStorage.setItem("reportEmailAddress", "'+ reportEmailAddress +'");'},function(result) {});
                        event.preventDefault();
                        window.close();
                });

                }

            });
 
        });