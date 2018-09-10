
function clone_states(fig_cfg) {
  //clone states SVG for transparent click layer
  var content = d3.select("#plotarea").html();
  d3.select("#mainFig").append('svg')
        .html(content)
        .attr('id', 'overlayStates')
        .attr('width', fig_cfg.width)
        .attr('height', fig_cfg.height)
        .style('opacity', 0)
        .style("position", "absolute");
}

function clone_legend(fig_cfg, legend_cfg) {
  var circle_radius = d3.select("#legend").select("circle").attr("r"),
      num_circles = d3.select("#legend").selectAll("circle").size(),
      first_position = d3.select("#legend").select("circle:first-child").attr("cx"),
      last_position = d3.select("#legend").select("circle:last-child").attr("cx");
  //clone legend SVG for transparent click layer
  var content = d3.select("#legend").html();
  var overlayLegend = d3.select("#mainFig").append('svg')
        .attr('id', 'overlayLegend')
        // don't want legend overlay on top of state overlay so make 
        // it the exact size of the legend circles
        .attr('width', Number(last_position) + Number(circle_radius)*2 - Number(first_position))
        .attr('height', Number(circle_radius)*2)
        .attr("transform", 
            // need to transform so that they line up correctly
            // the circles start getting placed at the top left corner of the svg
            "translate(" + (legend_cfg.translate_x) + "," + (legend_cfg.translate_y) + ")")
        .style('opacity', 0)
        .style("position", "absolute")
        .html(content);
  
}

function add_circle_selector() {
  
  // add circle to use to highlight selected points
  d3.select("#plotarea").append('circle')
    .attr("id", "siteHighlighter")
    .attr("r", 8)
    .attr("z-index", 100)
    .style("fill", "blue")
    .style("opacity", 0);
}

function find_closest_point(click, dv_stats_data) {
  var point = d3.mouse(click);
  var node;
  var minDistance = Infinity;
  
  dv_stats_data.forEach(function (d) {
    var dx = parseInt(d.x) - point[0];
    var dy = parseInt(d.y) - point[1];
    var distance = Math.sqrt((dx * dx) + (dy * dy));
    if (distance < minDistance && distance < 10) {
      minDistance = distance;
      node = d;
    }
  });

  if (node) {
    //now we also have the data for a click event
    d3.select("#siteHighlighter")
      .attr("cx", node.x)
      .attr("cy", node.y)
      .style("opacity", 1);

    console.log('you clicked siteID: ' + node.siteID);

  }
  else {
    console.log('no site found');
  }
}

function add_placeholder(fig_cfg) {
  // this is needed to keep the footer spaced correctly
  // the key is to not add `position: absolute`
  d3.select("#mainFig").append('svg')
        .attr('id', 'overlayPlaceholder')
        .attr('width', fig_cfg.width)
        .attr('height', fig_cfg.height)
        .attr('pointer-events', 'none')
        .style('opacity', 0)
        .attr("z-index", -100);
}
export {clone_states, clone_legend, add_circle_selector, find_closest_point, add_placeholder};
