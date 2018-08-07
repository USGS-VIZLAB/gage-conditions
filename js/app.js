// require d3 (can only do this is d3 has been installed, `npm install d3`)
var d3 = require('d3');

// webpack import functions
import {load_dv_data} from './modules/data_loading';
import {add_circles, create_color_scale_function, add_color_legend} from './modules/circles';

// use existing svg element
var svg = d3.select("body").select("#mainFig")
      .select("svg")
        .attr("id", "plotarea");
        
var scale_colors_fxns = create_color_scale_function();
var dv_stats_data = load_dv_data();
add_color_legend(scale_colors_fxns);

Promise.all([dv_stats_data]).then(function(data) {
  add_circles(data[0], scale_colors_fxns);
});

