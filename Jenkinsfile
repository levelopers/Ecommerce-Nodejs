pipeline {
  agent any
    
  tools {
    nodejs '18.8.0'
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
       
      }
    }  
    
  }
}