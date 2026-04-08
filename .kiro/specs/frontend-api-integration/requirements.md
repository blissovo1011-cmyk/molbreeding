# 需求文档：前端 API 集成

## 简介

将 MolBreeding 前端应用从本地 mock 数据（INITIAL_PRODUCTS、INITIAL_REAGENTS）和 useState 直接操作，迁移为通过 HTTP 调用后端 RESTful API 获取和修改数据。后端已完成，提供 17 个 API 端点（产品 9 个、试剂 8 个），Vite 已配置 `/api` 代理到 `http://localhost:3001`。现有 `src/services/api.ts` 基于 axios 且面向 NestJS 后端，需要重写为匹配当前 Express 后端的轻量级 fetch 服务层。

## 术语表

- **API_Service**: 前端 API 服务层模块（`src/services/api.ts`），封装所有对后端的 HTTP 请求
- **App_Component**: 前端主组件（`src/App.tsx`），包含 ProductManagement 和 ReagentManagement 子组件
- **ProductManagement**: 产品管理组件，负责产品的 CRUD、状态流转、同步配置、子系统上下架
- **ReagentManagement**: 试剂管理组件，负责试剂的 CRUD、状态流转、同步配置、子系统上下架
- **Backend_API**: Express 后端服务，监听 3001 端口，提供 RESTful API
- **ApiResponse**: 后端统一返回格式 `{ success: boolean, data?: T, error?: string }`
- **Product**: 产品实体，包含编号、类别、状态、同步配置等字段
- **Reagent**: 试剂实体，包含分类、名称、关联产品、库房配置等字段
- **ProductStatus**: 产品/试剂状态枚举，取值为 `Pending`、`Effective`、`Obsolete`
- **SyncConfig**: 同步配置，包含大陆/海外 MIMS 的同步开关和预警值等参数
- **SubSystem**: 子系统标识，取值为 `mainland` 或 `overseas`

## 需求

### 需求 1：API 服务层创建

**用户故事：** 作为前端开发者，我希望有一个统一的 API 服务层封装所有后端调用，以便在组件中方便地调用后端接口并统一处理响应格式。

#### 验收标准

1. THE API_Service SHALL 使用浏览器原生 fetch API 封装所有 17 个后端端点的调用方法
2. THE API_Service SHALL 为每个 API 方法定义明确的 TypeScript 输入参数类型和返回值类型
3. WHEN Backend_API 返回 `{ success: true, data: T }` 时，THE API_Service SHALL 解析并返回 `data` 字段的值
4. WHEN Backend_API 返回 `{ success: false, error: string }` 时，THE API_Service SHALL 抛出包含 error 信息的异常
5. WHEN 网络请求失败（如超时、连接拒绝）时，THE API_Service SHALL 抛出包含描述性错误信息的异常
6. THE API_Service SHALL 将所有请求路径以 `/api` 为前缀，以匹配 Vite 代理配置
7. THE API_Service SHALL 为产品模块提供以下方法：getProducts、getProduct、createProduct、updateProduct、publishProduct、offlineProduct、syncProductConfig、subPublishProduct、subOfflineProduct
8. THE API_Service SHALL 为试剂模块提供以下方法：getReagents、getReagent、createReagent、updateReagent、publishReagent、offlineReagent、syncReagentConfig、subPublishReagent、subOfflineReagent

### 需求 2：产品数据获取替换

**用户故事：** 作为用户，我希望产品列表展示的是后端数据库中的真实数据，而不是前端硬编码的 mock 数据。

#### 验收标准

1. WHEN App_Component 挂载时，THE App_Component SHALL 调用 API_Service 的 getProducts 方法从 Backend_API 获取产品列表
2. THE App_Component SHALL 移除硬编码的 INITIAL_PRODUCTS mock 数据，使用空数组作为 products 状态的初始值
3. WHILE 产品数据正在加载时，THE App_Component SHALL 显示加载指示器（Spin 组件）
4. IF 产品数据获取失败，THEN THE App_Component SHALL 通过 message 组件显示错误提示信息
5. WHEN 产品类别筛选条件变化时，THE ProductManagement SHALL 调用 getProducts 方法并传递 category 查询参数
6. WHEN 在大陆 MIMS 或海外 MIMS 视图下查看产品时，THE ProductManagement SHALL 调用 getProducts 方法并传递 system 查询参数（`mainland` 或 `overseas`）

### 需求 3：试剂数据获取替换

**用户故事：** 作为用户，我希望试剂列表展示的是后端数据库中的真实数据，而不是前端硬编码的 mock 数据。

#### 验收标准

1. WHEN App_Component 挂载时，THE App_Component SHALL 调用 API_Service 的 getReagents 方法从 Backend_API 获取试剂列表
2. THE App_Component SHALL 移除硬编码的 INITIAL_REAGENTS mock 数据，使用空数组作为 reagents 状态的初始值
3. WHILE 试剂数据正在加载时，THE App_Component SHALL 显示加载指示器（Spin 组件）
4. IF 试剂数据获取失败，THEN THE App_Component SHALL 通过 message 组件显示错误提示信息
5. WHEN 在大陆 MIMS 或海外 MIMS 视图下查看试剂时，THE ReagentManagement SHALL 调用 getReagents 方法并传递 system 查询参数

### 需求 4：产品 CRUD 操作 API 集成

**用户故事：** 作为产品管理员，我希望新增和编辑产品时数据能持久化到后端数据库，以便数据不会因页面刷新而丢失。

#### 验收标准

1. WHEN 用户提交新增产品表单时，THE ProductManagement SHALL 调用 API_Service 的 createProduct 方法将数据发送到 Backend_API
2. WHEN 用户提交编辑产品表单时，THE ProductManagement SHALL 调用 API_Service 的 updateProduct 方法将修改后的数据发送到 Backend_API
3. WHEN 产品创建或更新成功后，THE ProductManagement SHALL 重新获取产品列表以刷新表格数据
4. IF 产品创建或更新失败，THEN THE ProductManagement SHALL 通过 message 组件显示后端返回的错误信息
5. WHILE 产品创建或更新请求正在处理时，THE ProductManagement SHALL 禁用提交按钮以防止重复提交

### 需求 5：产品状态流转 API 集成

**用户故事：** 作为产品管理员，我希望产品上架和下架操作通过后端 API 执行，以便状态变更被正确记录和持久化。

#### 验收标准

1. WHEN 用户提交产品上架审批表单时，THE ProductManagement SHALL 调用 API_Service 的 publishProduct 方法，传递转产信息、同步配置等参数
2. WHEN 用户提交产品下架审批表单时，THE ProductManagement SHALL 调用 API_Service 的 offlineProduct 方法，传递下架原因等参数
3. WHEN 产品上架或下架成功后，THE ProductManagement SHALL 重新获取产品列表以刷新表格数据
4. IF 产品上架或下架失败，THEN THE ProductManagement SHALL 通过 message 组件显示后端返回的错误信息
5. WHILE 上架或下架请求正在处理时，THE ProductManagement SHALL 禁用提交按钮以防止重复提交

### 需求 6：产品同步配置 API 集成

**用户故事：** 作为产品管理员，我希望产品同步配置（大陆/海外 MIMS）通过后端 API 保存，以便同步状态被正确持久化。

#### 验收标准

1. WHEN 用户提交产品同步配置表单时，THE ProductManagement SHALL 调用 API_Service 的 syncProductConfig 方法，传递同步开关和预警值参数
2. WHEN 产品同步配置更新成功后，THE ProductManagement SHALL 重新获取产品列表以刷新表格数据
3. IF 产品同步配置更新失败，THEN THE ProductManagement SHALL 通过 message 组件显示后端返回的错误信息

### 需求 7：产品子系统上下架 API 集成

**用户故事：** 作为产品管理员，我希望子系统（大陆/海外 MIMS）的独立上下架操作通过后端 API 执行，以便子系统状态被正确管理。

#### 验收标准

1. WHEN 用户在展开行中点击子系统上架按钮时，THE ProductManagement SHALL 调用 API_Service 的 subPublishProduct 方法，传递产品 ID 和目标子系统标识
2. WHEN 用户在展开行中点击子系统下架按钮时，THE ProductManagement SHALL 调用 API_Service 的 subOfflineProduct 方法，传递产品 ID 和目标子系统标识
3. WHEN 子系统上架或下架成功后，THE ProductManagement SHALL 重新获取产品列表以刷新表格数据
4. IF 子系统上架或下架失败，THEN THE ProductManagement SHALL 通过 message 组件显示后端返回的错误信息

### 需求 8：试剂 CRUD 操作 API 集成

**用户故事：** 作为试剂管理员，我希望新增和编辑试剂时数据能持久化到后端数据库，以便数据不会因页面刷新而丢失。

#### 验收标准

1. WHEN 用户提交新增试剂表单时，THE ReagentManagement SHALL 调用 API_Service 的 createReagent 方法将数据发送到 Backend_API
2. WHEN 用户提交编辑试剂表单时，THE ReagentManagement SHALL 调用 API_Service 的 updateReagent 方法将修改后的数据发送到 Backend_API
3. WHEN 试剂创建或更新成功后，THE ReagentManagement SHALL 重新获取试剂列表以刷新表格数据
4. IF 试剂创建或更新失败，THEN THE ReagentManagement SHALL 通过 message 组件显示后端返回的错误信息
5. WHILE 试剂创建或更新请求正在处理时，THE ReagentManagement SHALL 禁用提交按钮以防止重复提交

### 需求 9：试剂状态流转 API 集成

**用户故事：** 作为试剂管理员，我希望试剂上架和下架操作通过后端 API 执行，以便状态变更被正确持久化。

#### 验收标准

1. WHEN 用户点击试剂上架按钮时，THE ReagentManagement SHALL 调用 API_Service 的 publishReagent 方法
2. WHEN 用户点击试剂下架按钮时，THE ReagentManagement SHALL 调用 API_Service 的 offlineReagent 方法
3. WHEN 试剂上架或下架成功后，THE ReagentManagement SHALL 重新获取试剂列表以刷新表格数据
4. IF 试剂上架或下架失败，THEN THE ReagentManagement SHALL 通过 message 组件显示后端返回的错误信息

### 需求 10：试剂同步配置与子系统上下架 API 集成

**用户故事：** 作为试剂管理员，我希望试剂的同步配置和子系统上下架操作通过后端 API 执行，以便同步状态被正确管理。

#### 验收标准

1. WHEN 用户提交试剂同步配置表单时，THE ReagentManagement SHALL 调用 API_Service 的 syncReagentConfig 方法，传递同步开关、预警值和海外本地化名称等参数
2. WHEN 试剂同步配置更新成功后，THE ReagentManagement SHALL 重新获取试剂列表以刷新表格数据
3. WHEN 用户在展开行中点击子系统上架按钮时，THE ReagentManagement SHALL 调用 API_Service 的 subPublishReagent 方法
4. WHEN 用户在展开行中点击子系统下架按钮时，THE ReagentManagement SHALL 调用 API_Service 的 subOfflineReagent 方法
5. WHEN 子系统操作成功后，THE ReagentManagement SHALL 重新获取试剂列表以刷新表格数据
6. IF 同步配置或子系统操作失败，THEN THE ReagentManagement SHALL 通过 message 组件显示后端返回的错误信息

### 需求 11：全局加载状态与错误处理

**用户故事：** 作为用户，我希望在数据加载和操作执行期间看到清晰的加载状态反馈，在操作失败时看到有意义的错误提示。

#### 验收标准

1. WHILE 任何 API 请求正在处理时，THE App_Component SHALL 在对应的内容区域显示加载指示器
2. WHEN 任何写操作（创建、更新、上架、下架、同步）成功时，THE App_Component SHALL 通过 message.success 显示操作成功提示
3. IF 任何 API 请求返回错误，THEN THE App_Component SHALL 通过 message.error 显示具体的错误信息
4. IF 网络连接不可用导致请求失败，THEN THE App_Component SHALL 显示网络错误提示信息
