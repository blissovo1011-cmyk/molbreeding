# 实现计划：MolBreeding 后端服务

## 概述

基于 Express + TypeScript + SQLite（better-sqlite3）构建分子育种产品试剂管理系统后端，采用四层分层架构（路由 → 控制器 → 服务 → 数据访问），提供 17 个 RESTful API 端点，覆盖产品和试剂的 CRUD、状态流转、多子系统同步配置等核心业务。

## 任务

- [x] 1. 项目初始化与基础架构搭建
  - [x] 1.1 安装后端依赖并配置 TypeScript
    - 安装 express、better-sqlite3、uuid、cors 及对应 @types 包
    - 安装开发依赖 tsx、vitest、fast-check、supertest 及对应 @types 包
    - 在 package.json 中添加 `dev:server` 脚本（`tsx watch server/index.ts`）
    - _需求: 1.1, 1.3, 12.3_

  - [x] 1.2 创建类型定义与自定义错误类
    - 创建 `server/types.ts`，定义 ApiResponse、ProductCreateDTO、ProductUpdateDTO、PublishDTO、OfflineDTO、SyncConfigDTO、SubSystemDTO、ReagentCreateDTO、ReagentUpdateDTO、ReagentSyncDTO 等接口
    - 创建 `server/errors.ts`，实现 AppError、ValidationError、NotFoundError、ConflictError 自定义错误类
    - _需求: 1.5, 11.1_

  - [x] 1.3 创建数据库连接与迁移脚本
    - 创建 `server/db.ts`，使用 better-sqlite3 初始化数据库连接，数据库文件存储在 `data/molbreeding.db`
    - 创建 `server/migrate.ts`，编写 products、reagents、reagent_warehouses、reagent_sync_configs 四张表的 DDL，包含所有字段约束、索引和外键
    - _需求: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 12.1_

  - [x] 1.4 创建 Express 应用入口与中间件
    - 创建 `server/app.ts`，配置 CORS、JSON 解析、路由挂载
    - 创建 `server/index.ts`，启动服务并执行数据库迁移
    - 创建 `server/middleware/errorHandler.ts`，实现全局错误处理中间件，统一返回 `{ success, error }` 格式
    - 创建 `server/middleware/validate.ts`，实现请求校验中间件（必填字段、枚举值、类型检查）
    - 配置 Vite 代理规则，将 `/api` 请求转发到后端服务
    - _需求: 1.1, 1.2, 1.4, 1.5, 1.6, 1.7, 11.1, 11.2, 12.4_

- [x] 2. 检查点 - 基础架构验证
  - 确保项目结构完整，数据库迁移脚本可正常执行，Express 服务可启动。如有问题请向用户确认。

- [x] 3. 产品 CRUD 实现
  - [x] 3.1 实现产品数据访问层
    - 创建 `server/repositories/productRepo.ts`
    - 实现 findAll（支持 category 和 system 筛选）、findById、create、update 方法
    - system 筛选时返回对应子系统的 alertValue 和 status
    - _需求: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.9, 3.10_

  - [x] 3.2 实现产品服务层
    - 创建 `server/services/productService.ts`
    - 实现 listProducts、getProduct、createProduct、updateProduct 业务逻辑
    - 创建时校验 code 唯一性（冲突返回 409）、必填字段校验
    - _需求: 3.4, 3.6, 3.7, 3.8, 3.9_

  - [x] 3.3 实现产品控制器与路由
    - 创建 `server/controllers/productController.ts`，处理请求参数提取和响应格式化
    - 创建 `server/routes/products.ts`，注册产品相关的所有路由
    - _需求: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10_

  - [ ]* 3.4 编写产品 CRUD 属性测试
    - **Property 1: 产品 CRUD 往返一致性**
    - **验证: 需求 3.4, 3.6, 3.9**

  - [ ]* 3.5 编写产品 system 筛选属性测试
    - **Property 3: 产品 system 筛选正确性**
    - **验证: 需求 3.1, 3.2, 3.3**

  - [ ]* 3.6 编写产品不存在资源 404 属性测试
    - **Property 5: 不存在的资源返回 404**（产品部分）
    - **验证: 需求 3.5, 3.10**

  - [ ]* 3.7 编写产品编号唯一性属性测试
    - **Property 14: 产品编号唯一性约束**
    - **验证: 需求 3.7**

- [x] 4. 产品状态流转实现
  - [x] 4.1 实现产品上架与下架逻辑
    - 在 productRepo 中添加 updateStatus、updateSyncFields 方法
    - 在 productService 中实现 publishProduct（Pending → Effective，含同步配置）和 offlineProduct（Effective → Obsolete，级联子系统状态）
    - 在 productController 中添加 publish 和 offline 处理函数
    - 在路由中注册 `POST /api/products/:id/publish` 和 `POST /api/products/:id/offline`
    - _需求: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ]* 4.2 编写产品状态机属性测试
    - **Property 6: 产品状态机合法转换**
    - **验证: 需求 4.1, 4.2, 4.3, 4.4, 4.5**

- [x] 5. 产品同步配置与子系统上下架实现
  - [x] 5.1 实现产品同步配置逻辑
    - 创建 `server/services/syncService.ts`，实现 updateProductSync 方法
    - 首次同步时初始化子系统 status 为产品主状态
    - 校验开启子系统时必须提供 alertValue
    - 在 productController 中添加 syncConfig 处理函数
    - 在路由中注册 `PUT /api/products/:id/sync`
    - _需求: 5.1, 5.2, 5.3_

  - [x] 5.2 实现产品子系统独立上下架
    - 在 syncService 中实现 subPublishProduct 和 subOfflineProduct 方法
    - 校验产品是否已同步到目标子系统
    - 在 productController 中添加 subPublish 和 subOffline 处理函数
    - 在路由中注册 `POST /api/products/:id/sub-publish` 和 `POST /api/products/:id/sub-offline`
    - _需求: 6.1, 6.2, 6.3_

  - [ ]* 5.3 编写产品同步配置属性测试
    - **Property 8: 产品同步配置往返一致性**
    - **验证: 需求 5.1, 5.2**

  - [ ]* 5.4 编写产品子系统独立状态管理属性测试
    - **Property 10: 产品子系统独立状态管理**
    - **验证: 需求 6.1, 6.2, 6.3**

- [x] 6. 检查点 - 产品模块验证
  - 确保所有产品相关 API（CRUD、状态流转、同步配置、子系统上下架）功能正常，所有测试通过。如有问题请向用户确认。


- [x] 7. 试剂 CRUD 实现
  - [x] 7.1 实现试剂数据访问层
    - 创建 `server/repositories/reagentRepo.ts`
    - 实现 findAll（支持 system 筛选，关联查询 warehouses）、findById（含 warehouses 和 sync_configs）、create（含库房记录插入）、update（先删后插库房记录）方法
    - 创建 `server/repositories/syncConfigRepo.ts`，实现试剂同步配置的 CRUD 方法
    - _需求: 7.1, 7.2, 7.3, 7.4, 7.5, 7.8, 7.9_

  - [x] 7.2 实现试剂服务层
    - 创建 `server/services/reagentService.ts`
    - 实现 listReagents、getReagent、createReagent、updateReagent 业务逻辑
    - 创建试剂时校验关联产品状态必须为 Effective
    - 必填字段校验（category、name、productId、spec、warehouses 且 warehouses 至少一条）
    - _需求: 7.4, 7.5, 7.6, 7.7, 7.8_

  - [x] 7.3 实现试剂控制器与路由
    - 创建 `server/controllers/reagentController.ts`，处理请求参数提取和响应格式化
    - 创建 `server/routes/reagents.ts`，注册试剂相关的所有路由
    - _需求: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9_

  - [ ]* 7.4 编写试剂 CRUD 属性测试
    - **Property 2: 试剂 CRUD 往返一致性**
    - **验证: 需求 7.1, 7.4, 7.5, 7.8**

  - [ ]* 7.5 编写试剂 system 筛选属性测试
    - **Property 4: 试剂 system 筛选正确性**
    - **验证: 需求 7.2, 7.3**

  - [ ]* 7.6 编写试剂不存在资源 404 属性测试
    - **Property 5: 不存在的资源返回 404**（试剂部分）
    - **验证: 需求 7.9**

  - [ ]* 7.7 编写试剂关联产品校验属性测试
    - **Property 15: 试剂仅能关联已生效产品**
    - **验证: 需求 7.6**

- [x] 8. 试剂状态流转实现
  - [x] 8.1 实现试剂上架与下架逻辑
    - 在 reagentRepo 中添加 updateStatus 方法
    - 在 reagentService 中实现 publishReagent（Pending → Effective）和 offlineReagent（Effective → Obsolete）
    - 在 reagentController 中添加 publish 和 offline 处理函数
    - 在路由中注册 `POST /api/reagents/:id/publish` 和 `POST /api/reagents/:id/offline`
    - _需求: 8.1, 8.2, 8.3_

  - [ ]* 8.2 编写试剂状态机属性测试
    - **Property 7: 试剂状态机合法转换**
    - **验证: 需求 8.1, 8.2, 8.3**

- [x] 9. 试剂同步配置与子系统上下架实现
  - [x] 9.1 实现试剂同步配置逻辑
    - 在 syncService 中实现 updateReagentSync 方法
    - 创建或更新 reagent_sync_configs 记录（使用 UPSERT）
    - 大陆配置保存 alertValue、warehouse、kingdeeCode；海外配置额外保存 localName
    - 校验海外同步必须提供 localName
    - 在 reagentController 中添加 syncConfig 处理函数
    - 在路由中注册 `PUT /api/reagents/:id/sync`
    - _需求: 9.1, 9.2, 9.3, 9.4_

  - [x] 9.2 实现试剂子系统独立上下架
    - 在 syncService 中实现 subPublishReagent 和 subOfflineReagent 方法
    - 校验试剂是否已同步到目标子系统（检查 reagent_sync_configs 记录是否存在）
    - 在 reagentController 中添加 subPublish 和 subOffline 处理函数
    - 在路由中注册 `POST /api/reagents/:id/sub-publish` 和 `POST /api/reagents/:id/sub-offline`
    - _需求: 10.1, 10.2, 10.3_

  - [ ]* 9.3 编写试剂同步配置属性测试
    - **Property 9: 试剂同步配置往返一致性**
    - **验证: 需求 9.1, 9.2, 9.3**

  - [ ]* 9.4 编写试剂子系统独立状态管理属性测试
    - **Property 11: 试剂子系统独立状态管理**
    - **验证: 需求 10.1, 10.2, 10.3**

- [x] 10. 检查点 - 试剂模块验证
  - 确保所有试剂相关 API（CRUD、状态流转、同步配置、子系统上下架）功能正常，所有测试通过。如有问题请向用户确认。

- [x] 11. 校验规则与错误处理完善
  - [x] 11.1 完善请求校验中间件
    - 在 validate.ts 中实现产品和试剂的完整校验规则
    - 必填字段校验、枚举值校验（category、status、productTech）、alertValue 正整数校验
    - JSON 解析错误处理
    - _需求: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

  - [ ]* 11.2 编写必填字段校验属性测试
    - **Property 12: 必填字段校验**
    - **验证: 需求 3.8, 7.7**

  - [ ]* 11.3 编写枚举字段校验属性测试
    - **Property 13: 枚举字段校验**
    - **验证: 需求 11.3, 11.4, 11.5, 11.6**

  - [ ]* 11.4 编写同步配置必填字段校验属性测试
    - **Property 16: 同步配置必填字段校验**
    - **验证: 需求 5.3, 9.4**

  - [ ]* 11.5 编写统一响应格式属性测试
    - **Property 17: 统一响应格式**
    - **验证: 需求 1.5**

  - [ ]* 11.6 编写未知路由 404 属性测试
    - **Property 18: 未知路由返回 404**
    - **验证: 需求 1.6**

- [x] 12. 集成联调与最终验证
  - [x] 12.1 路由挂载与端到端联调
    - 确保 app.ts 中正确挂载所有产品和试剂路由
    - 确保 404 兜底路由和全局错误处理中间件正确注册
    - 验证 Vite 代理配置可正常转发 `/api` 请求
    - _需求: 1.2, 1.4, 1.6, 12.4_

  - [ ]* 12.2 编写集成测试
    - 使用 supertest 编写端到端集成测试
    - 覆盖产品和试剂的完整生命周期流程（创建 → 上架 → 同步 → 子系统上下架 → 下架）
    - _需求: 全部_

- [x] 13. 最终检查点 - 全部测试通过
  - 确保所有单元测试和属性测试通过，代码无 TypeScript 编译错误。如有问题请向用户确认。

## 备注

- 标记 `*` 的子任务为可选测试任务，可跳过以加速 MVP 开发
- 每个任务引用了具体的需求编号，确保可追溯性
- 检查点任务用于阶段性验证，确保增量开发的正确性
- 属性测试验证设计文档中定义的 18 个正确性属性，使用 fast-check 生成随机输入
