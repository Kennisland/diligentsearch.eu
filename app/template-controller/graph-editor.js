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



last_state = -1;
graphicNodesDatabaseId = undefined;
graphicNodes = [];

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

function configureVisibility(){
	// http://stackoverflow.com/questions/4565112/javascript-how-to-find-out-if-the-user-browser-is-chrome/13348618#13348618
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






/*
 * SVG dagre D3 set up  
*/


// Graphical objects
svg = undefined;
svgGroup = undefined;
graphic = undefined;
zoom = undefined;
initialScale = 0.7;

// Initiate the graphical object and the first node
function initSVG(){
	graphic = new dagreD3.graphlib.Graph({compound:true})
		.setGraph({})
		.setDefaultEdgeLabel(function() { return {}; });

	svg = d3.select("svg");
	svgGroup = svg.append("g");
	zoom = d3.behavior.zoom();

	// Zoom 
	zoom.on("zoom", function() {
		svgGroup.attr("transform", 
			"translate(" + d3.event.translate + ")" + "scale(" + d3.event.scale + ")");
	});
	svg.call(zoom);

}

// Render the graphic to display
function customRender(){
	// Ensure actual zoom scale is 1 : prevent to make crazy stuff with labels
	d3.select("g").attr("transform", "scale(" + 1 + ")");
	var render = new dagreD3.render();
	render(svgGroup, graphic);
	configSVG();
	resetZoom();
}

// Configure SVG features (centering, translation, zoom, click)
function configSVG(){	
	svg.attr('width', $('#graph-editor').width());	// Update svg width element based on display
	svg.attr('height', graphic.graph().height + 40);

	svgGroup.attr('width', $('#graph-editor').width());	
	// Click bindings with editor 
	d3.select("svg g").selectAll("g.node").each(function(v){		
		var node = graphic.node($(this).context.id);
		// Define default click event if this node has no index yet
		if(node.index !== undefined){
			$(this).off('click').on('click', function(event) {				
				// console.log("Opening ", $(this).context.id, ' index ', node.index, ' elt ', graphicNodes[node.index]);			

				$('#node-graphic-id').val($(this).context.id);
				loadGraphicNode(node.index, graphicNodes[node.index]);
			});
		}
		else if(node.questionIndex !== undefined){
			// do nothing as this is a block question
			// console.log("Question belonging to a block : ", node.questionIndex);
		}
		else{
			// Define the custom click event to load node information
			$(this).off('click').on('click', function(event) {
				$('#node-graphic-id').val($(this).context.id);
				$('#config-nodeModal').modal({backdrop: 'static', keyboard: false});
			});
		}
	});
}

function resetZoom(){
	var xCenterOffset = (svg.attr("width") - graphic.graph().width) / 2;
	svgGroup.attr("transform", "translate(" + xCenterOffset + ")" + "scale("+initialScale+")" );
}