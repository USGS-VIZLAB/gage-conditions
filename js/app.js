// require d3 (can only do this is d3 has been installed, `npm install d3`)
var d3 = require('d3');

// webpack import functions
import {load_dv_data} from './modules/data_loading';
import {create_circles, create_color_scale_function, add_color_legend} from './modules/circles';
import {clone_states, clone_legend, add_circle_selector, find_closest_point, add_placeholder, clicked} from './modules/interactivity';

// set up configs
var fig_cfg = {
      width: d3.select('svg').attr("width"),
      height: d3.select('svg').attr("height")
    },
    legend_cfg = {
      translate_x: 300,
      translate_y: 35,
      circle_radius: 10,
      num_bins: 17
    },
    z_indices = {
      underlayPlaceholder: -100,
      mainCanvas: 10,
      mapExtras: 20,
      overlayStates: 30,
      legend: 40,
      overlayLegend: 50,
      siteHighlighter: 100
    };

// use existing svg element and add some attributes
d3.select("#mainFig").select("svg")
    .attr("id", "mapSvg")
    .style("position", "absolute");

// Make a second svg to put the legend and siteHighlighter into
// This will allow the map to be below the canvas points,
// But the siteHighlighter and legend to be above the canvas layer
d3.select('#mainFig').append('svg')
  .attr("id", "mapExtras")
  .attr("width", fig_cfg.width)
  .attr("height", fig_cfg.height)
  .style("position", "absolute")
  .style("z-index", z_indices.mapExtras);

// create canvas layer
var canvas = d3.select("#mainFig").append('canvas')
      .attr('id', "mainCanvas")
      .attr('width', fig_cfg.width)
      .attr('height', fig_cfg.height)
      .style("position", "absolute")
      .style("z-index", z_indices.mainCanvas);

var canvas_context = canvas.node().getContext('2d'),
    scale_colors_fxns = create_color_scale_function(legend_cfg),
    dv_stats_data = load_dv_data();

// add different figure features
add_color_legend(scale_colors_fxns, legend_cfg, z_indices.legend);
add_circle_selector(z_indices.siteHighlighter);
clone_states(fig_cfg, z_indices.overlayStates);
clone_legend(fig_cfg, legend_cfg, z_indices.overlayLegend);
add_placeholder(fig_cfg, z_indices.underlayPlaceholder);

Promise.all([dv_stats_data]).then(function(data) {
  create_circles(data[0], canvas_context, scale_colors_fxns, fig_cfg, legend_cfg, 
                 false, null);
  
  d3.select('#overlayStates')
    .on("mouseover", function () {
      // this is pretty rough right now
      find_closest_point(this, data[0]);
    });
  
  d3.select('#overlayStates').selectAll('path').on("click", function () {
    var selectID = d3.select(this).attr('id');
    clicked(selectID, fig_cfg, data[0], scale_colors_fxns, legend_cfg);
  });
    
  d3.select('#overlayLegend').selectAll("circle")
  .on("mouseover", function() {
    d3.select(this).attr("stroke", "orange").attr("stroke-width", 2);
    var legend_color_str = d3.select(this).attr("fill");
    create_circles(data[0], canvas_context, scale_colors_fxns, fig_cfg, legend_cfg,
                   true, legend_color_str);
  })
  .on("mouseout", function() {
    // reset circles
    create_circles(data[0], canvas_context, scale_colors_fxns, fig_cfg, legend_cfg, 
                   false, null);
  });
  
});
