<?php
function diligentSearch_enqueue_styles() {

    // reference parent style
    $parent_style = 'parent-style'; 
    wp_enqueue_style( $parent_style, get_template_directory_uri() . '/style.css' );

    // Enqueue child theme stylesheets with a dependence to the parent
    wp_enqueue_style( 'child-style',
        get_stylesheet_directory_uri() . '/style.css',
        array( $parent_style )
    );
    
    // Autocomplete style
    wp_register_style('jquery-ui-styles','http://ajax.googleapis.com/ajax/libs/jqueryui/1.8/themes/base/jquery-ui.css' );
    wp_enqueue_style('jquery-ui-styles' );
}
add_action( 'wp_enqueue_scripts', 'diligentSearch_enqueue_styles' );

function diligentSearch_enqueue_scripts(){

  // Enable jQuery '$'' sign
  wp_enqueue_script('jqry-rdy', get_stylesheet_directory_uri().'/js/enable-jquery.js', array('jquery'), true);

  // Shared ones
  wp_enqueue_script('notify-js',  get_stylesheet_directory_uri().'/js/lib/notify.min.js', array('jquery'), true);
  wp_enqueue_script('ajax-calls', get_stylesheet_directory_uri().'/js/ajax-calls.js', array('jquery'), true);
  wp_enqueue_script('data-tools', get_stylesheet_directory_uri().'/js/data-tools.js', array('jquery'), true);
  
  // Form
  wp_enqueue_script('form-template',  get_stylesheet_directory_uri().'/template-controller/form-renderer.js', array('jquery'), true);
  wp_enqueue_script('form-injection', get_stylesheet_directory_uri().'/js/form-html-generation.js', array('jquery', 'form-template'), true);
  wp_enqueue_script('form-tools',     get_stylesheet_directory_uri().'/js/form-tools.js', array('jquery', 'form-injection'), true);

  // Editor template
  wp_enqueue_script('editor-country-modal',   get_stylesheet_directory_uri().'/template-controller/data-modal/country-modal.js', array('jquery'), true);
  wp_enqueue_script('editor-work-modal',      get_stylesheet_directory_uri().'/template-controller/data-modal/work-modal.js', array('jquery'), true);
  wp_enqueue_script('editor-user-input-modal',get_stylesheet_directory_uri().'/template-controller/data-modal/user-input-modal.js', array('jquery'), true);
  wp_enqueue_script('editor-ref-value-modal', get_stylesheet_directory_uri().'/template-controller/data-modal/ref-value-modal.js', array('jquery'), true);
  wp_enqueue_script('editor-question-modal',  get_stylesheet_directory_uri().'/template-controller/data-modal/question-modal.js', array('jquery', 'jquery-ui-autocomplete'), true);
  wp_enqueue_script('editor-result-modal',    get_stylesheet_directory_uri().'/template-controller/data-modal/result-modal.js', array('jquery'), true);
  wp_enqueue_script('editor-data-block-modal',get_stylesheet_directory_uri().'/template-controller/data-modal/block-modal.js', array('jquery'), true);
  wp_enqueue_script('editor-template',        get_stylesheet_directory_uri().'/template-controller/data-editor.js', array('jquery'), true);


  // Decision tree ressources
  wp_enqueue_script('editor-d3',      get_stylesheet_directory_uri().'/js/lib/d3.v3.min.js', array('jquery'), true);
  wp_enqueue_script('editor-dagred3', get_stylesheet_directory_uri().'/js/lib/dagre-d3.min.js', array('jquery', 'editor-d3'), true);
  wp_enqueue_script('graph-svg-tools',get_stylesheet_directory_uri().'/js/graph-svg-tools.js', array('jquery', 'editor-d3'), true);

  // Decision tree templates
  wp_enqueue_script('graph-tools',  get_stylesheet_directory_uri().'/js/graph-tools.js', array('jquery'), true);
  wp_enqueue_script('graph-editor', get_stylesheet_directory_uri().'/template-controller/graph-editor.js', array('jquery'), true);
  wp_enqueue_script('graph-config', get_stylesheet_directory_uri().'/template-controller/graph-modal/node-config-modal.js', array('jquery'), true);
}
add_action( 'wp_enqueue_scripts', 'diligentSearch_enqueue_scripts' );

?>