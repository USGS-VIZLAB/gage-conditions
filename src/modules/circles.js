
function add_circles(dv_stats_data, scale_colors_fxn) {

  d3.select("#plotarea").selectAll("circle")
    .data(dv_stats_data)
    .enter()
    .append("circle")
      .attr("cx", function(d, i) { return i*10 + 20; })
      .attr("cy", function(d, i) { return Math.random()*200; })
      .attr("r", function(d) { return d.per*10; })
      .attr("fill", function(d) { return scale_colors_fxn(d.per); })
      .on("mouseover", function(d) {
        d3.select(this).attr("fill", "orange");
        console.log(d.site_no);
      })
      .on("mouseout", function() {
        d3.select(this)
          .attr("fill", function(d) { return scale_colors_fxn(d.per); });
      });
}

function create_color_scale_function(num_colors) {
  
  // this function requires the following d3 libraries
  // d3-color.v1.min.js
  // d3-interpolate.v1.min.js
  // d3-scale-chromatic.v1.min.js
  
  if(num_colors === undefined) { 
    num_colors = 17; // 17 color categories by default
  }
  var color_indices = d3.range(num_colors);
  
  //d3.interpolateRdBu expects numbers between 0 and 1
  var color_category_scale = d3.scaleLinear()
        .domain([d3.min(color_indices), d3.max(color_indices)])
        .range([0,1]);
        
  var colors = [],
      i;
  for (i = 0; i < color_indices.length; i++) {
    colors.push(d3.interpolateRdBu(color_category_scale(i)));
  }
  
  // the daily value percentages are between 0 and 1, so we need
  // those to correspond to one of our 17 colors
  var color_percentile_scale = d3.scaleQuantize()
        .domain([0,1])
        .range(colors);

  return(color_percentile_scale);
}

export {add_circles, create_color_scale_function};
