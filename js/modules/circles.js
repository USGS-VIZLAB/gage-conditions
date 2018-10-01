
function create_circles(dv_stats_data, canvas_context, scale_colors_fxns, fig_cfg,
                        legend_cfg, is_legend_action, selected_color) {
  
  var selected_color_points = {},
      radius = 2,
      scale = 2;
  if (scale > 2) radius = 1;
  
  canvas_context.clearRect(0, 0, fig_cfg.width, fig_cfg.height);
  
  // loop through the different legend bins
  for (let b in d3.range(legend_cfg.num_bins)) {
    // make one path per color
    var color_category = scale_colors_fxns.legend(b);
    
    // not going to draw the selected points yet, only capture the data
    // so we can't set any of the path stuff
    if(color_category !== selected_color) {
        canvas_context.beginPath();
    }
    
    // loop through the data points
    for (let i in dv_stats_data) {
      var point = dv_stats_data[i],
          color_point = scale_colors_fxns.circles(point.per);
      
      // is this point in the current color category for the loop iteration?
      if (color_point === color_category) {
        
        // is it the selected category?
        if(color_category === selected_color) {
          // save the point data, but skip the rest and go to the next loop iteration
          // the selected points will be drawn after so they are on top
          selected_color_points[i] = point;
          continue; 
        }
        
        // start by drawing the point with default style
        canvas_context.fillStyle = color_point;
        canvas_context.strokeStyle = color_point;
        
        // now we need to check if the style should change
        // is it part of a legend hover action?
        if(is_legend_action) {
          // no selected color points here, so make a regular hollow point
          canvas_context.fillStyle = "transparent";
        }
        
        // now define the point geometry
        canvas_context.moveTo(point.x + radius, point.y);
        canvas_context.arc(point.x, point.y, radius, 0, 2 * Math.PI);
      }
      
    }
    
    // skip the rest of this loop and go to the next one
    // the selected points will be drawn after so they are on top
    if(color_category === selected_color) {
      continue;
    }
    
    // finish the current path (this is what actually does the final drawing)
    canvas_context.fill();
    canvas_context.stroke();
  }
  
  // Now draw any selected_color_points so that they are on top
  if(selected_color_points) {
    canvas_context.beginPath();
    for (let i in selected_color_points) {
      var selected_point = selected_color_points[i],
          selected_color_point = scale_colors_fxns.circles(selected_point.per);
      canvas_context.fillStyle = selected_color_point;
      canvas_context.strokeStyle = selected_color_point;
      radius = 4; // radius of the selected points is bigger
      if (scale > 2) radius = 3;
      // now define the point geometry
      canvas_context.moveTo(selected_point.x + radius, selected_point.y);
      canvas_context.arc(selected_point.x, selected_point.y, radius, 0, 2 * Math.PI);
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
