html_graphEditor = `
<div style="text-align:center">
	<h3>Decision process editor</h3>
	<small>Use this view to create and edit your decision process by configuring nodes to refer created elements of the data model</small>
</div>

<div id="decision-process-save" style="text-align:center; padding: 10px; display: none">
	<button type="button" class="btn btn-default" onclick="resetZoom()">Reset Zoom</button>
	<button type="button" class="btn btn-primary" onclick="saveDecisionTree()">Save Decision Process</button>
</div>

<svg id="decision-process" class="svg-css"></svg>
`;




function injectGraphEditor(){
	$('#graph-editor').html(html_graphEditor);
	configureVisibility();
}

function loadGraph(){
	$('#decision-process-save').show();
	initSVG();
	customRender();
}

function resetGraph(){
	graphicNodes = [];
	graphicNodesDatabaseId = undefined;
	$('#decision-process').html('');
	$('#decision-process-save').hide();
}



// http://stackoverflow.com/questions/4565112/javascript-how-to-find-out-if-the-user-browser-is-chrome/13348618#13348618
last_state = -1;
function configureVisibility(){
	var isChromium = window.chrome,
		winNav = window.navigator,
		vendorName = winNav.vendor,
		isOpera = winNav.userAgent.indexOf("OPR") > -1,
		isIEedge = winNav.userAgent.indexOf("Edge") > -1,
		isIOSChrome = winNav.userAgent.match("CriOS");

	if(isIOSChrome || (isChromium !== null && isChromium !== undefined && vendorName === "Google Inc." && isOpera == false && isIEedge == false) ){
		// is Google Chrome
		var element = $('#display-data-model')[0];
		var observer = new WebKitMutationObserver(function (mutations) {
		  mutations.forEach(attrModified);
		});
		observer.observe(element, { attributes: true, subtree: false });

		function attrModified(mutation) {
			if($('#display-data-model').is(':visible') && last_state == -1){
				loadGraph();
				last_state = 1;
			}
			else if( ! $('#display-data-model').is(':visible') && last_state == 1){
				resetGraph();
				last_state = -1;
			}
		}
	} else { 
		// not Google Chrome 
		$('#display-data-model').bind("DOMAttrModified",function(event){
			if($(this).is(':visible') && last_state == -1){
				loadGraph();
				last_state = 1;
			}
			else if( ! $(this).is(':visible') && last_state == 1){
				resetGraph();
				last_state = -1;
			}
		});
	}
}