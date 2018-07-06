# copied most of this function from vizlab:::readData.shp. can't directly reuse
# that function here because it requires viz syntax. Also, we'll use this function to filter out territories for which we don't have water use data
#' @param skip a list with the field name and the values to skip
read_shp_zip <- function(zipfile, skip = NULL) {
  
  # unzip the file into a temporary location
  shp_path <- file.path(tempdir(), 'tmp')
  if (!dir.exists(shp_path)){
    dir.create(shp_path)
  }
  unzip(zipfile, exdir = shp_path)
  
  # identify the layer (assumes there's exactly one)
  layer <- tools::file_path_sans_ext(list.files(shp_path, pattern='*.shp'))[1]
  
  # read the layer from the shapefile
  data_out <- rgdal::readOGR(shp_path, layer=layer, verbose=FALSE)
  
  if (!is.null(skip) & length(skip) != 1){
    stop('skip must be a list of length one if specified.')
  }
  
  if (!is.null(skip)){
    # filter out any field attribute matches we want to skip
    data_out <- data_out[!(data_out@data[[names(skip)[1]]] %in% skip[[1]]), ]
  }
  
  
  # clean up and return
  unlink(shp_path, recursive = TRUE)
  return(data_out)  
}

