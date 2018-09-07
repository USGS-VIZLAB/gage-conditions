// require d3 (can only do this is d3 has been installed, `npm install d3`)
var d3 = require('d3');

// webpack import functions
import {load_dv_data} from './modules/data_loading';
import {add_circles, create_color_scale_function, add_color_legend} from './modules/circles';

// use existing svg element
var mainfig = d3.select("body").select("#mainFig");
var svgoriginal = mainfig.select("svg")
      .attr("id", "plotarea")
      .style("z-index", -10)
      .style("position", "absolute");

// create canvas layer
var canvas = mainfig.append('canvas')
      .attr('id', "mainCanvas")
      .attr('width', 960)
      .attr('height', 600)
      .style("position", "absolute");

var canvas_context = canvas.node().getContext('2d');

//clone states SVG for transparent click layer
var content = svgoriginal.html();
var svg = mainfig.append('svg')
      .html(content)
      .attr('id', 'overlayStates')
      .attr('width', 960)
      .attr('height', 600)
      .style('opacity', 0);
  
var scale_colors_fxns = create_color_scale_function();
var dv_stats_data = load_dv_data();
add_color_legend(scale_colors_fxns);

Promise.all([dv_stats_data]).then(function(data) {
  add_circles(data[0], canvas_context, scale_colors_fxns);
});

