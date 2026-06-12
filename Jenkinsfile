pipeline {
    agent any

    environment {
        DOCKER_HUB = 'thelement012'
        IMAGE_TAG = "${BUILD_NUMBER}"
        PROJECT_DIR = '/mnt/user/appdata/PresupuestoProject'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Backend') {
            steps {
                sh 'docker build -t ${DOCKER_HUB}/presupuesto-backend:${IMAGE_TAG} ./server'
                sh 'docker tag ${DOCKER_HUB}/presupuesto-backend:${IMAGE_TAG} ${DOCKER_HUB}/presupuesto-backend:latest'
            }
        }

        stage('Build Frontend') {
            steps {
                sh 'docker build --build-arg VITE_API_URL= -t ${DOCKER_HUB}/presupuesto-frontend:${IMAGE_TAG} ./presupuesto'
                sh 'docker tag ${DOCKER_HUB}/presupuesto-frontend:${IMAGE_TAG} ${DOCKER_HUB}/presupuesto-frontend:latest'
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withDockerRegistry([credentialsId: 'docker-hub', url: '']) {
                    sh 'docker push ${DOCKER_HUB}/presupuesto-backend:${IMAGE_TAG}'
                    sh 'docker push ${DOCKER_HUB}/presupuesto-backend:latest'
                    sh 'docker push ${DOCKER_HUB}/presupuesto-frontend:${IMAGE_TAG}'
                    sh 'docker push ${DOCKER_HUB}/presupuesto-frontend:latest'
                }
            }
        }

        stage('Deploy on unRAID') {
            steps {
                sh '''
                    cd ${PROJECT_DIR}
                    docker compose -f docker-compose.yml -f docker-compose.deploy.yml pull
                    docker compose -f docker-compose.yml -f docker-compose.deploy.yml up -d
                '''
            }
        }
    }

    post {
        failure {
            echo "Pipeline falló. Revisa los logs para más detalles."
        }
        success {
            echo "Despliegue completado exitosamente."
        }
    }
}
