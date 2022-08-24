pipeline {
  agent {
        docker {
            image 'node:lts-bullseye-slim' 
            args '-p 3000:3000' 
        }
    
  stages {
        
    stage('Git') {
      steps {
        git 'https://github.com/QNNAKWUE/Ecommerce-Nodejs.git'
      }
    }
     
    stage('Build') {
      steps {
        sh 'npm install'
         sh '<<Build Command>>'
      }
    }  
    
            
    stage('Test') {
      steps {
        sh 'node test'
      }
    }
  }
}