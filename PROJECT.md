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
- **v1.5.1**：换行排版修复——卡片「原文/理解」与详情「理解/举例/注意点」加 `whitespace-pre-wrap`，用户在编辑框里另起的行、空行，保存后原样显示
- **v1.5.2**：书名/作者自动拆分——新增 `parseSource()`：`《书名》作者`/`书名·作者`/`书名（作者）`自动分字段存；无分隔粘连（如「梦溪笔谈沈括」）用知名作者词典兜底；篇章名（《孟子》梁惠王上、论语·学而）不算作者。`normalizeData` 自动修复历史粘错的书（书名拆开+补作者，修完立即落盘并随同步回推云端）；`matchOrCreateBook` 命中缺作者的书时顺手补作者
- **v1.5.3**：「评论」分类底图重绘——古人谈古论今（四色长袍）+ 亭台园林背景 + 上方蓝天白云，明亮重彩风对齐「经济」底图色调（ImageGen 生成，裁掉水印后 600×800）；`comment.jpg?v=3` + SW `yulu-v42`
- **v1.5.4**：评论底图饱和度下调至 72%（用户反馈太艳；构图不动，PIL ImageEnhance.Color 处理）；`comment.jpg?v=4` + SW `yulu-v43`。生成原图 PNG 留在 /tmp 会丢，调色基准以 git 历史里的 v3 版为准
- **v1.5.5**：评论底图终版——饱和度再降至 55%，左上角山体用右侧天空镜像羽化补绘擦除（PIL paste+GaussianBlur mask，零积分）；`comment.jpg?v=5` + SW `yulu-v44`
- **v1.5.6**：评论底图重生成——用户反馈 v1.5.5 左侧山没擦干净；img2img 接口 403 不可用，改为文生图重绘（提示词明确"无大山+天空占半幅+四色长袍围坐"），PIL 擦除左缘远山残影+裁水印，色调天然柔和；`comment.jpg?v=6` + SW `yulu-v45`
- **v1.5.7**：**重要教训**——分类卡片是近方形（约1.14:1），object-fit:cover 只显示竖图中间横带，竖版底图的人物（在底部）全被裁掉，用户看到"只有房子没人"。彻底解法：底图改横幅，以人物为中心。用 v1.5.3 原图裁 y 640-1443 横带（山在 y 90-600 自然出画）+ 55% 饱和度 + 1080×846；`comment.jpg?v=7` + SW `yulu-v46`。**以后四张分类底图都必须横幅、主体居中**（econ.jpg 1200×600 就是这个逻辑）
- **v1.5.8**：评论底图裁切带上移（y 380-1443），卡片顶部露出蓝天白云，右侧淡青远山小景入画（左侧大山仍排除在外），人物四袍完整居中；`comment.jpg?v=8` + SW `yulu-v47`
- **v1.5.9**：评论底图改用专门的横版文生图（裁剪路线死局：原图上半部是大山、下半部是人物，裁切带越往上探天空越多山也跟着进来）。新图从源头按卡片比例构图：四位文人围坐石桌占下半部、湛蓝天空白云占上半幅约一半、左侧仅小亭角+松树+太湖石（房子更少）、右侧只留地平线淡青远山小景、无高大山体。PIL 裁右侧 150px 去水印 + 85% 饱和度（新图生成风格本身淡雅，无需压到 55%）+ 1200×887；`comment.jpg?v=9` + SW `yulu-v48`
- **v1.6**：书架点书 → 书目目录弹层（新功能）——点击书架上的书不再跳文摘筛选页，改为弹出该书的「目录」：书名+作者+总摘数置顶，条目 = 印章式中文序号（一、二、三…，颜色随书封）+ 原文首行摘要（换行只取首行）+ 日期/标记（有理解·有举例·有注意），顺序与文摘页一致（新的在前）。**每页 8 条放不下自动分页**，页脚「‹ 上一页 | 第 X 页 · 共 Y 页 | 下一页 ›」（中文页码），不足一页显示「— 全 卷 终 —」。点条目打开原有「文摘详注」详情（盖在目录上，关详情回目录）；在详情里删/改摘录后目录自动同步刷新。长按书脊改分类的原有交互保留。`SW yulu-v49`
- **v1.7**：**书封字错位修复 + 点书改「翻开一本书」阅读视图**。①错位根因：书名字号用 CSS 容器查询单位 cqw（26cqw 档只有两字书名命中），用户 iPhone 上解析异常 → 字号暴涨、竖排换列错位（只有「未知」这本书异常的原因）。修复：CSS 里的印章/方点/底牌尺寸全部改固定 px（原带 max 限幅），书名/作者的内联 cqw 在渲染后由 `fixCoverCqw()` 按封面实测宽度换算成 px（resize 防抖重算），彻底不再依赖 cqw。②点书不再弹目录列表，改为**书本阅读弹窗**：墨色灯下背景 + 一张宣纸书页（比例 3:4，四角装饰、页眉书名/日期、页脚中文页码），页序 = 扉页（书封色印章+竖排书名+作者）→ 目录页（点条目直达）→ 每页一条完整语录（原文+出处+理解/举例/注意+配图+相似佳句+「详注›」进详情）→ 全卷终。翻页 = **3D 翻页动画**（绕左缘 rotateY，翻出/翻回两种动画，防连点锁）+ 左右边缘点击热区 + 底部 ‹ › 按钮 + 左右滑动手势；底部指示「第 X 页 · 共 Y 页」（中文）。v1.6 的目录功能并入为目录页。`SW yulu-v50`

## 待办 / 备忘

- 「新增书目」入口仍是占位，未实现
- 「相似佳句」AI 功能预留了 open.bigmodel.cn 接口，需要 API key
- 网络热点源在纯前端版已去掉（CORS 限制），目前用节气 + 天气 + 经典库
- 用户今日佳句选句规则：节气日按节气出句；平时优先《论语》《孟子》《道德经》
