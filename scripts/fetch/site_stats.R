fetchTimestamp.site_stats <- vizlab::alwaysCurrent

#' @title Get the discharge quantiles for each dv gage
#' 
#' @param viz a vizlab object that depends on a vector of sites
fetch.site_stats <- function(viz){
  library(dataRetrieval)
  
  deps <- readDepends(viz)
  checkRequired(deps, c("sites", "block_size", "percentiles"))
  sites <- deps[["sites"]]
  block_size <- deps[["block_size"]][["size"]]
  stat_types <- deps[["percentiles"]][["percentiles"]]
  
  req_bks <- seq(1, length(sites), by=block_size)
  stat_data <- data.frame()
  for(i in req_bks) {
    get_sites <- sites[i:(i+block_size-1)]
    current_sites <- suppressWarnings(
      readNWISstat(siteNumbers = get_sites,
                   parameterCd = "00060", 
                   statReportType="daily",
                   statType=paste0("P", stat_types)
      ))
    stat_data <- rbind(stat_data,current_sites)
  }
  
  jsonlite::write_json(stat_data, viz[["location"]])
}
