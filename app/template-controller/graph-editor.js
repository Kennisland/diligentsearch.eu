html_graphEditor = `
<div style="text-align:center">
	<h3>Decision process editor</h3>
	<small>Use this view to create and edit your decision process by configuring nodes to refer created elements of the data model</small>
</div>

<svg id="decision-process" class="svg-css"></svg>
`;


function injectGraphEditor(){
	$('#graph-editor').html(html_graphEditor);
}