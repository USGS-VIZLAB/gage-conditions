#' @title Calculate the stat category for each gage's discharge value
#' 
#' @param viz a vizlab object that depends on a date, table of site stats, and table of discharge data
process.dv_stats <- function(viz){
  library(dplyr)
  
  deps <- readDepends(viz)
  checkRequired(deps, c("year", "monthday", "site_stats", "data", "percentiles"))
  year <- deps[["year"]][["year"]]
  monthday <- deps[["monthday"]][["monthday"]]
  site_stats <- deps[["site_stats"]]
  data <- deps[["data"]]
  stat_types <- deps[["percentiles"]][["percentiles"]]
  
  date <- paste0(year, "-", monthday)
  
  stat_colnames <- sprintf("p%s_va", stat_types)
  stat_perc <- as.numeric(stat_types)/100
  
  get_dv <- function(site_no){
    out <- rep(NA, length(site_no))
    for (i in 1:length(site_no)){
      data_site <- data[[site_no[i]]]
      if (!is.null(data_site) && length(data_site) > 0 && 
            "Flow" %in% names(data_site)){
        # this assumes dateTime comes back as character
        data_date <- filter(data_site, dateTime == date)
        if (nrow(data_date) != 0){
          out[i] <- data_date[["Flow"]]
        }
      }
    }
    return(out)
  }
  
  int_per <- function(df){
    df <- select(df, "dv_val", one_of(stat_colnames))
    out <- rep(NA, nrow(df))
    
    for (i in 1:length(out)){
      dv_val <- df$dv_val[i]
      
      df_i <- slice(df, i) %>% 
        select(-dv_val) %>% 
        tidyr::gather(stat_name, stat_value) %>% 
        mutate(stat_value = as.numeric(stat_value),
               stat_type = as.numeric(gsub("p|_va", "", stat_name))/100)
      
      y <- df_i$stat_type
      x <- df_i$stat_value
      nas <- is.na(x)
      x <- x[!nas]
      y <- y[!nas]
      if (length(unique(x)) < 2){
        out[i] <- NA
      } else if (dv_val < x[1L]){ # the first and last *have* to be numbers per filtering criteria
        out[i] <- head(stat_perc, 1)
      } else if (dv_val > tail(x, 1L)){
        out[i] <- tail(stat_perc, 1)
      } else {
        out[i] <- approx(x, y, xout = dv_val)$y
      }
    }
    return(out)
    
  }
  
  site_stats_viz <- site_stats %>% 
    filter(month_nu == as.numeric(format(as.Date(date), "%m")) & 
             day_nu == as.numeric(format(as.Date(date), "%d"))) %>% 
    mutate(dv_val = get_dv(site_no)) %>% 
    filter_(sprintf("!is.na(%s)", stat_colnames[1]), 
            sprintf("!is.na(%s)", tail(stat_colnames,1)), 
            sprintf("!is.na(%s)", "dv_val")) %>%
    mutate(per = int_per(.)) %>% 
    select(site_no, per)
  
  jsonlite::write_json(site_stats_viz, viz[["location"]])
}
