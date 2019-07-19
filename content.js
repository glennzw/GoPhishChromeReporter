/*
Flush settings:
		localStorage.removeItem("GoPhishServer");
		localStorage.removeItem("reportEmailAddress");
*/

popUpMin = 1000; // Minimum amount of time for the "Reporting" popup to be displayed.
endPoint = "https://ruthere.herokuapp.com/j/" //Relay for checking GoPhish report URL

InboxSDK.load('1', 'sdk_GoPhishReporter_86cccdc75d').then(function(sdk){

		sdk.Toolbars.registerThreadButton({
			title: "Report Email to GoPhish",
			iconUrl: 'https://getgophish.com/favicon.ico',
			hasDropdown: true,
			positions: ["THREAD"],
			onClick: function (data) { //data is an event object

				handleReport(data);
				
				async function handleReport(data){

					//Reporting dialog pops up for at least n seconds
					imgL = chrome.extension.getURL("/static/throbber.gif");
					var modalC = sdk.Widgets.showModalView({
						title: '',
						chrome: false,
						'el': `<br><br><div id="email-popup"><img src="` + imgL + `"></div><br><div style="text-align:center">Reporting</div><br></br>`,
					});

					await sleep(popUpMin);

					GoPhishServer = localStorage.getItem("GoPhishServer");
					reportEmailAddress = localStorage.getItem("reportEmailAddress");
					
					if (GoPhishServer == null || GoPhishServer == "") {
						modalC.close(); // Close "Reporting" popup
						var modal = sdk.Widgets.showModalView({
							title: 'GoPhish Server not Set',
							'el': `<div id="set-server">Unable to report email. Please set your GoPhish server by clicking<br>the GoPhish icon in the top right of your browser.`,
							buttons: [{
								text: 'OK',
								title: 'SOK',
								type:  'PRIMARY_ACTION',
								onClick: function() {
									modal.close();
								}
							}]
						});
					} else {
						// Server is set, let's continue. AA
						var gm = new Gmail();
						var patt = /(rid=[A-Z,0-9]{7})/i; // Test pattern to determine if GoPhish email ?rid=123456 (https://docs.getgophish.com/user-guide/documentation/email-reporting)
						email = data.selectedThreadViews[0];
						msgV = email.getMessageViews()[0];
						emailBody = msgV.getBodyElement().outerHTML;
						var phishy = patt.exec(emailBody);
						if (phishy != null) {
							reportURL = GoPhishServer.concat("report?", phishy[0]);
							//reportURL = reportURL + ";;" + randstring(5); //Hack to avoid cache'd GETs. GoPhish ignores the ;;.*
				
							//We need to get the returned status code, but CORS blocks us querying it directly.
							console.log(endPoint + reportURL);
							$.getJSON(endPoint + reportURL, function(data) {
								var status = `${data.status}`;
								console.log("Status: " + status);
								if (status == "204") { //Phish
									modalC.close();
									var modal = sdk.Widgets.showModalView({
										title: 'Phishing Campaign Reported!',
										'el': `<div id="email-popup">This was a GoPhish training simulation and you passed the test.<p><b><center>Bravo!</b> 🎉</center></div>`,
										buttons: [{
											text: 'OK',
											title: 'Thanks, bye.',
											type:  'PRIMARY_ACTION',
											onClick: function() {
												modal.close();
											}
										}]
									});
									//Notification bar of email being sent. Seems to get overridden with Google's one.
									gm.tools.infobox("Email reported, thank you.", 4000);

								} else {
									modalC.close();
									var modal = sdk.Widgets.showModalView({
										title: 'Unable to Report Phish!',
										'el': `<div id="email-popup">This appears to be a training simulation email, but reporting it failed.<br>Perhaps your GoPhish server (<a href="` + GoPhishServer + `">`+GoPhishServer+`</a>) is incorrectly set?</div>`,
										buttons: [{
											text: 'OK',
											title: 'OK, close window',
											type:  'PRIMARY_ACTION',
											onClick: function() {
												modal.close();
											}
										}]
									});
								}
									  
								
							});
``
							/*
							// Alternative method to query phish server response code, via image dimensions
							var newImg = new Image;
							newImg.src = "http://ruthere.local:9000/u/" + reportURL;
							newImg.onload = function(){
								if (newImg.height == 204) { //204 succeed	
									modalC.close();
									var modal = sdk.Widgets.showModalView({
										title: 'Phishing Campaign Reported!',
										'el': `<div id="email-popup">This was a GoPhish training simulation and you passed the test.<p><b><center>Bravo!</b> 🎉</center></div>`,
										buttons: [{
											text: 'OK',
											title: 'Thanks, bye.',
											type:  'PRIMARY_ACTION',
											onClick: function() {
												modal.close();
											}
										}]
									});
									//Notification bar of email being sent. Seems to get overridden with Google's one.
									gm.tools.infobox("Email reported, thank you.", 4000);
								} else {
									modalC.close();
									var modal = sdk.Widgets.showModalView({
										title: 'Unable to Report Phish!',
										'el': `<div id="email-popup">This appears to be a training simulation email, but reporting it failed.<br>Perhaps your GoPhish server (<a href="` + GoPhishServer + `">`+GoPhishServer+`</a>) is incorrectly set?</div>`,
										buttons: [{
											text: 'OK',
											title: 'OK, close window',
											type:  'PRIMARY_ACTION',
											onClick: function() {
												modal.close();
											}
										}]
									});
								}
							}
							*/
						} else { //else BB
				
							modalC.close();

							elText = `<div id="email-popup">This is not a GoPhish simulation email. You should report it to your security/IT department.</div>`;
							titleText = 'Report Email to IT'; 
							if (reportEmailAddress != null && reportEmailAddress != ""){
								elText = `<div id="email-popup">This email is not a training simulation email.<p>You should report it to your security/IT department (<b>`+ reportEmailAddress +`</b>).</div>`;
								titleText = 'Report Email to ' + reportEmailAddress + '.';
							}

							modalR = sdk.Widgets.showModalView({
								title: 'Report Suspicious Email?',
								'el': elText,
								buttons: [{
									
										text: 'No thanks',
										title: 'Close',
										type:  'PRIMARY_ACTION',
										onClick: function() {
											modalR.close();	
										}
									},
									{
									text: 'Report',
									title: titleText,
									type:  'PRIMARY_ACTION',
									onClick: function() {
							
										if(reportEmailAddress == null || reportEmailAddress == ""){
											var modal = sdk.Widgets.showModalView({
												title: 'Reporting Email Address not Set',
												'el': `<div id="set-server">Unable to report Phish. Please set your Report Email by clicking the<br>GoPhish icon in the top right of your browser.`,
												buttons: [{
													text: 'OK',
													title: 'OK',
													type:  'PRIMARY_ACTION',
													onClick: function() {
														modal.close();
														modalR.close();	
													}
												}]
											});
										} else {
											modalR.close();
											//reportEmailAddress is set, so let's forward.
											//Fake forward the email by composing a new email and adding the content of the suspicious email
											//TODO: Add time to forward, can't seem to find this value in InboxSDK
											sdk.Compose.openNewComposeView().then(async function (composeviewobject) {
												email = data.selectedThreadViews[0];
												subject = email.getSubject();
												msgV = email.getMessageViews()[0];
												emailHTML = msgV.getBodyElement();
												emailBody = msgV.getBodyElement().outerHTML; //return type: HTMLElement
												senderEmail = msgV.getSender().emailAddress;
												senderName = msgV.getSender().name
												msgID = msgV.getMessageIDAsync(); //Get ID of message. return type: Promise(string)
												userEmail = sdk.User.getEmailAddress();
												forwardHeader = "---------- Forwarded message ----------<br>\nFrom: " + senderName + " &lt;" + senderEmail + "&gt;<br>\nSubject: " + subject + "<br>\nTo: " + userEmail + "<br>\n<br>\n";
												composeviewobject.setToRecipients([reportEmailAddress]);
												composeviewobject.setSubject("FW: " + subject);
												composeviewobject.setBodyHTML(forwardHeader + emailBody);
												setTimeout(function(){ composeviewobject.send(); }, 350); //Without the delay a blank email gets sent sometimes
							
												
												await sleep(100);
												var modal = sdk.Widgets.showModalView({
													title: 'Phishing Campaign Reported!',
													'el': `<div id="email-popup">Email reported to <b>` + reportEmailAddress + `</b>. Thank you!</div>`,
													buttons: [{
														text: 'OK',
														title: 'OK, close window',
														type:  'PRIMARY_ACTION',
														onClick: function() {
															modal.close();
														}
													}]
												});
							
												gm.tools.infobox("Thank you, email forwarded to " + reportEmailAddress, 4000);
							
							
											}); // end compose
							
										} // end else for emailAdd null
				
									}//end onClick
								}]//close buttons
							});//close showModal
				
						}// end else BB		
				
					} // End AA else 
				
				} // end handleReport

			} // Close onClick: function (data)
		});

});


/* Helper functions:
 */

function randstring(length) {
	var result           = '';
	var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var charactersLength = characters.length;
	for ( var i = 0; i < length; i++ ) {
	   result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
 }

 function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
  }