#' @title Generate a spatial points data.frame for sites
#' 
#' @param viz a vizlab object that depends on a date, table of site stats, and table of discharge data
process.sites_to_sp <- function(viz){
  deps <- readDepends(viz)
  checkRequired(deps, 'sites')
  site_file <- dataRetrieval::readNWISsite(deps$sites)
  site_data <- select(site_file, site_no, STATEFP = state_cd, lon = dec_long_va, lat = dec_lat_va) %>% 
    filter(!is.na(lon), !is.na(lat))
  
  message('warning, removing NA lat/lon values...should filter those earlier?')
  coords <- cbind(site_data$lon, site_data$lat)
  sp_sites <- sp::SpatialPointsDataFrame(coords, site_data %>% select(-lat,-lon), proj4string=sp::CRS("+proj=longlat +datum=WGS84"))
  
  saveRDS(sp_sites, viz[["location"]])
}