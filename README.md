# DevOps Final Project

這是一個完整的 CI/CD 專案，使用 Jenkins、Docker 和 GitOps 流程。

## 專案結構

```
.
├── app.js              # Express 應用程式（包含 /health 端點）
├── Dockerfile          # Docker 映像檔定義
├── Jenkinsfile         # Jenkins Pipeline 定義
├── deploy.config       # GitOps 配置檔案（Production 環境的真理來源）
├── package.json        # Node.js 專案配置
├── eslint.config.js    # ESLint 配置
└── .gitignore         # Git 忽略檔案
```

## 設定步驟

### 1. 修改 Jenkinsfile

在 `Jenkinsfile` 中，請修改以下變數：

- `DOCKER_USER`: 替換為你的 Docker Hub 使用者名稱
- `DISCORD_WEBHOOK`: 替換為你的 Discord Webhook URL
- `MY_NAME`: 你的姓名
- `MY_STUDENT_ID`: 你的學號

### 2. Jenkins 設定

1. **設定 Docker Hub 憑證**
   - 進入 Jenkins Dashboard → Manage Jenkins → Credentials
   - 新增 Username with password 類型的憑證
   - ID 設為 `docker-hub-credentials`
   - 輸入你的 Docker Hub 帳號和密碼

2. **建立 Multibranch Pipeline**
   - 建立新的 Multibranch Pipeline Job
   - 設定 GitHub Repository URL
   - Jenkins 會自動發現分支並執行 Pipeline

### 3. 本地測試

```bash
# 執行 Lint
npm run lint

# 啟動應用程式
npm start

# 測試 Health Check
curl http://localhost:8080/health
```

## 工作流程

### CI (所有分支)
- 執行 ESLint 靜態分析
- 如果失敗，發送 Discord 通知

### CD Staging (dev 分支)
- Build Docker 映像檔（標籤：`dev-{BUILD_NUMBER}`）
- Push 到 Docker Hub
- 部署到 Port 8081
- 驗證 Health Check

### CD Production (main 分支)
- 讀取 `deploy.config` 檔案
- 從 Docker Hub Pull 指定的映像檔
- Retag 為 `prod-{BUILD_NUMBER}`
- Push 到 Docker Hub
- 部署到 Port 8082

## GitOps 流程

1. **開發階段**：在 `dev` 分支進行開發和測試
2. **推廣階段**：修改 `deploy.config` 指向要推廣的版本（例如 `dev-1`）
3. **部署階段**：推送 `main` 分支，Jenkins 會自動部署指定版本
4. **回滾階段**：使用 `git revert` 恢復 `deploy.config` 到之前的版本

## 驗證

```bash
# 檢查 Staging 環境
curl http://localhost:8081/health

# 檢查 Production 環境
curl http://localhost:8082/health

# 查看 Docker 容器
docker ps
```

