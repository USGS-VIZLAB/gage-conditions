#' @param sp the full spatial object to be altered, w/ STATEFP attribute
#' @param ... named character argument for fields in `sp` to be scaled
#' @param scale a scale factor to apply to fips
#' @return an `sp` similar to the input, but with the specified fips scaled according to `scale` parameter
mutate_sp_coords <- function(sp, ..., scale, shift_x, shift_y, rotate){
  
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
    mutated_sp <- mutate_sp(tomutate_sp, scale = scale[i], shift = c(shift_x[i], shift_y[i]), rotate = rotate[i])
    sp_out <- rbind(sp[!(sp@data[[field]] %in% values[[i]]), ], mutated_sp)
    sp <- sp_out
  }
  
  return(sp_out)
}

scale_fit_sp_coords <- function(sp, range_x, range_y){
  
  sp_bbox <- sp::bbox(sp)
  
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
  
  sp_out <- mutate_sp(sp, scale = scale, shift = 0)
  # then shift to zero reference...
  sp_out <- elide(sp_out, shift=c(-bbox(sp_out)[1], -bbox(sp_out)[2]))
  
  return(sp_out)
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