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
     
    stage('Building Source Code') {
      steps {
        sh 'npm install'
       
      }
    } 

    stage('Build') {
      steps {
        sh 'npm build'
       
      }
    } 
    
  }
}