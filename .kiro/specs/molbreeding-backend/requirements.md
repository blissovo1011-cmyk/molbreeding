# 需求文档

## 简介

MolBreeding 试剂产品中心后端服务，为前端 React 应用提供完整的 RESTful API。系统管理分子育种领域的产品和试剂数据，支持产品试剂中心（读写）、大陆 MIMS（只读）和海外 MIMS（只读）三个业务模块。后端基于 Express + TypeScript 构建，使用关系型数据库持久化数据。

## 术语表

- **Backend_Server**: 基于 Express + TypeScript 的后端服务，提供 RESTful API
- **Product_Service**: 产品业务逻辑服务层，处理产品的增删改查和状态流转
- **Reagent_Service**: 试剂业务逻辑服务层，处理试剂的增删改查和同步配置
- **Sync_Service**: 同步服务层，处理产品和试剂向大陆/海外 MIMS 的同步逻辑
- **Database**: 关系型数据库（SQLite/PostgreSQL），持久化所有业务数据
- **Product**: 检测产品实体，包含基因组相关字段和同步配置
- **Reagent**: 试剂实体，关联产品，包含库房信息和同步配置
- **MIMS**: 物料信息管理系统（Material Information Management System），分为大陆和海外两个子系统
- **ProductStatus**: 产品/试剂状态枚举，包含 Pending（待定）、Effective（在售）、Obsolete（下架）
- **SyncConfig**: 同步配置对象，包含预警值、状态等子系统独立参数

## 需求

### 需求 1：项目初始化与基础架构

**用户故事：** 作为开发者，我希望后端项目具备清晰的分层架构和基础配置，以便于开发和维护。

#### 验收标准

1. THE Backend_Server SHALL 采用 Express + TypeScript 技术栈，使用分层架构（路由层 → 控制器层 → 服务层 → 数据访问层）组织代码
2. THE Backend_Server SHALL 在 `server/` 目录下组织所有后端代码，与前端 `src/` 目录分离
3. THE Backend_Server SHALL 在端口 3001 上启动 HTTP 服务，并通过环境变量 `PORT` 支持自定义端口
4. THE Backend_Server SHALL 配置 CORS 中间件，允许前端开发服务器（默认 `http://localhost:3000`）的跨域请求
5. THE Backend_Server SHALL 使用统一的 JSON 响应格式 `{ success: boolean, data?: T, error?: string }` 返回所有 API 响应
6. IF 请求的路由不存在，THEN THE Backend_Server SHALL 返回 HTTP 404 状态码和描述性错误信息
7. IF 服务器内部发生未捕获异常，THEN THE Backend_Server SHALL 返回 HTTP 500 状态码，记录错误日志，并返回通用错误信息（不暴露内部细节）

### 需求 2：数据库设计与初始化

**用户故事：** 作为开发者，我希望数据库表结构能准确映射前端数据模型，以便前后端数据无缝对接。

#### 验收标准

1. THE Database SHALL 包含 `products` 表，存储产品实体的所有字段，包括：id（主键）、code、category、status、version、nameEn、nameCn、projectCode、productType、productTech、species、clientUnit、clientName、alertValue、deliveryForm、finalReport，以及全部基因组相关字段（coverModule、dataStandardGb、dataLowerLimitGb、actualDataGb、segmentCount、coreSnpCount、mSnpCount、indelCount、targetRegionCount、segmentInnerType、refGenome、annotationInfo、refGenomeSpecies、refGenomeSizeGb、qcParam、qcStandard、applicationDirection、catalog、configDir、isLocusSecret、reagentQc、transferDate、usage、recommendCrossCycle、traitName、canUpgradeToNewVersion、minEffectiveDepth、transgenicEvent、transferInfo、remark）
2. THE Database SHALL 在 `products` 表中包含同步字段：syncMainland（布尔）、syncOverseas（布尔）、mainlandAlertValue（整数）、mainlandStatus（枚举）、overseasAlertValue（整数）、overseasStatus（枚举）
3. THE Database SHALL 包含 `reagents` 表，存储试剂实体字段：id（主键）、category、name、productId（外键关联 products）、spec、batchNo、stock、expiryDate、status、syncMainland、syncOverseas
4. THE Database SHALL 包含 `reagent_warehouses` 表，存储试剂库房信息：id（主键）、reagentId（外键关联 reagents）、warehouse、itemNo、kingdeeCode
5. THE Database SHALL 包含 `reagent_sync_configs` 表，存储试剂同步配置：id（主键）、reagentId（外键）、system（'mainland' 或 'overseas'）、alertValue、warehouse、kingdeeCode、localName（仅海外）、status
6. THE Database SHALL 在服务启动时自动执行数据库迁移脚本，创建所有必要的表结构
7. THE Database SHALL 为 `products.code` 字段创建唯一索引，为 `reagents.productId` 字段创建普通索引

### 需求 3：产品 CRUD API

**用户故事：** 作为前端应用，我希望通过 API 对产品进行增删改查操作，以便管理产品数据。

#### 验收标准

1. WHEN 收到 `GET /api/products` 请求，THE Product_Service SHALL 返回产品列表，支持通过 `category` 查询参数按类别筛选（全部/自主研发/定制开发）
2. WHEN 收到 `GET /api/products` 请求且包含 `system=mainland` 参数，THE Product_Service SHALL 仅返回 `syncMainland` 为 true 的产品，并在响应中使用 `mainlandAlertValue` 作为 alertValue
3. WHEN 收到 `GET /api/products` 请求且包含 `system=overseas` 参数，THE Product_Service SHALL 仅返回 `syncOverseas` 为 true 的产品，并在响应中使用 `overseasAlertValue` 作为 alertValue
4. WHEN 收到 `GET /api/products/:id` 请求，THE Product_Service SHALL 返回指定产品的完整详情，包含同步配置信息
5. IF 请求的产品 ID 不存在，THEN THE Product_Service SHALL 返回 HTTP 404 状态码和描述性错误信息
6. WHEN 收到 `POST /api/products` 请求且请求体包含有效的产品数据，THE Product_Service SHALL 创建新产品，初始状态设为 Pending，syncMainland 和 syncOverseas 设为 false，并返回创建的产品对象
7. IF 创建产品时 code 字段与已有产品重复，THEN THE Product_Service SHALL 返回 HTTP 409 状态码和冲突错误信息
8. IF 创建产品时必填字段（code、category、productType、productTech、species、alertValue）缺失，THEN THE Product_Service SHALL 返回 HTTP 400 状态码和具体的字段校验错误信息
9. WHEN 收到 `PUT /api/products/:id` 请求且请求体包含有效数据，THE Product_Service SHALL 更新指定产品的字段并返回更新后的产品对象
10. IF 更新产品时目标产品不存在，THEN THE Product_Service SHALL 返回 HTTP 404 状态码


### 需求 4：产品状态流转 API

**用户故事：** 作为前端应用，我希望通过 API 控制产品的上架和下架流程，以便管理产品生命周期。

#### 验收标准

1. WHEN 收到 `POST /api/products/:id/publish` 请求且产品当前状态为 Pending，THE Product_Service SHALL 将产品状态更新为 Effective，并保存请求体中的 transferInfo、remark 字段
2. WHEN 收到 `POST /api/products/:id/publish` 请求且请求体包含同步配置（syncMainland、syncOverseas、mainlandAlertValue、overseasAlertValue），THE Product_Service SHALL 同时更新产品的同步字段和对应子系统的预警值
3. IF 产品当前状态不是 Pending 时收到上架请求，THEN THE Product_Service SHALL 返回 HTTP 400 状态码和状态流转错误信息
4. WHEN 收到 `POST /api/products/:id/offline` 请求且产品当前状态为 Effective，THE Product_Service SHALL 将产品状态更新为 Obsolete，同时将 mainlandStatus 和 overseasStatus 设为 Obsolete，并保存 offlineReason 和 remark 字段
5. IF 产品当前状态不是 Effective 时收到下架请求，THEN THE Product_Service SHALL 返回 HTTP 400 状态码和状态流转错误信息

### 需求 5：产品同步配置 API

**用户故事：** 作为前端应用，我希望通过 API 配置产品向大陆/海外 MIMS 的同步参数，以便控制产品在不同区域的展示。

#### 验收标准

1. WHEN 收到 `PUT /api/products/:id/sync` 请求，THE Sync_Service SHALL 更新产品的 syncMainland、syncOverseas 字段及对应子系统的 alertValue
2. WHEN 产品首次同步到某子系统时，THE Sync_Service SHALL 将该子系统的 status 初始化为与产品主状态一致
3. IF 同步配置中开启了某子系统但未提供该子系统的 alertValue，THEN THE Sync_Service SHALL 返回 HTTP 400 状态码和校验错误信息

### 需求 6：子系统独立上下架 API

**用户故事：** 作为前端应用，我希望大陆和海外 MIMS 能独立控制产品的上下架状态，以便灵活管理不同区域的产品可用性。

#### 验收标准

1. WHEN 收到 `POST /api/products/:id/sub-publish` 请求且请求体指定 system 为 'mainland' 或 'overseas'，THE Sync_Service SHALL 将对应子系统的 status 更新为 Effective
2. WHEN 收到 `POST /api/products/:id/sub-offline` 请求且请求体指定 system 为 'mainland' 或 'overseas'，THE Sync_Service SHALL 将对应子系统的 status 更新为 Obsolete
3. IF 产品未同步到指定子系统时收到子系统上下架请求，THEN THE Sync_Service SHALL 返回 HTTP 400 状态码和错误信息

### 需求 7：试剂 CRUD API

**用户故事：** 作为前端应用，我希望通过 API 对试剂进行增删改查操作，以便管理试剂数据。

#### 验收标准

1. WHEN 收到 `GET /api/reagents` 请求，THE Reagent_Service SHALL 返回试剂列表，每条试剂包含关联的库房信息（warehouses 数组）
2. WHEN 收到 `GET /api/reagents` 请求且包含 `system=mainland` 参数，THE Reagent_Service SHALL 仅返回 `syncMainland` 为 true 的试剂，并在响应中附带大陆同步配置
3. WHEN 收到 `GET /api/reagents` 请求且包含 `system=overseas` 参数，THE Reagent_Service SHALL 仅返回 `syncOverseas` 为 true 的试剂，并在响应中附带海外同步配置（含 localName）
4. WHEN 收到 `GET /api/reagents/:id` 请求，THE Reagent_Service SHALL 返回指定试剂的完整详情，包含库房信息和同步配置
5. WHEN 收到 `POST /api/reagents` 请求且请求体包含有效数据，THE Reagent_Service SHALL 创建新试剂及其库房记录，初始状态设为 Pending，并返回创建的试剂对象
6. IF 创建试剂时关联的 productId 对应的产品状态不是 Effective，THEN THE Reagent_Service SHALL 返回 HTTP 400 状态码和错误信息，说明试剂仅能关联已生效的产品
7. IF 创建试剂时必填字段（category、name、productId、spec、warehouses）缺失，THEN THE Reagent_Service SHALL 返回 HTTP 400 状态码和具体的字段校验错误信息
8. WHEN 收到 `PUT /api/reagents/:id` 请求且请求体包含有效数据，THE Reagent_Service SHALL 更新试剂字段和库房记录（先删后插策略），并返回更新后的试剂对象
9. IF 更新试剂时目标试剂不存在，THEN THE Reagent_Service SHALL 返回 HTTP 404 状态码

### 需求 8：试剂状态流转 API

**用户故事：** 作为前端应用，我希望通过 API 控制试剂的上架和下架，以便管理试剂生命周期。

#### 验收标准

1. WHEN 收到 `POST /api/reagents/:id/publish` 请求且试剂当前状态为 Pending，THE Reagent_Service SHALL 将试剂状态更新为 Effective
2. WHEN 收到 `POST /api/reagents/:id/offline` 请求且试剂当前状态为 Effective，THE Reagent_Service SHALL 将试剂状态更新为 Obsolete
3. IF 试剂状态流转不符合 Pending → Effective → Obsolete 的规则，THEN THE Reagent_Service SHALL 返回 HTTP 400 状态码和状态流转错误信息

### 需求 9：试剂同步配置 API

**用户故事：** 作为前端应用，我希望通过 API 配置试剂向大陆/海外 MIMS 的同步参数，以便控制试剂在不同区域的展示和本地化信息。

#### 验收标准

1. WHEN 收到 `PUT /api/reagents/:id/sync` 请求，THE Sync_Service SHALL 更新试剂的 syncMainland、syncOverseas 字段，并创建或更新对应的 reagent_sync_configs 记录
2. WHEN 同步到大陆时，THE Sync_Service SHALL 保存 alertValue、warehouse、kingdeeCode 配置
3. WHEN 同步到海外时，THE Sync_Service SHALL 保存 alertValue、warehouse、kingdeeCode、localName 配置
4. IF 同步到海外但未提供 localName，THEN THE Sync_Service SHALL 返回 HTTP 400 状态码和校验错误信息

### 需求 10：试剂子系统独立上下架 API

**用户故事：** 作为前端应用，我希望大陆和海外 MIMS 能独立控制试剂的上下架状态。

#### 验收标准

1. WHEN 收到 `POST /api/reagents/:id/sub-publish` 请求且请求体指定 system，THE Sync_Service SHALL 将对应子系统的试剂同步配置 status 更新为 Effective
2. WHEN 收到 `POST /api/reagents/:id/sub-offline` 请求且请求体指定 system，THE Sync_Service SHALL 将对应子系统的试剂同步配置 status 更新为 Obsolete
3. IF 试剂未同步到指定子系统时收到子系统上下架请求，THEN THE Sync_Service SHALL 返回 HTTP 400 状态码和错误信息

### 需求 11：请求校验与错误处理

**用户故事：** 作为前端应用，我希望后端对所有请求进行严格校验并返回一致的错误格式，以便前端统一处理异常情况。

#### 验收标准

1. THE Backend_Server SHALL 对所有 POST 和 PUT 请求的请求体进行字段类型校验（字符串、数字、布尔值、数组）
2. IF 请求体的 JSON 格式无效，THEN THE Backend_Server SHALL 返回 HTTP 400 状态码和 JSON 解析错误信息
3. THE Backend_Server SHALL 对 category 字段校验其值属于允许的枚举范围（产品：'自主研发'/'定制开发'；试剂：'Panel类'/'建库类'/'定量类'/'提取类'/'单位点检测类'/'SSR检测类'/'其它'）
4. THE Backend_Server SHALL 对 status 字段校验其值属于 'Pending'/'Effective'/'Obsolete' 枚举范围
5. THE Backend_Server SHALL 对 productTech 字段校验其值属于 'GenoBaits®'/'GenoPlexs®' 枚举范围
6. THE Backend_Server SHALL 对 alertValue 字段校验其值为正整数

### 需求 12：数据库连接与前端代理配置

**用户故事：** 作为开发者，我希望开发环境下前端能通过代理无缝访问后端 API，以便简化本地开发流程。

#### 验收标准

1. THE Backend_Server SHALL 使用 SQLite 作为默认开发数据库，数据库文件存储在项目根目录的 `data/` 文件夹下
2. THE Backend_Server SHALL 通过环境变量 `DATABASE_URL` 支持切换到 PostgreSQL 等其他数据库
3. THE Backend_Server SHALL 在 `package.json` 中添加 `dev:server` 脚本，使用 tsx 运行后端服务（`tsx watch server/index.ts`）
4. THE Backend_Server SHALL 在 Vite 配置中添加 `/api` 路径的代理规则，将 API 请求转发到后端服务
