fetchTimestamp.dv_data <- vizlab::alwaysCurrent

#' @title Download the discharge from NWIS for each dv gage
#' 
#' @param viz a vizlab object that depends on a vector of sites
fetch.dv_data <- function(viz){
  library(dataRetrieval)
  
  deps <- readDepends(viz)
  checkRequired(deps, c("year", "sites"))
  year <- deps[["year"]][["year"]]
  sites <- deps[["sites"]]
  
  startDate <- paste0(year, "-01-01")
  endDate <- paste0(year, "-12-31")
  
  dv_sites_data <- lapply(sites, FUN = function(x){
    d <- renameNWISColumns(
      readNWISdata(service="dv",
                   site = x,
                   parameterCd="00060",
                   startDate = startDate,
                   endDate = endDate))
    if(nrow(d) > 0 && any(names(d) == "Flow")) {
      d[, c("dateTime", "Flow")]
    } else {
      NULL
    }
  })
  
  names(dv_sites_data) <- sites
  
  jsonlite::write_json(dv_sites_data, viz[["location"]])
}
