process.combine_locations_data <- function(viz) {
  deps <- readDepends(viz)
  checkRequired(deps, c("sites_svg", "sites_data"))
  
  sites_svg <- deps[["sites_svg"]]
  sites_data <- deps[["sites_data"]]
  
  # leading zeros were lost when saved as tsv and read using fread defaults in readData.tabular
  sites_svg$siteID <- dataRetrieval::zeroPad(as.character(sites_svg$siteID), 8)
  
  # this keeps a bunch of NAs for `per` for gages that have locations but not data
  sites_svg_data <- dplyr::left_join(sites_svg, sites_data, by = c("siteID" = "site_no"))
  
  jsonlite::write_json(sites_svg_data, viz[["location"]])
}
