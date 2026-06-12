pipeline {
    agent any

    options {
        buildDiscarder(logRotator(numToKeepStr: '5'))
        timeout(time: 30, unit: 'MINUTES')
        disableConcurrentBuilds()
    }

    environment {
        DOCKER_USER = 'thelement012'
        FRONTEND_IMAGE = "${DOCKER_USER}/presupuesto-frontend"
        BACKEND_IMAGE = "${DOCKER_USER}/presupuesto-backend"
        IP_UNRAID = '192.168.100.3'
        DOCKER_BUILDKIT = '1'
    }

    stages {
        stage('Configure') {
            when {
                anyOf {
                    branch 'main'
                    branch 'staging'
                    branch 'production'
                }
            }
            steps {
                script {
                    def envConfig = [
                        production: [backendPort: '5003', frontendPort: '6969', dbSuffix: '',        viteApiUrl: '',                         pushLatest: 'true'],
                        staging:    [backendPort: '5004', frontendPort: '6971', dbSuffix: '_staging', viteApiUrl: "http://${IP_UNRAID}:5004", pushLatest: 'false'],
                        main:       [backendPort: '5005', frontendPort: '6970', dbSuffix: '_dev',     viteApiUrl: "http://${IP_UNRAID}:5005", pushLatest: 'false'],
                    ]
                    def cfg = envConfig[env.BRANCH_NAME]

                    env.BRANCH_TAG    = env.BRANCH_NAME.replace('/', '-')
                    env.NUMERIC_TAG   = env.BUILD_NUMBER
                    env.BACKEND_PORT  = cfg.backendPort
                    env.FRONTEND_PORT = cfg.frontendPort
                    env.DB_NAME       = "presupuesto_mensual${cfg.dbSuffix}"
                    env.VITE_API_URL  = cfg.viteApiUrl
                    env.PUSH_LATEST   = cfg.pushLatest
                    env.NETWORK_NAME  = "presupuesto-net-${env.BRANCH_TAG}"

                    echo "[CONFIG] branch=${env.BRANCH_NAME} backend=${env.BACKEND_PORT} frontend=${env.FRONTEND_PORT} db=${env.DB_NAME} viteApiUrl='${env.VITE_API_URL}' network=${env.NETWORK_NAME} pushLatest=${env.PUSH_LATEST}"
                }
            }
        }

        stage('Init Database') {
            when {
                anyOf {
                    branch 'main'
                    branch 'staging'
                    branch 'production'
                }
            }
            steps {
                withCredentials([usernamePassword(credentialsId: 'unraid-db-creds', usernameVariable: 'DB_ADMIN_USER', passwordVariable: 'DB_ADMIN_PASS')]) {
                    sh '''
                        echo "[DB] Inicializando $DB_NAME"
                        docker exec taller-mariadb mariadb -u "$DB_ADMIN_USER" -p"$DB_ADMIN_PASS" -e "CREATE DATABASE IF NOT EXISTS $DB_NAME"
                        tail -n +3 server/db.sql | docker exec -i taller-mariadb mariadb -u "$DB_ADMIN_USER" -p"$DB_ADMIN_PASS" "$DB_NAME"
                    '''
                }
            }
        }

        stage('Build & Test') {
            when {
                anyOf {
                    branch 'main'
                    branch 'staging'
                    branch 'production'
                }
            }
            parallel {
                stage('Lint Frontend') {
                    steps {
                        sh '''
                            docker run --rm -v "$(pwd)/presupuesto:/app" -w /app node:20-alpine \
                                sh -c "npm ci && npm run lint"
                        '''
                    }
                }
                stage('Build Backend Image') {
                    steps {
                        sh '''
                            docker build -t $BACKEND_IMAGE:$BRANCH_TAG ./server
                            docker tag $BACKEND_IMAGE:$BRANCH_TAG $BACKEND_IMAGE:$NUMERIC_TAG
                            if [ "$PUSH_LATEST" = "true" ]; then
                                docker tag $BACKEND_IMAGE:$BRANCH_TAG $BACKEND_IMAGE:latest
                            fi
                        '''
                    }
                }
                stage('Build Frontend Image') {
                    steps {
                        sh '''
                            docker build --build-arg VITE_API_URL="$VITE_API_URL" -t $FRONTEND_IMAGE:$BRANCH_TAG ./presupuesto
                            docker tag $FRONTEND_IMAGE:$BRANCH_TAG $FRONTEND_IMAGE:$NUMERIC_TAG
                            if [ "$PUSH_LATEST" = "true" ]; then
                                docker tag $FRONTEND_IMAGE:$BRANCH_TAG $FRONTEND_IMAGE:latest
                            fi
                        '''
                    }
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
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', passwordVariable: 'DOCKER_PASS', usernameVariable: 'DOCKER_USER_CREDS')]) {
                    sh '''
                        mkdir -p .docker
                        export DOCKER_CONFIG=$(pwd)/.docker
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER_CREDS" --password-stdin

                        docker push $BACKEND_IMAGE:$BRANCH_TAG
                        docker push $BACKEND_IMAGE:$NUMERIC_TAG
                        docker push $FRONTEND_IMAGE:$BRANCH_TAG
                        docker push $FRONTEND_IMAGE:$NUMERIC_TAG

                        if [ "$PUSH_LATEST" = "true" ]; then
                            docker push $BACKEND_IMAGE:latest
                            docker push $FRONTEND_IMAGE:latest
                        fi
                    '''
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
                withCredentials([usernamePassword(credentialsId: 'unraid-db-creds', usernameVariable: 'DB_ADMIN_USER', passwordVariable: 'DB_ADMIN_PASS')]) {
                    sh '''
                        docker pull $BACKEND_IMAGE:$BRANCH_TAG
                        docker pull $FRONTEND_IMAGE:$BRANCH_TAG

                        docker network create $NETWORK_NAME || true

                        docker stop presupuesto-backend-$BRANCH_TAG || true
                        docker rm presupuesto-backend-$BRANCH_TAG || true
                        docker stop presupuesto-frontend-$BRANCH_TAG || true
                        docker rm presupuesto-frontend-$BRANCH_TAG || true

                        docker run -d --name presupuesto-backend-$BRANCH_TAG \
                            --network $NETWORK_NAME \
                            --network-alias backend \
                            --restart unless-stopped \
                            -p $BACKEND_PORT:5000 \
                            -e DB_HOST=$IP_UNRAID \
                            -e DB_PORT=3307 \
                            -e DB_USER=$DB_ADMIN_USER \
                            -e DB_PASS=$DB_ADMIN_PASS \
                            -e DB_NAME=$DB_NAME \
                            -e PORT=5000 \
                            $BACKEND_IMAGE:$BRANCH_TAG

                        docker run -d --name presupuesto-frontend-$BRANCH_TAG \
                            --network $NETWORK_NAME \
                            --restart unless-stopped \
                            -p $FRONTEND_PORT:8080 \
                            $FRONTEND_IMAGE:$BRANCH_TAG
                    '''
                }
            }
        }

        stage('Smoke Test') {
            when {
                anyOf {
                    branch 'main'
                    branch 'staging'
                    branch 'production'
                }
            }
            steps {
                sh '''
                    sleep 10
                    curl -sf http://localhost:$BACKEND_PORT/ > /dev/null || (echo "[SMOKE] Backend no responde" && exit 1)
                    curl -sf http://localhost:$FRONTEND_PORT/ > /dev/null || (echo "[SMOKE] Frontend no responde" && exit 1)
                    curl -sf http://localhost:$FRONTEND_PORT/api/config > /dev/null || (echo "[SMOKE] Proxy frontend->backend no responde" && exit 1)
                    echo "[SMOKE] OK"
                '''
            }
        }
    }

    post {
        always {
            sh '''
                export DOCKER_CONFIG=$(pwd)/.docker
                docker logout || true
                rm -rf .docker || true
            '''
        }
        failure {
            echo "[FAIL] Pipeline falló para ${env.BRANCH_NAME}"
        }
        success {
            echo "[SUCCESS] Pipeline completado para ${env.BRANCH_NAME}"
        }
    }
}
