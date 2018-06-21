
function add_circles(dv_stats_data) {
  d3.select("#plotarea").selectAll("circle")
    .data(dv_stats_data)
    .enter()
    .append("circle")
      .attr("cx", function(d, i) { return i*10 + 20; })
      .attr("cy", 100)
      .attr("r", function(d) { return d.per*10; });
}

export {add_circles};
