# tagged version, not latest! 
FROM rocker/geospatial:3.5.2 

# install node and npm (see https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions)
RUN sudo apt-get install -y curl &&\
  sudo apt-get install -y gnupg &&\
  curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash - &&\
  sudo apt-get update &&\
  sudo apt-get install -y nodejs &&\
  sudo apt-get install -y build-essential

RUN sudo npm install -g\
  webpack\
  webpack-cli\
  d3-geo-projection

# for use when building the docker image: mapping to this docker-building repo
#RUN mkdir /home/rstudio/gage-conditions-docker
#VOLUME /home/rstudio/gage-conditions-docker

# for use when developing the vizzy project: volume mapping
# allows you to directly edit the project files on your computer
#RUN mkdir /home/rstudio/gage-conditions
#VOLUME /home/rstudio/gage-conditions
#bring in DOI root cert
COPY DOIRootCA2.cer /usr/lib/ssl/certs/DOIRootCA.crt
RUN  ln -sf /usr/lib/ssl/certs/DOIRootCA.crt /usr/lib/ssl/certs/`openssl x509 -hash -noout -in /usr/lib/ssl/certs/DOIRootCA.crt`.0 && \
     echo "\\n\\nca-certificate = /usr/lib/ssl/certs/DOIRootCA.crt" >> /etc/wgetrc; 
ARG build_trigger=change_this_to_rebuild
RUN Rscript -e 'installed.packages()'
#Note that version rocker images are already set up to use the MRAN mirror corresponding to the 
#date of the R version, so package dates are already set (unless forcing another repo)
RUN Rscript -e  'devtools::install_github("richfitz/remake")' && \
    Rscript -e  'install.packages("grithub", repos = c(getOption("repos"), "https://owi.usgs.gov/R"))' && \
    Rscript -e 	'devtools::install_github("USGS-VIZLAB/vizlab@v0.3.11")' 
    #note that most common packages will already be installed as part of the geospatial image	
RUN    install2.r --error \
	sbtools \
	geojsonio \
	dataRetrieval\
	bit64
	 		                    
RUN mkdir /home/rstudio/gage-conditions
RUN chown rstudio /home/rstudio/gage-conditions
WORKDIR /home/rstudio/gage-conditions
#CMD ["bash"]

