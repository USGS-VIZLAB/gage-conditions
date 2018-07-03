
function add_circles(dv_stats_data, scale_colors_fxn) {

  d3.select("#plotarea").selectAll(".gage_point")
    .data(dv_stats_data)
    .enter()
    .append("circle")
      .classed("gage_point", true)
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })
      .attr("r", function(d) { return 2; })
      .attr("fill", function(d) { return scale_colors_fxn(d.per); })
      .attr("stroke", "transparent")
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
  
  var color_legend_scale = d3.scaleQuantize()
        .domain([d3.min(color_indices), d3.max(color_indices)])
        .range(colors);

  return({
    legend: color_legend_scale,
    circles: color_percentile_scale
  });
}

function add_color_legend(scale_colors_fxn) {
  
  var num_colors = scale_colors_fxn.range().length,
      circle_radius = 10;
  
  var legend = d3.select("#plotarea")
    .append("g")
      .attr("id", "legend")
      .attr("transform", "translate(" + 300 + "," + 40 + ")");
  
  legend.selectAll(".legend_point")
    .data(d3.range(num_colors))
    .enter()
    .append("circle")
      .classed("legend_point", true)
      .attr("cx", function(d) { return d*circle_radius*2.2; })
      .attr("cy", function(d) { return 0; })
      .attr("r", circle_radius)
      .attr("fill", function(d) { return scale_colors_fxn(d); })
      .attr("stroke", "transparent")
      .on("mouseover", function(d) {
        d3.select(this).attr("fill", "orange");
      })
      .on("mouseout", function() {
        d3.select(this)
          .attr("fill", function(d) { return scale_colors_fxn(d); });
      });
}

export {add_circles, create_color_scale_function, add_color_legend};
