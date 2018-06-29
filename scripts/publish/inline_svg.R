publish.inline_svg <- function(viz) {
  svg <- xml2::read_xml(viz[["location"]])
  xml_string <- xml2::as_xml_document(svg)
  
  return(as.character(xml_string))
}
