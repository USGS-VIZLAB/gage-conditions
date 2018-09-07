
function add_circles(dv_stats_data, canvas_context, scale_colors_fxn) {
  
  canvas_context.beginPath();
  for (let i in dv_stats_data) {
    var radius = 2,
        scale = 2,
        point = dv_stats_data[i];
    if (scale > 2) radius = 1;
    canvas_context.fillStyle = scale_colors_fxn.circles(point.per);
    canvas_context.moveTo(point.x + radius, point.y);
    canvas_context.arc(point.x, point.y, radius, 0, 2 * Math.PI);
  }
  canvas_context.fill();
  
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
      .attr("stroke", "transparent")
      .on("mouseover", function(d) {
        d3.select(this).attr("stroke", "orange").attr("stroke-width", 2);
        var legend_color_str = scale_colors_fxn.legend(d);
        d3.selectAll('.gage_point')
            .filter(function(d) { 
              var color_str = scale_colors_fxn.circles(d.per);
              return color_str !== legend_color_str; 
            })
            .attr("stroke", function(d) { return scale_colors_fxn.circles(d.per); })
            .attr("stroke-opacity", 0.5)
            .attr("fill", "transparent");
        d3.selectAll('.gage_point')
            .filter(function(d) { 
              var color_str = scale_colors_fxn.circles(d.per);
              return color_str === legend_color_str; 
            })
            .attr("r", 5);
      })
      .on("mouseout", function(d) {
        d3.select(this).attr("stroke", "transparent");
        var legend_color_str = scale_colors_fxn.legend(d);
        d3.selectAll('.gage_point')
            .filter(function(d) { 
              var color_str = scale_colors_fxn.circles(d.per);
              return color_str !== legend_color_str; 
            })
            .attr("stroke", "transparent")
            .attr("stroke-opacity", 1)
            .attr("fill", function(d) { return scale_colors_fxn.circles(d.per); });
        d3.selectAll('.gage_point')
              .filter(function(d) { 
                var color_str = scale_colors_fxn.circles(d.per);
                return color_str === legend_color_str; 
              })
              .attr("r", 2);
      });
}

export {add_circles, create_color_scale_function, add_color_legend};
