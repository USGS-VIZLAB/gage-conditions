// require d3 (can only do this is d3 has been installed, `npm install d3`)
var d3 = require('d3');

// webpack import functions
import {load_dv_data} from './modules/data_loading';
import {add_circles} from './modules/circles';

// use existing svg element
var svg = d3.select("body").select("#mainFig")
      .select("svg")
        .attr("id", "plotarea");
    
var dv_stats_data = load_dv_data();

Promise.all([dv_stats_data]).then(function(data) {
  add_circles(data[0]);
});

