<?php
/**
 * Template Name: Datamodel-Editor
 * Template: sparkling-child
 * This is the template used to show the datamodel editor and the decisiontree editor
 *
 * @package sparkling
 */

get_header('custom'); ?>

	<div id="primary" class="content-area">

		<main id="main" class="entry-content row" role="main">
			
				<div class="col-lg-4 col-md-4 col-xs-12 col-sm-12" >
				<!-- style="min-height:100%" -->
					<div id="data-editor" class="left-panel"></div>					
				</div>
				<div class="col-lg-8 col-md-8 col-xs-12 col-sm-12" >
				<!-- style="min-height:100%" -->
					<div id="graph-editor" class="right-panel"></div>
				</div>
			

			<div id="modal-section"></div>
		</main><!-- #main -->
	</div><!-- #primary -->

<?php get_footer('editor'); ?>
