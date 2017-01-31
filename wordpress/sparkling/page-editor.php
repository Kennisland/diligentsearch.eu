<?php
/**
 * Template Name: Datamodel-Editor
 *
 * This is the template used to show the datamodel editor and the decisiontree editor
 *
 * @package sparkling
 */

get_header('editor'); ?>

	<div id="primary" class="content-area">

		<main id="main" class="entry-content row" role="main">
			
				<div class="col-lg-6 col-md-6 col-xs-12 col-sm-12" style="min-height:100%">
					<div id="data-editor" class="left-panel"></div>					
				</div>
				<div class="col-lg-6 col-md-6 col-xs-12 col-sm-12" style="min-height:100%">
					<div id="graph-editor" class="right-panel"></div>
				</div>
			

			<div id="modal-section"></div>
		</main><!-- #main -->
	</div><!-- #primary -->

<?php get_footer('editor'); ?>
