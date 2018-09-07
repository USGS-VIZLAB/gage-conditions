// require d3 (can only do this is d3 has been installed, `npm install d3`)
var d3 = require('d3');

// webpack import functions
import {load_dv_data} from './modules/data_loading';
import {add_circles, create_color_scale_function, add_color_legend} from './modules/circles';
import {clone_states, add_circle_selector, find_closest_point} from './modules/interactivity';

// set up configs
var legend_config = {
  translate_x: 300,
  translate_y: 40,
  circle_radius: 10
};

// use existing svg element and add some attributes
d3.select("#mainFig").select("svg")
    .attr("id", "plotarea")
    .style("z-index", -10)
    .style("position", "absolute");

// create canvas layer
var canvas = d3.select("#mainFig").append('canvas')
      .attr('id', "mainCanvas")
      .attr('width', 960)
      .attr('height', 600)
      .style("position", "absolute");

var canvas_context = canvas.node().getContext('2d'),
    scale_colors_fxns = create_color_scale_function(),
    dv_stats_data = load_dv_data();

// add different figure features
clone_states();
add_color_legend(scale_colors_fxns, legend_config);
add_circle_selector();

Promise.all([dv_stats_data]).then(function(data) {
  add_circles(data[0], canvas_context, scale_colors_fxns);
  
  d3.select('#overlayStates')
    .on("click", function () {
      find_closest_point(this, data[0]);
    });
});

