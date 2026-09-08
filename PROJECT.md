# 余录 · 项目档案（新对话快速接入用）

> **用途**：用户换新对话后，把本档案链接发给 AI 助手，即可完整恢复项目上下文。
> 用户只需说：「我要继续修改余录，先读项目档案」。

## 一句话简介

「余录」= 古典中国风的读书摘录 PWA（单文件 HTML），部署在 GitHub Pages 永久可用，数据通过 GitHub 私有仓库云同步。

## 关键信息

| 项目 | 值 |
|------|-----|
| 线上地址 | https://crystal236102087.github.io/yulu/ |
| 源码仓库 | crystal236102087/yulu（public，main 分支 = 线上） |
| 数据仓库 | crystal236102087/yulu-sync（private） |
| 用户数据文件 | data/YL-BXBD-EAT7.json |
| 用户同步码 | YL-BXBD-EAT7 |
| 用户 GitHub Token | 用户会提供（ghp_ 开头，repo 权限）。**严禁写入任何公开文件** |

## 数据格式

数据仓库中的文件（GitHub Contents API，内容为 base64 的 JSON）：

```json
{ "updatedAt": 1757..., "payload": { "quotes": [...], "books": [...] } }
```

本地（手机）存储：`yulu-reading-notes`（摘录数据）、`yulu-sync2`（token/code/sha/lastSyncAt）、`yulu-dirty`（离线脏标记）。

## 技术架构

- **index.html**（约 1800 行，单文件应用）
  - Tailwind CDN + 原生 JS，无构建
  - 字体：Ma Shan Zheng（品牌「余录」+ 印章「余」）、Noto Serif SC（正文）、Long Cang / Zhi Mang Xing
  - 品牌区：左 42px 红印章 + 右「余录」毛笔字 + 下方「读书摘录」横排
  - 四个 Tab：文摘（含今日佳句 + 分类首页）/ 书架 / 书房 / 我的
  - **渠道分类**：`CHANNELS` 四渠道——书本📖/影视🎬/评论💬/经济📈，quotes 用 `channel` 字段 + `bookId` 区分；quote 自带 `channel: '书本'` 兜底（normalizeData）
  - **分类首页**：`homeView`='gallery' 时 renderGallery 显示「今日佳句卡片 + 4 张带图分类卡片」；点击进入某渠道 → renderChannelList（返回箭头 + 书目 chips + 摘录列表）；书本渠道内再按书目 `filterBookId` 筛选
  - **分类底图**：4 张水墨国风插画 `art/book|film|comment|econ.jpg`（600×800，经 ImageGen 生成 + PIL 裁剪压缩），channelArt() 返回图片路径
  - 今日佳句：**纯前端计算**（节气寿星公式 + Open-Meteo 天气 + ipapi 定位 + 经典语录库），无后端依赖
  - 同步：改动 → markSyncDirty + 3 秒防抖 syncPush；启动/切前台/online 事件 → syncNow 拉取或补推；冲突以最后同步为准
  - 换机迁移：口令格式 `token|同步码`，一次粘贴完成绑定（syncSaveToken 解析 → syncJoin(code)）
  - normalizeData() 保证 quotes/books 恒为数组，防同步数据缺字段崩溃
- **sw.js**：Service Worker，CACHE `'yulu-v8'`，导航 network-first（改 index.html 用户自动获新版；**改 sw.js 才需要升 CACHE 版本号**）；APP_SHELL 含 4 张 art 底图预缓存
- **manifest.webmanifest + icon-192/512.png**：PWA 安装（iOS Safari 添加到主屏幕）
- **server.js**：Node 零依赖版（历史遗留，线上 GitHub Pages 版不需要它，仅沙箱演示用）

## 发布流程（改完代码上线）

```bash
# 沙箱若是新环境，先克隆源码：
# git clone https://github.com/crystal236102087/yulu
cd /tmp/yulu-publish   # 或重新 git clone 到任意目录
cp /workspace/reading-notes-app/index.html .
# sw.js 有改动则同时 cp 并把 CACHE 升为 yulu-v6
git add -A && git commit -m "余录 vX.X：改动说明" && git push origin main
# remote URL 含 token：https://<TOKEN>@github.com/crystal236102087/yulu.git
```

推送后约 1 分钟 GitHub Pages 生效，`curl https://crystal236102087.github.io/yulu/` 验证。

## 用户偏好（重要）

- 审美：中国古典风——朱砂红 / 墨黑 / 宣纸底色，毛笔字体，印章元素
- 设备：iPhone，Safari「添加到主屏幕」以 PWA 使用
- 沟通：中文，直接说人话，操作指引要具体到「点哪个按钮」
- 用户非技术背景，Token / 同步码等概念要用类比讲清楚

## 版本历史

- **v1.0**：基础版（摘录 + 书目 + 今日佳句 + GitHub 云同步）
- **v1.1**：换机迁移口令（一次粘贴）+ normalizeData 防崩溃
- **v1.2**：离线记录自动补传（脏标记持久化 + online 事件自动推送）
- **v1.4**：渠道分类（书本/影视/评论/经济），摘录分渠道记录
- **v1.5**：分类首页改版——首页只显示「今日佳句 + 带水墨插画的分类卡片」，点击分类进入看该渠道摘录；4 张 AI 水墨国风插画底图（art/*.jpg）

## 待办 / 备忘

- 「新增书目」入口仍是占位，未实现
- 「相似佳句」AI 功能预留了 open.bigmodel.cn 接口，需要 API key
- 网络热点源在纯前端版已去掉（CORS 限制），目前用节气 + 天气 + 经典库
- 用户今日佳句选句规则：节气日按节气出句；平时优先《论语》《孟子》《道德经》
