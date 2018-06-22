publish.webpacker <- function(viz) {
  
  system("npm run start")
   
  publish(list(location = viz[["location"]], mimetype = "application/javascript"))
  
}
