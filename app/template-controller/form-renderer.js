html_formRenderer =`
	<h2>Search-report()</h2>

	<div class="form-group">
		<label for="choose-country">
			Select the jurisdiction you want to determine an orphan work in:
		</label>
		<br>
		<select id="choose-country">
			<option value="">Choose a country</option>
		</select>
	</div>

	<div class="form-group">
		<label for="choose-work">
			Of what type of work do you want to determine the orphan work status?
		</label>
		<br>
		<select id="choose-work">
			<option value="">Choose a type of work</option>
		</select>
	</div>

	<div class="form-decision-tree-renderer">
		<label>This is where the decision tree begins</label>
	</div>
`;

function injectFormRenderer(){
	$('#form-renderer').html(html_formRenderer);
}