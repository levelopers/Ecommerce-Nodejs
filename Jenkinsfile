pipeline {
  agent any
    
  tools {
    nodejs '18.8.0'
  }
    
  stages {
        
<<<<<<< HEAD
    stage('Fetch Code from Github') {
=======
    stage('Checkout Code From Git') {
>>>>>>> master
      steps {
        git branch: 'master' url: 'https://github.com/QNNAKWUE/Ecommerce-Nodejs.git'
      }
    }
     
    stage('Build') {
      steps {
        sh 'npm install'
      }
    
    stage('Test') {
      steps {
        sh 'npm test'
      }
    }
    }  
    
  }
}