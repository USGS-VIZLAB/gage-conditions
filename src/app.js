// require d3 (can only do this is d3 has been installed, `npm install d3`)
var d3 = require('d3');

// webpack import functions
import {load_dv_data} from './modules/data_loading';
import {add_circles, create_color_scale_function, add_color_legend} from './modules/circles';

// setup
var h = 300;
var w = 700;
var margin = {
  top: 20,
  bottom: 60,
  left: 60,
  right: 60
};
var plotwidth = w - margin.left - margin.right;
var plotheight = h - margin.top - margin.bottom;

// create an svg element
var svg = d3.select("body").select("#mainFig")
    .append("svg")
      .attr("id", "plotarea") // id == #plot in css, class == .plot in css
      .attr("width", w)
      .attr("height", h);

var scale_colors_fxns = create_color_scale_function();
var dv_stats_data = load_dv_data();

add_color_legend(scale_colors_fxns.legend);

Promise.all([dv_stats_data]).then(function(data) {
  add_circles(data[0], scale_colors_fxns.circles);
});

