<?php
/**
 * Template Name: Form-Renderer
 * Template: sparkling-child
 * This is the template used to display diligentsearch forms
 *
 * @package sparkling
 */
get_header('custom'); ?>


<div class="container main-content-area">
	<div class="row side-pull-left">
		<div class="main-content-inner col-sm-12 col-md-12">
			<div id="primary" class="content-area">
				<main id="main" class="site-main" role="main">
					<div class="post-inner-content">
						<article id="post" class="post page type-page status-publish hentry">
						<header class="entry-header page-header">
							<h1 class="entry-title">Diligent Search</h1>
						</header><!-- .entry-header -->

						<div class="entry-content">
							<?php if ( have_posts() ) : while ( have_posts() ) : the_post();
								the_content();
							endwhile; else: ?>
								<p>Sorry, no posts matched your criteria.</p>
							<?php endif; ?>
							<div id="form-menu" class="form-menu">
								<h2>Start a new search</h2>
									<p>This allows you to do start a diligent search for an orphan in a given jurisdiction of the European Union. In the current beta the Netherlands, the UK, Italy and Germany are available.</p>
									<a class="btn btn-primary btn " href="#" target="_self" onclick="newSearch();">Start a new search</a>
								<h2>Continue a search</h2>
									<p>Continue working on a diligent search by entering its ID below. Entering a version number is optional. The latests version is loaded if no version number is given.</p>
										<input id="search-hook" type="text" placeholder="Research ID">
										<input id="search-version" type="text" placeholder="#Version" style="max-width: 100px">
										<a class="btn btn-primary btn " href="#" target="_self" onclick="getSearch();">Continue search</a>			
							</div><!-- #form-menu -->

							<div id='form-renderer' class="form-renderer"></div>
						</div><!-- #entry-content -->
					</div><!-- #inner-content -->
				</main><!-- #main -->
			</div><!-- #primary -->
		</div><!-- #main-content-inner -->
	</div><!-- #row side-pull-left -->
</div><!-- #container -->

<?php get_footer('form'); ?>