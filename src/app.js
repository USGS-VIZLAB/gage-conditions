// setup
var h = 200;
var w = 700;
var margin = {
  top: 20,
  bottom: 60,
  left: 60,
  right: 60
};
var plotwidth = w - margin.left - margin.right;
var plotheight = h - margin.top - margin.bottom;

// create an svg element
var svg = d3.select("body").select("#mainFig")
    .append("svg")
      .attr("id", "plotarea") // id == #plot in css, class == .plot in css
      .attr("width", w)
      .attr("height", h);

svg.selectAll("circle")
  .data([1,2,3,4,5])
  .enter()
  .append("circle")
    .attr("cx", function(d, i) { return i*100 + 20; })
    .attr("cy", 100)
    .attr("r", function(d) { return d*10; });
