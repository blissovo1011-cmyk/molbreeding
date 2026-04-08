# 实现计划：前端 API 集成

## 概述

将 MolBreeding 前端从本地 mock 数据驱动迁移为通过 fetch API 与 Express 后端通信。实现分为 5 个阶段：重写 API 服务层、改造 App 组件数据获取、改造产品管理操作、改造试剂管理操作、添加全局加载与错误处理。所有改造在 `src/App.tsx` 单文件内完成，保持现有 UI 结构不变。

## 任务

- [x] 1. 重写 API 服务层（`src/services/api.ts`）
  - [x] 1.1 实现核心请求函数和类型定义
    - 完全重写 `src/services/api.ts`，移除 axios 依赖和 ApiService 类
    - 定义 `ApiResponse<T>` 接口（与后端 `server/types.ts` 中格式一致）
    - 实现 `request<T>(url, options)` 通用请求函数，使用原生 fetch
    - 处理三层错误：网络错误 → "网络连接失败，请检查网络设置"；JSON 解析失败 → "服务器响应格式异常"；`success === false` → 抛出 `json.error`
    - 所有请求路径以 `/api/` 为前缀
    - _需求：1.1, 1.3, 1.4, 1.5, 1.6_

  - [x] 1.2 实现产品 API 方法（9 个）
    - 实现 `getProducts(params?)`、`getProduct(id)`、`createProduct(data)`、`updateProduct(id, data)`
    - 实现 `publishProduct(id, data)`、`offlineProduct(id, data)`、`syncProductConfig(id, data)`
    - 实现 `subPublishProduct(id, system)`、`subOfflineProduct(id, system)`
    - 为每个方法定义明确的 TypeScript 输入参数类型（`ProductCreateDTO`、`PublishDTO`、`OfflineDTO`、`SyncConfigDTO` 等）
    - _需求：1.2, 1.7_

  - [x] 1.3 实现试剂 API 方法（9 个）
    - 实现 `getReagents(params?)`、`getReagent(id)`、`createReagent(data)`、`updateReagent(id, data)`
    - 实现 `publishReagent(id)`、`offlineReagent(id)`、`syncReagentConfig(id, data)`
    - 实现 `subPublishReagent(id, system)`、`subOfflineReagent(id, system)`
    - 为每个方法定义明确的 TypeScript 输入参数类型（`ReagentCreateDTO`、`ReagentUpdateDTO`、`ReagentSyncDTO` 等）
    - _需求：1.2, 1.8_

  - [ ]* 1.4 编写属性测试：API 响应解析正确性
    - **属性 1：API 响应解析正确性**
    - 使用 `fast-check` 生成随机 `{ success: true, data: T }` 和 `{ success: false, error: string }` 响应
    - Mock `globalThis.fetch` 返回这些响应，验证 `request` 函数的返回值/抛出异常行为
    - 测试文件：`src/services/__tests__/api.test.ts`
    - **验证需求：1.3, 1.4**

  - [ ]* 1.5 编写属性测试：API 路径前缀正确性
    - **属性 2：API 路径前缀正确性**
    - 对所有导出的 API 方法，mock `fetch` 并捕获调用参数
    - 验证所有 URL 以 `/api/` 开头
    - 测试文件：`src/services/__tests__/api.test.ts`
    - **验证需求：1.6**

  - [ ]* 1.6 编写单元测试：错误处理和 HTTP 方法正确性
    - 测试网络错误（fetch 抛出 TypeError）→ 抛出"网络连接失败，请检查网络设置"
    - 测试 JSON 解析失败 → 抛出"服务器响应格式异常"
    - 测试各 API 方法的 HTTP method 和路径正确性
    - 测试文件：`src/services/__tests__/api.test.ts`
    - _需求：1.5_

- [x] 2. 检查点 - 确认 API 服务层完成
  - 确保所有测试通过，如有问题请向用户确认。

- [x] 3. 改造 App 组件数据获取
  - [x] 3.1 移除 mock 数据，添加数据获取逻辑
    - 在 `src/App.tsx` 中导入新的 API 服务层方法
    - 移除 `INITIAL_PRODUCTS` 和 `INITIAL_REAGENTS` 常量
    - 将 `products` 和 `reagents` 状态初始值改为空数组 `[]`
    - 新增 `loading` 状态（`useState(false)`）
    - 实现 `fetchProducts(params?)` 和 `fetchReagents(params?)` 异步函数
    - 添加 `useEffect` 在组件挂载时调用 `fetchProducts()` 和 `fetchReagents()`
    - 数据获取失败时通过 `message.error` 显示错误提示
    - _需求：2.1, 2.2, 2.4, 3.1, 3.2, 3.4_

  - [x] 3.2 添加全局加载指示器
    - 使用 Ant Design `Spin` 组件包裹 `renderContent()` 的返回内容
    - `spinning` 属性绑定到 `loading` 状态
    - _需求：2.3, 3.3, 11.1_

- [x] 4. 改造 ProductManagement 组件
  - [x] 4.1 修改 ProductManagement 组件 Props 和 CRUD 操作
    - 将 `setProducts` prop 替换为 `onRefresh: () => Promise<void>` 回调
    - 新增 `submitting` 局部状态控制按钮禁用
    - 改造 `onModalSubmit`：调用 `createProduct` 或 `updateProduct` API，成功后调用 `onRefresh()`
    - Modal 添加 `confirmLoading={submitting}` 防止重复提交
    - 错误处理：区分表单验证错误（`err.errorFields`）和 API 错误
    - _需求：4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 4.2 改造产品上架和下架操作
    - 改造 `onPublishSubmit`：调用 `publishProduct(id, data)` API，传递转产信息、同步配置参数
    - 改造 `onOfflineSubmit`：调用 `offlineProduct(id, data)` API，传递下架原因参数
    - 成功后调用 `onRefresh()` 刷新列表
    - 添加 `submitting` 状态控制上架/下架 Modal 的 `confirmLoading`
    - _需求：5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 4.3 改造产品同步配置操作
    - 改造 `onSyncSubmit`：调用 `syncProductConfig(id, data)` API
    - 传递 `syncMainland`、`syncOverseas`、`mainlandAlertValue`、`overseasAlertValue` 参数
    - 成功后调用 `onRefresh()` 刷新列表
    - _需求：6.1, 6.2, 6.3_

  - [x] 4.4 改造产品子系统上下架操作
    - 改造 `onSubPublishSubmit`：调用 `subPublishProduct(id, system)` API
    - 改造 `onSubOfflineSubmit`：调用 `subOfflineProduct(id, system)` API
    - 成功后调用 `onRefresh()` 刷新列表
    - _需求：7.1, 7.2, 7.3, 7.4_

  - [x] 4.5 更新 App 组件中 ProductManagement 的调用方式
    - 将所有 `<ProductManagement ... setProducts={setProducts} />` 替换为 `onRefresh={fetchProducts}`
    - 在大陆/海外 MIMS 视图下，传递带 `system` 参数的 `fetchProducts` 回调
    - _需求：2.5, 2.6_

- [x] 5. 检查点 - 确认产品管理改造完成
  - 确保所有测试通过，如有问题请向用户确认。

- [x] 6. 改造 ReagentManagement 组件
  - [x] 6.1 修改 ReagentManagement 组件 Props 和 CRUD 操作
    - 将 `setReagents` prop 替换为 `onRefresh: () => Promise<void>` 回调
    - 新增 `submitting` 局部状态控制按钮禁用
    - 改造 `onModalSubmit`：调用 `createReagent` 或 `updateReagent` API，成功后调用 `onRefresh()`
    - Modal 添加 `confirmLoading={submitting}` 防止重复提交
    - _需求：8.1, 8.2, 8.3, 8.4, 8.5_

  - [x] 6.2 改造试剂上架和下架操作
    - 改造试剂列表中的上架/下架按钮：调用 `publishReagent(id)` 或 `offlineReagent(id)` API
    - 成功后调用 `onRefresh()` 刷新列表
    - 失败时通过 `message.error` 显示错误信息
    - _需求：9.1, 9.2, 9.3, 9.4_

  - [x] 6.3 改造试剂同步配置操作
    - 改造 `onSyncSubmit`：调用 `syncReagentConfig(id, data)` API
    - 传递 `syncMainland`、`syncOverseas`、`mainlandConfig`、`overseasConfig` 参数
    - 成功后调用 `onRefresh()` 刷新列表
    - _需求：10.1, 10.2, 10.6_

  - [x] 6.4 改造试剂子系统上下架操作
    - 改造展开行中的子系统上架按钮：调用 `subPublishReagent(id, system)` API
    - 改造展开行中的子系统下架按钮：调用 `subOfflineReagent(id, system)` API
    - 成功后调用 `onRefresh()` 刷新列表
    - _需求：10.3, 10.4, 10.5, 10.6_

  - [x] 6.5 更新 App 组件中 ReagentManagement 的调用方式
    - 将所有 `<ReagentManagement ... setReagents={setReagents} />` 替换为 `onRefresh={fetchReagents}`
    - 在大陆/海外 MIMS 视图下，传递带 `system` 参数的 `fetchReagents` 回调
    - _需求：3.5_

- [x] 7. 全局错误处理与成功提示统一
  - 确认所有写操作（创建、更新、上架、下架、同步）成功时显示 `message.success`
  - 确认所有 API 错误通过 `message.error` 显示具体错误信息
  - 确认网络错误显示"网络连接失败，请检查网络设置"
  - _需求：11.2, 11.3, 11.4_

- [x] 8. 最终检查点 - 确保所有改造完成
  - 确保所有测试通过，如有问题请向用户确认。

## 备注

- 标记 `*` 的任务为可选任务，可跳过以加速 MVP 交付
- 每个任务引用了具体的需求编号以确保可追溯性
- `src/App.tsx` 是一个 1640 行的单文件，所有组件都在里面，改造时需保持现有 UI 结构不变
- 属性测试验证 API 服务层的核心解析逻辑正确性
- 单元测试验证具体的错误场景和边界条件
