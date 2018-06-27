fetchTimestamp.dv_sites <- vizlab::alwaysCurrent

#' @title Fetch appropriate daily value sites from NWIS
#' 
#' @param viz a vizlab object that depends on the date
fetch.dv_sites <- function(viz){
  library(dataRetrieval)
  library(dplyr)
  
  deps <- readDepends(viz)
  checkRequired(deps, "year")
  year <- deps[["year"]][["year"]]
  
  startDate <- paste0(year, "-01-01")
  endDate <- paste0(year, "-12-31")
  hucs <- zeroPad(1:21, 2)
  
  sites <- c()
  for(huc in hucs){
    sites <- whatNWISdata(huc = huc, service = "dv", 
                          startDate = startDate,
                          endDate = endDate,
                          parameterCd = "00060", 
                          statCd = "00003") %>% 
      pull(site_no) %>% 
      c(sites)
  }
  
  jsonlite::write_json(sites, viz[["location"]])
}
