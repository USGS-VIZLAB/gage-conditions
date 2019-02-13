pipeline {
    agent none 
    stages {
        stage('Checkout repo') {
            agent any 
            steps {
                sh 'wget -O DOIRootCA2.cer http://sslhelp.doi.net/docs/DOIRootCA2.cer'
                git "https://github.com/wdwatkins/water-use-15"
            }
        }
        stage('build viz') {
            agent {
                dockerfile {
                    args '-v ${WORKSPACE}:/home/rstudio/gage-conditions'
                } 
            }
            steps {
                sh 'mkdir target' 
                sh 'rscript -e vizlab::vizmake("dv_sites_sp"); remake::make(remake_file = "map_preprocess.yml"); Rscript -e vizlab::vizmake()'
            }
        }
        stage('push to S3') {
            agent any
            steps { 
                sh 'aws s3 sync ./target/ s3://dev-owi.usgs.gov/vizlab/water-use-15/ --exclude "*.svg" --exclude "*.json"; \
                    aws s3 sync ./target/ s3://dev-owi.usgs.gov/vizlab/water-use-15/ --exclude "*" --include "*.svg" --content-type "image/svg+xml"; \
                    aws s3 sync ./target/ s3://dev-owi.usgs.gov/vizlab/water-use-15/ --exclude "*" --include "*.json" --content-type "application/json"'
            }
        }
    }
}