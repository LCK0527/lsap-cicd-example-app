pipeline {
    agent any
    
    environment {
        // 設定環境變數
        DOCKER_CREDS = 'docker-hub-credentials' // 剛剛在 Jenkins 設定的 ID
        DOCKER_USER = 'lck0527'
        IMAGE_NAME = "${DOCKER_USER}/cicd"
        DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/1444647990399602780/cZsKcbwfXv3rENUDNLxtde5Zu9XZEACGU1RdGam9HB9qaDFn0HH-DLeWlOxEyRo1PEim'
        
        // 個人資訊 (用於通知)
        MY_NAME = "林仲鎧" 
        MY_STUDENT_ID = "b12705052"
    }
    stages {
        // Part 1: CI & Quality Gate
        stage('Static Analysis') {
            steps {
                echo 'Running Linting...'
                sh 'npm install'
                sh 'npm run lint' // 執行 package.json 中的 lint 指令
            }
        }
        // Part 2: CD Staging (Only on 'dev' branch)
        stage('Staging Deployment') {
            when {
                branch 'dev'
            }
            steps {
                script {
                    echo 'Deploying to Staging Environment...'
                    def devTag = "dev-${env.BUILD_NUMBER}" 
                    
                    // 1. Build & Push
                    docker.withRegistry('', DOCKER_CREDS) {
                        def appImage = docker.build("${IMAGE_NAME}:${devTag}")
                        appImage.push()
                    }
                    
                    // 2. Cleanup old container (|| true 避免如果容器不存在導致失敗)
                    sh 'docker rm -f dev-app || true'
                    
                    // 3. Deploy on Port 8081
                    sh "docker run -d -p 8081:8080 --name dev-app ${IMAGE_NAME}:${devTag}"
                    
                    // 4. Verify Health
                    sleep 5 // 等待容器啟動
                    sh 'curl -f http://localhost:8081/health'
                }
            }
        }
        // Part 2: CD Production / GitOps (Only on 'main' branch)
        stage('Production Deployment (GitOps)') {
            when {
                branch 'main'
            }
            steps {
                script {
                    echo 'Starting GitOps Promotion...'
                    
                    // 1. Read Configuration
                    // 假設 deploy.config 內容格式單純為 "dev-15"
                    def TARGET_TAG = sh(script: "cat deploy.config", returnStdout: true).trim()
                    echo "Promoting version: ${TARGET_TAG}"
                    
                    // 2. Artifact Promotion
                    docker.withRegistry('', DOCKER_CREDS) {
                        // Pull 指定版本
                        sh "docker pull ${IMAGE_NAME}:${TARGET_TAG}"
                        
                        // Retag 為 prod-BUILD_NUMBER
                        def prodTag = "prod-${env.BUILD_NUMBER}"
                        sh "docker tag ${IMAGE_NAME}:${TARGET_TAG} ${IMAGE_NAME}:${prodTag}"
                        
                        // Push 新的 production tag
                        sh "docker push ${IMAGE_NAME}:${prodTag}"
                        
                        // 3. Deploy Cleanup
                        sh 'docker rm -f prod-app || true'
                        
                        // 4. Deploy on Port 8082
                        sh "docker run -d -p 8082:8080 --name prod-app ${IMAGE_NAME}:${prodTag}"
                    }
                }
            }
        }
    }
    // ChatOps: 通知設定
    post {
        failure {
            script {
                def payload = """
                {
                    "content": "🚨 **Build Failed!** 🚨\\n**Name:** ${env.MY_NAME}\\n**ID:** ${env.MY_STUDENT_ID}\\n**Job:** ${env.JOB_NAME}\\n**Build:** ${env.BUILD_NUMBER}\\n**Repo:** ${env.GIT_URL}\\n**Branch:** ${env.BRANCH_NAME}\\n**Status:** ${currentBuild.currentResult}"
                }
                """
                // 使用 curl 發送 Discord Webhook
                sh "curl -H \"Content-Type: application/json\" -d '${payload}' ${DISCORD_WEBHOOK}"
            }
        }
    }
}

