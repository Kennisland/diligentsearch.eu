<?php
/**
 * Template Name: Form-Renderer
 * Template: sparkling-child
 * This is the template used to display diligentsearch forms
 *
 * @package sparkling
 */
get_header('custom'); ?>

	<div id="primary" class="content-area">

		<main id="main" class="site-main" role="main">
			<div id="form-menu" class="form-menu">
				<h2>Please select an option below</h2>
				<ol>
					<li><a onclick="newSearch();">Start a new diligent search</a></li>
					<li>Continue working on a diligent search by entering its ID below. Version is optional
						<br>
						<input id="search-hook" type="text" placeholder="Research ID">
						<input id="search-version" type="text" placeholder="#Version" style="max-width: 100px">
						<a onclick="getSearch();">Continue</a>
					</li>			
				</ol>				
			</div>

			<div id='form-renderer' class="form-renderer"></div>
		</main><!-- #main -->
	</div><!-- #primary -->

<?php get_footer('custom'); ?>
