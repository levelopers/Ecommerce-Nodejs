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
    }
     
    stage('Install dependencies') {
        steps {
            echo 'Installing dependencies...'
            sh 'rm -rf node_modules package-lock.json && npm install'
        }
}
    stage('Build') {
        steps {
            sh 'npm build'
        }
}
    stage ('Static Analysis') {
        steps {
            sh ' ./node_modules/eslint/bin/eslint.js -f checkstyle src > eslint.xml'
        }
        post {
            always {
                recordIssues enabledForFailure: true, aggregatingResults: true, tool: checkStyle(pattern: 'eslint.xml')
            }
        }
    }
}

}

// # Path parameters
// export metric_id="n.name"

// curl -X DELETE "https://api.datadoghq.com/api/v2/logs/config/metrics/${n.name}" \
// -H "Accept: application/json" \
// -H "DD-API-KEY: ${DD_API_KEY}" \
// -H "DD-APPLICATION-KEY: ${DD_APP_KEY}"

