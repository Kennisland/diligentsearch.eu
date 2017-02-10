/**
 * Set up the dagre d3 rendering
 */
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

/**
 * Wrapper to render data correctly and configure the click on graphical nodes
 */
function customRender(){
	// Ensure actual zoom scale is 1 : prevent to make crazy stuff with labels
	d3.select("g").attr("transform", "scale(" + 1 + ")");
	var render = new dagreD3.render();
	render(svgGroup, graphic);
	configSVG();
	resetZoom();
}


/**
 * Specific features for the displayed graph : dimension and node click configuration
 */
function configSVG(){	
	svg.attr('width', $('#graph-editor').width());	// Update svg width element based on display
	svg.attr('height', graphic.graph().height + 40);
	svgGroup.attr('width', $('#graph-editor').width());	
	bindToNodeConfigModal();
}

/**
 * Enable the click event on graphical node displayed, to either open a default modal, or a pre-filled in modal
 */
function bindToNodeConfigModal(){
	// Click bindings with editor 
	d3.select("svg g").selectAll("g.node").each(function(v){
		var node = graphic.node($(this).context.id);
		// Define default click event if this node has no index yet
		if(node.index !== undefined){
			// Remove previous click and create new one
			$(this).off('click').on('click', function(event) {	
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

/**
 * Configure the resetZoom button behaviour
 */
function resetZoom(){
	var xCenterOffset = (svg.attr("width") - graphic.graph().width) / 2;
	svgGroup.attr("transform", "translate(" + xCenterOffset + ")" + "scale("+initialScale+")" );
}