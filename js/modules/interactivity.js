
function clone_states() {
  //clone states SVG for transparent click layer
  var content = d3.select("#plotarea").html();
  var svg = d3.select("#mainFig").append('svg')
        .html(content)
        .attr('id', 'overlayStates')
        .attr('width', 960)
        .attr('height', 600)
        .style('opacity', 0);
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

export {clone_states, add_circle_selector, find_closest_point};