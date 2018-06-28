#' @param sp the full spatial object to be altered, w/ STATEFP attribute
#' @param ... named character argument for fields in `sp` to be scaled
#' @param scale a scale factor to apply to fips
#' @return an `sp` similar to the input, but with the specified fips scaled according to `scale` parameter
mutate_sp_coords <- function(sp, ..., scale, shift_x, shift_y, rotate, ref = sp){
  
  args <- list(...)
  field <- names(args)
  if (length(field) != 1){
    stop(args, ' was not valid')
  }
  # we can specify a single "field" name that is an attribute of the spatial data (e.g., STATEFP)
  # that "field" can have multiple values (e.g, "02" and "71") that we'll apply "scale" to. 
  # here we test that the length of "scale" is equal to the length of the values:
  values <- args[[1]]
  
  for (i in 1:length(values)){
    tomutate_sp <- sp[sp@data[[field]] %in% values[[i]], ]
    tomutate_ref <- ref[ref@data[[field]] %in% values[[i]], ]
    mutated_sp <- mutate_sp(tomutate_sp, scale = scale[i], shift = c(shift_x[i], shift_y[i]), rotate = rotate[i], ref = tomutate_ref)
    if (inherits(sp, 'SpatialPoints')){
      # had to do this to retain order...sp...shrug
      sp_points <- as(sp, "SpatialPoints")
      sp_data <- sp@data
      sp_points_mutated <- as(mutated_sp, "SpatialPoints")
      sp_data_mutated <- mutated_sp@data
      sp_out <- rbind(sp_points[!sp_data[[field]] %in% values[[i]], ], sp_points_mutated)
      sp_data <- rbind(sp_data[!sp_data[[field]] %in% values[[i]], ], sp_data_mutated)
      row.names(sp_data) <- seq(1:nrow(sp_data))
      
      sp_out <- SpatialPointsDataFrame(sp_out, data = sp_data)
      
    } else {
      sp_out <- rbind(sp[!(sp@data[[field]] %in% values[[i]]), ], mutated_sp)
    }
    
    sp <- sp_out
  }
  
  return(sp_out)
}

scale_fit_sp_coords <- function(sp, range_x, range_y, ref = sp){
  
  sp_bbox <- sp::bbox(ref)
  
  sp_range_x <- diff(sp_bbox[c(1,3)])
  sp_range_y <- diff(sp_bbox[c(2,4)])
  
  aspect_sp <- sp_range_x / sp_range_y
  aspect_fit <- range_x / range_y
  
  if (aspect_fit < aspect_sp){
    # x is limiting
    scale <- range_x / sp_range_x
  } else {
    # y is limiting
    scale <- range_y / sp_range_y
  }
  
  sp_out <- mutate_sp(sp, scale = scale, shift = 0, ref = ref)
  ref_out <- mutate_sp(ref, scale = scale, shift = 0)
  # then shift to zero reference...
  sp_out <- elide(sp_out, shift=c(-bbox(ref_out)[1], -bbox(ref_out)[2]))
  sp_out <- flip_sp_vertically(sp_out, range_y)
  return(sp_out)
}

geo2svg <- function(geojson_filepath, svg_filepath, w, h){
  #tempjson <- file.path(tempdir(), 'temp.json')
  #system(sprintf("ndjson-split 'd.features' \
  #  < %s \
  #  > %s", geojson_filepath, tempjson))
  
  system(sprintf('geo2svg -w %s -h %s < %s > %s', w, h, geojson_filepath, svg_filepath))
  
}

flip_sp_vertically <- function(sp, h){
  
  if (inherits(sp, 'SpatialPolygons')){
    for (j in 1:length(sp@polygons)){
      for (i in 1:length(sp@polygons[[j]]@Polygons)){
        sp@polygons[[j]]@Polygons[[i]]@coords[,2] <- h-sp@polygons[[j]]@Polygons[[i]]@coords[,2]
      }
      
    }
  } else if (inherits(sp, 'SpatialPoints')){
    sp@coords[,2] <- h-sp@coords[,2]
  }
  
  return(sp)
}

mutate_sp <- function(sp, scale = NULL, shift = NULL, rotate = 0, ref=sp, proj.string=NULL, row.names=NULL){
  

  if (is.null(scale) & is.null(shift) & rotate == 0){
    return(obj)
  }
  
  orig.cent <- colMeans(rgeos::gCentroid(ref, byid=TRUE)@coords)
  scale <- max(apply(bbox(ref), 1, diff)) * scale
  obj <- elide(sp, rotate=rotate, center=orig.cent, bb = bbox(ref))
  ref <- elide(ref, rotate=rotate, center=orig.cent, bb = bbox(ref))
  obj <- elide(obj, scale=scale, center=orig.cent, bb = bbox(ref))
  ref <- elide(ref, scale=scale, center=orig.cent, bb = bbox(ref))
  new.cent <- colMeans(rgeos::gCentroid(ref, byid=TRUE)@coords)
  obj <- elide(obj, shift=shift*10000+c(orig.cent-new.cent))
  
  if (is.null(proj.string)){
    proj4string(obj) <- proj4string(sp)
  } else {
    proj4string(obj) <- proj.string
  }
  
  if (!is.null(row.names)){
    row.names(obj) <- row.names
  }
  
  return(obj)
}