# CI/CD 示範影片腳本

## Phase 1: Development and Staging Deployment

### 步驟 1a: 在 dev 分支做程式碼修改
```bash
# 切換到專案目錄
cd /Users/lck/Downloads/lsap-cicd-example-app

# 切換到 dev 分支
git checkout dev

# 做一個簡單的修改（例如修改 README 或 app.js）
# 選項 1: 修改 README.md
echo "\n## Update: Added new feature" >> README.md

# 或選項 2: 修改 app.js（例如修改歡迎訊息）
# 編輯 app.js，將 "Hello DevOps World!" 改為 "Hello DevOps World! - Updated"

# 提交修改
git add .
git commit -m "Add new feature for staging deployment demo"

# 推送到 GitHub
git push origin dev
```

### 步驟 1b: 驗證 Staging（顯示 Jenkins GUI）
1. 打開瀏覽器，前往 `http://localhost:8080`
2. 登入 Jenkins
3. 點擊 `lsap-cicd-pipeline` → `dev` 分支
4. 等待建置完成（或點擊最新的建置）
5. 截圖顯示：
   - 建置狀態為「成功」（藍色圓圈）
   - 建置編號（例如 #10）
   - 所有 stage 都顯示成功（Static Analysis、Staging Deployment）

### 步驟 1c: 驗證 Container
```bash
# 在終端機執行
docker exec jenkins docker ps | grep dev-app

# 應該看到類似：
# d880aa817231   lck0527/cicd:dev-10   ...   Up X minutes   0.0.0.0:8081->8080/tcp   dev-app

# 驗證 health check
curl http://localhost:8081/health
# 應該返回：{"status":"UP"}
```

---

## Phase 2: GitOps Promotion to Production

### 步驟 2a: 切換到 main 並合併 dev
```bash
# 確保在專案目錄
cd /Users/lck/Downloads/lsap-cicd-example-app

# 切換到 main 分支
git checkout main

# 合併 dev 分支
git merge dev

# 確認合併成功
git log --oneline -3
```

### 步驟 2b: 修改 deploy.config 並推送
```bash
# 查看當前的 deploy.config
cat deploy.config
# 應該顯示：dev-10（或最新的 dev 建置編號）

# 如果 deploy.config 已經是最新的，可以保持不變
# 或者更新為最新的 dev 建置編號（例如 dev-10）

# 提交並推送
git add deploy.config
git commit -m "update deploy config to dev-10"
git push origin main
```

### 步驟 2c: 驗證 Production（顯示 Jenkins GUI）
1. 在 Jenkins Dashboard
2. 點擊 `lsap-cicd-pipeline` → `main` 分支
3. 等待建置完成（或點擊最新的建置）
4. 截圖顯示：
   - 建置狀態為「成功」（藍色圓圈）
   - 建置編號（例如 #5）
   - 所有 stage 都顯示成功（Static Analysis、Production Deployment (GitOps)）
   - 在 Console Output 中可以看到：
     - "Promoting version: dev-10"
     - Docker pull、tag、push 的過程

### 步驟 2d: 驗證 Container
```bash
# 在終端機執行
docker exec jenkins docker ps | grep prod-app

# 應該看到類似：
# cc06346c4ade   lck0527/cicd:prod-5   ...   Up X minutes   0.0.0.0:8082->8080/tcp   prod-app

# 驗證 health check
curl http://localhost:8082/health
# 應該返回：{"status":"UP"}
```

---

## Phase 3: Rollback

### 步驟 3a: 執行 Rollback
```bash
# 確保在 main 分支
cd /Users/lck/Downloads/lsap-cicd-example-app
git checkout main

# 查看最近的 commit 歷史
git log --oneline -5

# 執行 git revert（回滾最後一個 commit，也就是更新 deploy.config 的 commit）
git revert HEAD --no-edit

# 或如果要回滾到特定的 commit：
# git revert <commit-hash> --no-edit

# 推送到 GitHub
git push origin main
```

### 步驟 3b: 驗證 Rollback（顯示 Jenkins GUI）
1. 在 Jenkins Dashboard
2. 點擊 `lsap-cicd-pipeline` → `main` 分支
3. 等待新的建置完成（應該會自動觸發）
4. 截圖顯示：
   - 建置狀態為「成功」（藍色圓圈）
   - 新的建置編號（例如 #6）
   - 在 Console Output 中可以看到：
     - "Promoting version: dev-9"（或之前的版本，取決於 revert 的內容）
     - 部署了之前的穩定版本

### 步驟 3c: 驗證 Rollback 後的 Container
```bash
# 檢查容器是否更新
docker exec jenkins docker ps | grep prod-app

# 檢查容器使用的映像標籤
docker exec jenkins docker inspect prod-app --format='{{.Config.Image}}'
# 應該顯示之前的版本（例如 lck0527/cicd:prod-6）

# 驗證應用程式仍在運行
curl http://localhost:8082/health
# 應該返回：{"status":"UP"}
```

---

## 影片錄製提示

### 建議的錄製順序：
1. **開場**：介紹專案和目標
2. **Phase 1**：完整示範 dev 分支的開發和部署流程
3. **Phase 2**：示範 GitOps 推廣到 Production
4. **Phase 3**：示範 Rollback 流程
5. **結尾**：總結整個 CI/CD 流程

### 錄製時要注意：
- 確保終端機字體大小適中，容易閱讀
- Jenkins GUI 要清楚顯示建置狀態和日誌
- 每個命令執行後，等待結果顯示再繼續
- 可以暫停說明每個步驟的目的
- 確保 Discord 通知（如果有的話）也要顯示

### 需要的畫面：
- 終端機（執行 git 命令）
- Jenkins Dashboard（顯示建置狀態）
- 瀏覽器（驗證 health check，可選）

