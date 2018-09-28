
function create_circles(dv_stats_data, canvas_context, scale_colors_fxns, fig_cfg,
                        legend_cfg, is_legend_action, selected_color) {
  
  var radius = 2,
      scale = 2;
  if (scale > 2) radius = 1;
  
  canvas_context.clearRect(0, 0, fig_cfg.width, fig_cfg.height);
  
  for (let b in d3.range(legend_cfg.num_bins)) {
    // make one path per color
    var color_category = scale_colors_fxns.legend(b);
    canvas_context.beginPath();
    
    for (let i in dv_stats_data) {
      var point = dv_stats_data[i],
          color_point = scale_colors_fxns.circles(point.per);
      
      // are we drawing the point in this loop iteration?
      if (color_point === color_category) {
        // we are drawing the point with default style
        canvas_context.fillStyle = color_point;
        canvas_context.strokeStyle = color_point;
        
        // now we need to check if the style should change
        // is it part of a legend hover action?
        if(is_legend_action) {
          // is it the selected category?
          if(color_category === selected_color) {
            // then the radius should be made much bigger
            radius = 4;
            if (scale > 2) radius = 3;
          } else {
            //otherwise make a regular hollow point
            canvas_context.fillStyle = "transparent";
            // need to change radius back to 2 here because if
            // the point we are changing is in a category after 
            // the selected category, the radius is now 4
            radius = 2;
            if (scale > 2) radius = 1;
          }
        }
        
        // now define the point geometry
        canvas_context.moveTo(point.x + radius, point.y);
        canvas_context.arc(point.x, point.y, radius, 0, 2 * Math.PI);
      }
      
    }
    // finish the current path (this is what actually does the final drawing)
    canvas_context.fill();
    canvas_context.stroke();
  }
}

function create_color_scale_function(legend_cfg) {
  
  // this function requires the following d3 libraries
  // d3-color.v1.min.js
  // d3-interpolate.v1.min.js
  // d3-scale-chromatic.v1.min.js
  
  var num_colors = legend_cfg.num_bins; 
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

function add_color_legend(scale_colors_fxn, legend_cfg) {
  
  var num_colors = scale_colors_fxn.legend.range().length;
  
  var legend = d3.select("#plotarea")
    .append("g")
      .attr("id", "legend")
      .attr("transform", 
            "translate(" + legend_cfg.translate_x + "," + legend_cfg.translate_y + ")");
  
  legend.selectAll(".legend_point")
    .data(d3.range(num_colors))
    .enter()
    .append("circle")
      .classed("legend_point", true)
      .attr("cx", function(d) { return d*legend_cfg.circle_radius*2.2; })
      .attr("cy", function(d) { return 0; })
      .attr("r", legend_cfg.circle_radius)
      .attr("fill", function(d) { return scale_colors_fxn.legend(d); })
      .attr("stroke", "transparent");
}

export {create_circles, create_color_scale_function, add_color_legend};
