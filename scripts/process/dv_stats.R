#' @title Calculate the stat category for each gage's discharge value
#' 
#' @param viz a vizlab object that depends on a date, table of site stats, and table of discharge data
process.dv_stats <- function(viz){
  library(dplyr)
  
  deps <- readDepends(viz)
  checkRequired(deps, c("date", "site_stats", "data"))
  date <- deps[["date"]][["date"]]
  site_stats <- deps[["site_stats"]]
  data <- deps[["data"]]
  
  get_dv <- function(site_no){
    out <- rep(NA, length(site_no))
    for (i in 1:length(site_no)){
      val <- data[[site_no[i]]][1L]
      if (!is.null(val)){
        out[i] <- val
      }
    }
    return(out)
  }
  
  int_per <- function(p05_va, p10_va, p20_va, p25_va, p50_va, p75_va, p80_va, p95_va, dv_val){
    out <- rep(NA, length(dv_val))
    
    
    for (i in 1:length(out)){
      y <- c(0.05, 0.1, 0.2, 0.25, 0.5, 0.75, 0.8, 0.95)
      x <- c(p05_va[i], p10_va[i], p20_va[i], p25_va[i], p50_va[i], p75_va[i], p80_va[i], p95_va[i]) %>% as.numeric
      nas <- is.na(x)
      x <- x[!nas]
      y <- y[!nas]
      if (length(unique(x)) < 2){
        out[i] <- NA
      } else if (dv_val[i] < x[1L]){ # the first and last *have* to be numbers per filtering criteria
        out[i] <- 0.05
      } else if (dv_val[i] > tail(x, 1L)){
        out[i] <- 0.95
      } else {
        out[i] <- approx(x, y, xout = dv_val[i])$y
      }
    }
    return(out)
    
  }
  
  site_stats_viz <- site_stats %>% 
    filter(month_nu == as.numeric(format(as.Date(date), "%m")) & 
             day_nu == as.numeric(format(as.Date(date), "%d"))) %>% 
    mutate(dv_val = get_dv(site_no)) %>% 
    filter(!is.na(p05_va), !is.na(p95_va), !is.na(dv_val)) %>% 
    mutate(per = int_per(p05_va, p10_va, p20_va, p25_va, p50_va, p75_va, p80_va, p95_va, dv_val)) %>% 
    select(site_no, per)
  
  jsonlite::write_json(site_stats_viz, viz[["location"]])
}
