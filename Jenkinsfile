pipeline {
  agent any
    
  tools {
    nodejs '18.8.0'
  }
    
  stages {
        
    stage('Fetch Code') { 
      steps {
        git branch: 'master', url: 'https://github.com/QNNAKWUE/Ecommerce-Nodejs.git'
      }
      // post {
      //   success {
      //     echo "Now Archiving."
      //     archiveArtifacts artifacts: '**/*.war' 
      //   }
      // }
    }
     
    stage('Build') {
      steps {
        sh 'npm install'
      }
    }

    stage ('Checkstyle Analysis'){
      steps {
        sh 'npm checkstyle:checkstyle'
      }
    }
    // stage('Test') {
    //   steps {
    //     sh 'npm test'
    //   }
    // }
     
    
  }
}