
function load_dv_data() {
  var dv_data_promise = d3.json("data/dv_stats_svg_coords.json");
  return dv_data_promise;
}

export {load_dv_data};
