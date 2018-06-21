
function add_circles(dv_stats_data) {
  d3.select("#plotarea").selectAll("circle")
    .data(dv_stats_data)
    .enter()
    .append("circle")
      .attr("cx", function(d, i) { return i*10 + 20; })
      .attr("cy", function(d, i) { return Math.random()*200; })
      .attr("r", function(d) { return d.per*10; })
      .on("mouseover", function(d) {
        d3.select(this).attr("fill", "orange");
        console.log(d.site_no);
      })
      .on("mouseout", function() {
        d3.select(this).attr("fill", null);
      });
}

export {add_circles};
