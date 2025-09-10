# KoalaQA

<div align="center">

![KoalaQA](https://img.shields.io/badge/KoalaQA-智能问答系统-blue.svg)
[![Go](https://img.shields.io/badge/Go-1.25-00ADD8.svg)](https://golang.org/)
[![React](https://img.shields.io/badge/React-19.1.0-61DAFB.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6.svg)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-支持-2496ED.svg)](https://www.docker.com/)

**一个基于RAG（检索增强生成）技术的智能问答和知识管理平台**

</div>

## 🌟 项目简介

KoalaQA 是由长亭科技开发的企业级智能问答和知识管理系统，集成了先进的RAG技术、多模态文档处理、智能对话和社区讨论功能。系统支持多种文档格式的智能解析，提供基于大语言模型的智能问答服务，并具备完整的用户管理和权限控制功能。

## 📢 快速安装
```bash
bash -c "$(curl -fsSL https://github.com/chaitin/KoalaQA/raw/refs/heads/main/manager.sh)"
```

## ✨ 核心功能

### 🧠 智能问答系统
- **RAG技术**: 基于检索增强生成技术，提供准确的知识问答
- **多模型支持**: 支持多种大语言模型（Chat、Embedding、Rerank）
- **上下文理解**: 智能理解对话上下文，提供连贯的回答
- **实时对话**: WebSocket支持的实时聊天功能

### 📚 知识库管理
- **多格式支持**: 支持PDF、DOCX、PPTX、Markdown、HTML等多种文档格式
- **智能解析**: 自动提取文档内容并进行结构化处理
- **向量存储**: 基于Qdrant向量数据库的高效检索
- **文档摘要**: AI自动生成文档摘要和关键信息

### 💬 社区讨论
- **讨论区**: 支持QA、反馈、博客等多种讨论类型
- **评论系统**: 完整的评论和回复功能
- **标签分类**: 灵活的标签系统便于内容分类
- **权限控制**: 基于用户组的访问权限管理

### 🛠️ 系统管理
- **用户管理**: 完整的用户注册、认证和权限管理
- **多种认证**: 支持密码认证和OIDC单点登录
- **Webhook集成**: 支持外部系统集成和事件通知
- **系统配置**: 灵活的系统参数配置

## 🏗️ 技术架构

### 后端技术栈
- **Go 1.25**: 高性能的后端服务
- **Gin**: 轻量级Web框架
- **GORM**: 强大的ORM框架
- **PostgreSQL**: 主数据库
- **Qdrant**: 向量数据库
- **NATS**: 消息队列
- **MinIO**: 对象存储
- **Docker**: 容器化部署

### 前端技术栈
- **React 19**: 现代化前端框架
- **TypeScript**: 类型安全的开发体验
- **Material-UI**: Google Material Design组件库
- **Vite**: 快速的构建工具
- **Next.js**: 全栈React框架（前台）

### AI与数据处理
- **ModelKit**: 长亭科技的AI模型管理框架
- **Eino**: 智能对话引擎
- **RAGLite**: 轻量级RAG服务
- **AnyDoc**: 文档处理服务

## 📁 项目结构

```
koalaqa/
├── backend/                    # Go后端服务
│   ├── cmd/server/            # 服务入口
│   ├── model/                 # 数据模型
│   ├── repo/                  # 数据访问层
│   ├── svc/                   # 业务逻辑层
│   ├── router/                # 路由层
│   ├── pkg/                   # 公共包
│   │   ├── rag/              # RAG服务
│   │   ├── llm/              # 大语言模型
│   │   ├── oss/              # 对象存储
│   │   └── ...
│   └── migration/            # 数据库迁移
├── ui/                       # 前端应用
│   ├── admin/                # 管理后台（React+Vite）
│   └── front/                # 用户前台（Next.js）
├── docker/                   # Docker配置
├── data/                     # 数据目录
└── docker-compose.yml        # 容器编排
```

## 🚀 快速开始

### 环境要求

- **Docker** >= 20.0
- **Docker Compose** >= 2.0
- **Go** >= 1.25（开发环境）
- **Node.js** >= 18（开发环境）

### 一键部署

1. **克隆项目**
```bash
git clone https://github.com/chaitin/koalaqa.git
cd koalaqa
```

2. **配置环境变量**
```bash
# 复制环境变量模板
cp .env.example .env

# 编辑环境变量
vim .env
```

必要的环境变量：
```bash
# 数据库密码
DB_PASSWORD=your_db_password

# 对象存储密钥
OSS_SECRET_KEY=your_oss_secret

# 消息队列密码
MQ_PASSWORD=your_mq_password

# 向量数据库API密钥
QDRANT_API_KEY=your_qdrant_key

# 网络代理（可选）
HTTP_PROXY=http://proxy:port
HTTPS_PROXY=https://proxy:port
```

3. **启动服务**
```bash
# 构建并启动所有服务
make run.all

# 或者仅启动应用服务
make run
```

4. **访问应用**
- 前台应用: http://localhost
- 管理后台: http://localhost/admin
- API文档: http://localhost/swagger/index.html

### 开发环境

#### 后端开发

```bash
cd backend

# 安装依赖
go mod download

# 启动开发服务器
go run cmd/server/main.go
```

#### 前端开发

```bash
# 管理后台
cd ui/admin
pnpm install
pnpm dev

# 用户前台
cd ui/front
pnpm install
pnpm dev
```

## 📝 配置说明

### 大语言模型配置

系统支持多种大语言模型提供商：

- **OpenAI**: GPT-3.5、GPT-4系列
- **DeepSeek**: DeepSeek Chat系列
- **Google Gemini**: Gemini Pro系列
- **Ollama**: 本地部署模型
- **其他**: 兼容OpenAI API的模型

### 文档处理配置

支持的文档格式：
- **文本**: Markdown、HTML、TXT
- **Office**: DOCX、DOC、PPTX、XLSX、XLS
- **PDF**: 支持文本和图片提取
- **图片**: PNG、JPG、JPEG等
- **压缩包**: ZIP文件
- **电子书**: EPUB格式

### 第三方集成

- **OIDC认证**: 支持企业单点登录
- **Webhook**: 支持外部系统事件通知
- **API接口**: 完整的RESTful API

## 🔧 API文档

系统提供完整的Swagger API文档，启动服务后访问：
- http://localhost/swagger/index.html

主要API端点：
- `/api/v1/auth/*` - 认证相关
- `/api/v1/discussions/*` - 讨论管理
- `/api/v1/knowledge-bases/*` - 知识库管理
- `/api/v1/llm/*` - AI模型调用
- `/admin/api/v1/*` - 管理员接口

## 📊 系统监控

### 日志查看

```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f koala-qa-api
docker-compose logs -f koala-qa-app
```

### 健康检查

```bash
# 检查服务状态
docker-compose ps

# 检查API健康状态
curl http://localhost/api/health
```

## 🛡️ 安全说明

### 数据安全
- 所有敏感数据加密存储
- 支持HTTPS传输加密
- 完整的用户权限控制

### 访问控制
- 基于JWT的身份认证
- 细粒度的权限管理
- API访问频率限制

### 部署安全
- 容器隔离部署
- 网络安全配置
- 定期安全更新

## 🤝 贡献指南

我们欢迎社区贡献！请参考以下步骤：

1. **Fork项目**到你的GitHub账户
2. **创建分支**: `git checkout -b feature/your-feature`
3. **提交更改**: `git commit -m 'Add your feature'`
4. **推送分支**: `git push origin feature/your-feature`
5. **创建Pull Request**

### 开发规范

- 遵循Go和TypeScript的最佳实践
- 编写完整的单元测试
- 更新相关文档
- 保持代码风格一致

## 📄 许可证

本项目采用 [Apache 2.0](LICENSE) 许可证。

## 🙏 致谢

感谢以下开源项目：
- [Gin](https://github.com/gin-gonic/gin) - Web框架
- [GORM](https://github.com/go-gorm/gorm) - ORM框架
- [React](https://github.com/facebook/react) - 前端框架
- [Material-UI](https://github.com/mui/material-ui) - UI组件库
- [Qdrant](https://github.com/qdrant/qdrant) - 向量数据库

## 📞 支持与联系

- **问题反馈**: [GitHub Issues](https://github.com/chaitin/koalaqa/issues)
- **功能建议**: [GitHub Discussions](https://github.com/chaitin/koalaqa/discussions)
- **官方网站**: [长亭科技](https://www.chaitin.cn)

---

<div align="center">

**让知识管理更智能，让问答更精准** 🐨

Made with ❤️ by [长亭科技](https://www.chaitin.cn)

</div>
