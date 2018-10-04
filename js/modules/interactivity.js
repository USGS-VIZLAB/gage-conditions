
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
            "translate(" + (legend_cfg.translate_x-circle_radius) + "," + 
            (legend_cfg.translate_y-circle_radius) + ")")
        .style('opacity', 0)
        .style("position", "absolute");
    
  // add circles
  overlayLegend.append('g')
    .attr("transform", 
      // need to transform so that they line up correctly
      // the circles start getting placed at the top left corner of the svg
      "translate(" + (circle_radius) + "," + 
      (circle_radius) + ")")
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

function show_closest_point(click, dv_stats_data) {
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

    // show site information
    show_site_info(node);

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

//zooming stuff below here
function clicked(d, fig_cfg, dv_data, scale_colors_fxns, legend_cfg) {
  var prev_selected_state = d3.selectAll(".activeState"), 
      svg = d3.select("#overlayStates"),
      prev_id, x, y, k, selected;
  
  // zoom out if you selected the same state
  if(prev_selected_state.node() !== null) {
    prev_id = prev_selected_state.attr("id");
  } 
  
  //clear all selected states
  svg.selectAll("path")
    .classed("activeState", false);
  
  if (d !== prev_id) {
    // zooming in to the new selected state, d
    
    // bounding box links
    // https://bl.ocks.org/mbostock/4699541
    // https://bl.ocks.org/mbostock/2206590
    // get bounding box and centroid from SVG path
    var state = d3.select('#plotarea').select("#" + d);
    var element = state.node();
    var bbox = element.getBBox();
    var centroid = [bbox.x + bbox.width / 2, bbox.y + bbox.height / 2];
    var zoombuffer = 0.6; // smaller number = farther out
    x = centroid[0];
    y = centroid[1];
    k = zoombuffer / Math.max(bbox.width / fig_cfg.width, bbox.height / fig_cfg.height);
      
    //make selected orange
    svg.select("#" + d)
      .classed("activeState", true);
  } else {
    // zooming out
    x = fig_cfg.width / 2;
    y = fig_cfg.height / 2;
    k = 1;
  }
  console.log('centroid x:', x, 'centroid y:', y, 'scale:', k, 'selected:', d);
  
  translate(x, y, k, d, fig_cfg, dv_data, scale_colors_fxns, legend_cfg);
}
    
function translate(x, y, k, selected, fig_cfg, dv_data, scale_colors_fxns, legend_cfg) {
  //make sure transition gets applied to both the original svg and clone
  d3.selectAll("path").transition()
    .duration(100)
    .attr("transform", "translate(" + fig_cfg.width / 2 + "," + fig_cfg.height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")");
  
  //scale and transform canvas layer
  // https://bl.ocks.org/lacroute/af1b46da4cb4579f93986b0119635ec2
  var canvas = d3.select("#mainCanvas");
  var context = canvas.node().getContext('2d');
  
  canvas.transition()
    .duration(100)
    .on("start", function () {
      context.clearRect(0, 0, fig_cfg.width, fig_cfg.height);
    })
    .on("end", function () {
      context.resetTransform();
      if (selected) context.translate(fig_cfg.width / 2 - x * k, fig_cfg.height / 2 - y * k);
      context.scale(k, k);
      create_circles(dv_data, context, scale_colors_fxns, fig_cfg,
                     legend_cfg, false, null);
    });
}

function add_siteInfo_text(fig_cfg) {
  
  var siteInfoSvg = d3.select("#mainFig").append("svg")
    .attr("id", "siteInfoSvg")
    .style("z-index", 50)
    .style("position", "absolute")
    .attr('width', fig_cfg.width*0.3)
    .attr('height', fig_cfg.height*0.3)
    .attr('transform', 'translate('+fig_cfg.width*0.8+','+fig_cfg.height*0.3+')')
    .style("font-family", "'Source Sans Pro', sans-serif")
    .attr('dominant-baseline', 'hanging');
  
  siteInfoSvg.append('text')
    .attr('id', 'siteInfoTitle')
    .style("font-size", "22px")
    .attr("dy", 0);
    
  siteInfoSvg.append('text')
    .attr('id', 'siteInfoMedian')
    .style("font-size", "18px")
    .attr("dy", 25);
    
  siteInfoSvg.append('text')
    .attr('id', 'siteInfoDV')
    .style("font-size", "18px")
    .attr("dy", 45);
}

function show_site_info(node) {
  
  var median_value = node.p50_va,
      dv_value = node.dv_val;
  
  if(median_value) {
    median_value = median_value + " cfs";
  } else {
    median_value = "NA";
  }
  
  if(dv_value) {
    dv_value = dv_value + " cfs";
  } else {
    dv_value = "NA";
  }
  
  d3.select("#siteInfoSvg").attr("display", "block");
  d3.select("#siteInfoTitle").text("Site "+ node.siteID);
  d3.select("#siteInfoMedian").text("Site median flow: "+ median_value);
  d3.select("#siteInfoDV").text("Daily flow: "+ dv_value);
}

function hide_site_info() {
  d3.select("#siteInfoSvg").attr("display", "none");
}

import {create_circles} from './circles';
export {clone_states, clone_legend, add_circle_selector, show_closest_point, add_placeholder, clicked, add_siteInfo_text, hide_site_info};
