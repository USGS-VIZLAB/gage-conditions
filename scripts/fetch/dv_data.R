fetchTimestamp.dv_data <- vizlab::alwaysCurrent

#' @title Download the discharge from NWIS for each dv gage
#' 
#' @param viz a vizlab object that depends on a vector of sites
fetch.dv_data <- function(viz){
  library(dataRetrieval)
  
  deps <- readDepends(viz)
  checkRequired(deps, c("date", "sites"))
  date <- deps[["date"]][["date"]]
  sites <- deps[["sites"]]
  
  dv_sites_data <- sapply(sites, FUN = function(x){
    d <- renameNWISColumns(
      readNWISdata(service="dv",
                   site = x,
                   parameterCd="00060",
                   startDate = date,
                   endDate = date))
    if (!is.null(d$Flow)){
      d$Flow
    } else {
      NA
    }
  })
  
  jsonlite::write_json(dv_sites_data, viz[["location"]])
}
