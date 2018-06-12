fetchTimestamp.dv_sites <- vizlab::alwaysCurrent

#' @title Fetch appropriate daily value sites from NWIS
#' 
#' @param viz a vizlab object that depends on the date
fetch.dv_sites <- function(viz){
  library(dataRetrieval)
  
  deps <- readDepends(viz)
  checkRequired(deps, "date")
  date <- deps[["date"]][["date"]]
  
  hucs <- zeroPad(1:21, 2)
  
  sites <- c()
  for(huc in hucs){
    sites <- whatNWISdata(huc = huc, service = "dv", 
                          startDate = date,
                          parameterCd = "00060", 
                          statCd = "00003") %>% 
      .$site_no %>% 
      c(sites)
  }
  
  jsonlite::write_json(sites, viz[["location"]])
}
