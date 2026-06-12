pipeline {
    agent any

    options {
        buildDiscarder(logRotator(numToKeepStr: '5'))
    }

    environment {
        DOCKER_USER = 'thelement012'
        FRONTEND_IMAGE = "${DOCKER_USER}/presupuesto-frontend"
        BACKEND_IMAGE = "${DOCKER_USER}/presupuesto-backend"
        IP_UNRAID = '192.168.100.3'
    }

    stages {
        stage('Init Database') {
            when {
                anyOf {
                    branch 'main'
                    branch 'staging'
                    branch 'production'
                }
            }
            steps {
                script {
                    def dbSuffix = ''
                    if (env.BRANCH_NAME == 'main') {
                        dbSuffix = '_dev'
                    } else if (env.BRANCH_NAME == 'staging') {
                        dbSuffix = '_staging'
                    }
                    def dbName = "presupuesto_mensual${dbSuffix}"

                    echo "[DB] Inicializando ${dbName}"
                    sh "docker exec taller-mariadb mariadb -u admin -padminpassword -e 'CREATE DATABASE IF NOT EXISTS ${dbName}'"
                    sh "docker exec -i taller-mariadb mariadb -u admin -padminpassword ${dbName} < server/db.sql"
                }
            }
        }
        stage('Build & Tag') {
            when {
                anyOf {
                    branch 'main'
                    branch 'staging'
                    branch 'production'
                }
            }
            steps {
                script {
                    def branchTag = env.BRANCH_NAME.replace('/', '-')
                    def numericTag = "${env.BUILD_NUMBER}"

                    def backendPort = '5000'
                    if (env.BRANCH_NAME == 'main') {
                        backendPort = '5001'
                    } else if (env.BRANCH_NAME == 'staging') {
                        backendPort = '5002'
                    }

                    def viteApiUrl = ""
                    if (env.BRANCH_NAME == 'production') {
                        viteApiUrl = ""
                    } else if (env.BRANCH_NAME == 'staging') {
                        viteApiUrl = "http://${IP_UNRAID}:${backendPort}"
                    } else {
                        viteApiUrl = "http://${IP_UNRAID}:${backendPort}"
                    }

                    echo "[BUILD] Backend - tag: ${branchTag}"
                    sh "docker build -t ${BACKEND_IMAGE}:${branchTag} ./server"
                    sh "docker tag ${BACKEND_IMAGE}:${branchTag} ${BACKEND_IMAGE}:${numericTag}"
                    sh "docker tag ${BACKEND_IMAGE}:${branchTag} ${BACKEND_IMAGE}:latest"

                    echo "[BUILD] Frontend - VITE_API_URL=${viteApiUrl} - tag: ${branchTag}"
                    sh "docker build --build-arg VITE_API_URL=${viteApiUrl} -t ${FRONTEND_IMAGE}:${branchTag} ./presupuesto"
                    sh "docker tag ${FRONTEND_IMAGE}:${branchTag} ${FRONTEND_IMAGE}:${numericTag}"
                    sh "docker tag ${FRONTEND_IMAGE}:${branchTag} ${FRONTEND_IMAGE}:latest"
                }
            }
        }

        stage('Push to Docker Hub') {
            when {
                anyOf {
                    branch 'main'
                    branch 'staging'
                    branch 'production'
                }
            }
            steps {
                script {
                    echo '[PUSH] Subiendo imagenes a Docker Hub...'
                    withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', passwordVariable: 'DOCKER_PASS', usernameVariable: 'DOCKER_USER_CREDS')]) {
                        sh 'mkdir -p .docker'
                        sh "export DOCKER_CONFIG=\$(pwd)/.docker && echo \$DOCKER_PASS | docker login -u \$DOCKER_USER_CREDS --password-stdin"

                        def branchTag = env.BRANCH_NAME.replace('/', '-')
                        def numericTag = "${env.BUILD_NUMBER}"

                        def images = [
                            "${BACKEND_IMAGE}:${branchTag}",
                            "${BACKEND_IMAGE}:${numericTag}",
                            "${BACKEND_IMAGE}:latest",
                            "${FRONTEND_IMAGE}:${branchTag}",
                            "${FRONTEND_IMAGE}:${numericTag}",
                            "${FRONTEND_IMAGE}:latest"
                        ]
                        images.each { img ->
                            sh "export DOCKER_CONFIG=\$(pwd)/.docker && docker push ${img}"
                        }
                    }
                }
            }
        }

        stage('Deploy') {
            when {
                anyOf {
                    branch 'main'
                    branch 'staging'
                    branch 'production'
                }
            }
            steps {
                script {
                    def branchTag = env.BRANCH_NAME.replace('/', '-')
                    def backendPort = '5000'
                    def frontendPort = '6969'
                    def dbSuffix = ''

                    if (env.BRANCH_NAME == 'main') {
                        backendPort = '5001'
                        frontendPort = '6970'
                        dbSuffix = '_dev'
                    } else if (env.BRANCH_NAME == 'staging') {
                        backendPort = '5002'
                        frontendPort = '6971'
                        dbSuffix = '_staging'
                    }

                    echo "[DEPLOY] Desplegando ${env.BRANCH_NAME} (backend:${backendPort}, frontend:${frontendPort})"

                    sh "docker pull ${BACKEND_IMAGE}:${branchTag}"
                    sh "docker pull ${FRONTEND_IMAGE}:${branchTag}"

                    // Backend
                    sh "docker stop presupuesto-backend-${branchTag} || true"
                    sh "docker rm presupuesto-backend-${branchTag} || true"
                    sh """
                        docker run -d --name presupuesto-backend-${branchTag} \
                            -p ${backendPort}:5000 \
                            -e DB_HOST=${IP_UNRAID} \
                            -e DB_PORT=3307 \
                            -e DB_USER=admin \
                            -e DB_PASS=adminpassword \
                            -e DB_NAME=presupuesto_mensual${dbSuffix} \
                            -e PORT=5000 \
                            ${BACKEND_IMAGE}:${branchTag}
                    """

                    // Frontend
                    sh "docker stop presupuesto-frontend-${branchTag} || true"
                    sh "docker rm presupuesto-frontend-${branchTag} || true"
                    sh """
                        docker run -d --name presupuesto-frontend-${branchTag} \
                            -p ${frontendPort}:80 \
                            --add-host host.docker.internal:host-gateway \
                            ${FRONTEND_IMAGE}:${branchTag}
                    """
                }
            }
        }
    }

    post {
        failure {
            echo "[FAIL] Pipeline falló para ${env.BRANCH_NAME}"
        }
        success {
            echo "[SUCCESS] Pipeline completado para ${env.BRANCH_NAME}"
        }
    }
}
