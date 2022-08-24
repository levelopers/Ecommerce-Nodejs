pipeline {
  agent any
    
  tools {
    nodejs '18.8.0'
  }
    
  stages {
        
    stage('Checkout Code From Git') {
      steps {
        git 'https://github.com/QNNAKWUE/Ecommerce-Nodejs.git'
      }
    }
     
    // stage('Building Source Code') {
    //   steps {
    //     sh 'npm install'
       
    //   }
    // } 

    stage ('Build') {
        //env.PATH = "/opt/jenkins/bin:${env.PATH}"
        catchError {
            // Install dependencies
            sh 'npm install'
            // Build assets with eg. webpack 
            sh 'npm run build'
    }
  }
    
  }
}