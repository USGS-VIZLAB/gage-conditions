#!/bin/bash
set -x
viz_folder_name=$1  #make this container_name or something
#first build image and create container 
docker start ${viz_folder_name}
docker cp ./. ${viz_folder_name}:/home/rstudio/${viz_folder_name}
docker exec ${viz_folder_name} Rscript -e 'vizlab::vizmake()'
docker cp ${viz_folder_name}:/home/rstudio/${viz_folder_name}/. .
docker stop ${viz_folder_name}
