# MolBreeding 试剂产品中心 - API 接口文档

## 基础信息

- **Base URL**: `http://localhost:3000`
- **API文档**: `http://localhost:3000/api/docs` (Swagger UI)
- **认证方式**: Bearer Token (JWT)

---

## 认证接口

### 1. 用户登录
```
POST /auth/login
Content-Type: application/json

Request:
{
  "username": "admin",
  "password": "admin123"
}

Response:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "username": "admin",
    "name": "系统管理员",
    "role": "admin"
  }
}
```

### 2. 用户注册
```
POST /auth/register
Content-Type: application/json

Request:
{
  "username": "newuser",
  "password": "password123",
  "name": "新用户",
  "email": "user@example.com",
  "department": "研发部"
}

Response:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": { ... }
}
```

### 3. 获取当前用户信息
```
GET /auth/profile
Authorization: Bearer <token>

Response:
{
  "id": "uuid",
  "username": "admin",
  "name": "系统管理员",
  "role": "admin",
  ...
}
```

---

## 产品管理接口

### 1. 创建产品
```
POST /products
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "code": "P004",
  "version": "v1.0",
  "nameCn": "大豆基因组检测",
  "nameEn": "Soybean Genome Panel",
  "category": "自主研发",
  "productType": "基因组检测",
  "productTech": "GBS",
  "species": "大豆",
  "alertValue": 50,
  "dataStandardGb": "8",
  "refGenome": "Glycine_max_v2.0"
}

Response:
{
  "id": "uuid",
  "code": "P004",
  "status": "pending",
  ...
}
```

### 2. 获取产品列表
```
GET /products?page=1&limit=20&category=自主研发&status=effective
Authorization: Bearer <token>

Response:
{
  "data": [
    { "id": "uuid", "code": "P001", "nameCn": "...", ... }
  ],
  "total": 100
}
```

### 3. 获取产品详情
```
GET /products/:id
Authorization: Bearer <token>

Response:
{
  "id": "uuid",
  "code": "P001",
  "nameCn": "水稻基因组检测套餐A",
  "syncConfig": { ... },
  ...
}
```

### 4. 更新产品
```
PUT /products/:id
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "nameCn": "水稻基因组检测套餐A(新版)",
  "alertValue": 60
}
```

### 5. 删除产品
```
DELETE /products/:id
Authorization: Bearer <token>
```

### 6. 变更产品状态
```
PUT /products/:id/status
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "status": "effective",
  "transferDate": "2024-01-15",
  "transferInfo": "转产审批通过"
}
```

### 7. 获取产品同步配置
```
GET /products/:id/sync-configs
Authorization: Bearer <token>
```

### 8. 更新产品同步配置
```
PUT /products/:id/sync-config
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "syncType": "mainland",
  "enabled": true,
  "alertValue": 100,
  "status": "effective"
}
```

---

## 试剂管理接口

### 1. 创建试剂
```
POST /reagents
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "category": "提取试剂",
  "name": "新型DNA提取试剂盒",
  "productId": "product-uuid",
  "spec": "100T",
  "batchNo": "BT20240110",
  "stock": 100,
  "warehouseConfigs": [
    {
      "warehouseId": "warehouse-uuid",
      "itemNo": "IT001",
      "kingdeeCode": "KD001",
      "alertStock": 10
    }
  ]
}
```

### 2. 获取试剂列表
```
GET /reagents?page=1&limit=20&category=提取试剂&status=effective
Authorization: Bearer <token>
```

### 3. 获取试剂详情
```
GET /reagents/:id
Authorization: Bearer <token>

Response:
{
  "id": "uuid",
  "name": "植物基因组DNA提取试剂盒",
  "warehouseConfigs": [...],
  "syncConfigs": [...],
  ...
}
```

### 4. 更新试剂
```
PUT /reagents/:id
Authorization: Bearer <token>
```

### 5. 删除试剂
```
DELETE /reagents/:id
Authorization: Bearer <token>
```

### 6. 变更试剂状态
```
PUT /reagents/:id/status
Authorization: Bearer <token>

Request:
{
  "status": "effective"
}
```

### 7. 获取试剂库存信息
```
GET /reagents/:id/inventory?warehouseId=xxx&includeExpired=false
Authorization: Bearer <token>

Response:
[
  {
    "batchNo": "BT20240101",
    "warehouse": "国内仓库",
    "stock": 200,
    "expiryDate": "2025-12-31",
    "qualityStatus": "qualified"
  }
]
```

### 8. 获取试剂库存汇总
```
GET /reagents/:id/inventory/summary
Authorization: Bearer <token>

Response:
{
  "total": 300,
  "alert": false
}
```

### 9. 更新试剂同步配置
```
PUT /reagents/:id/sync-config
Authorization: Bearer <token>

Request:
{
  "syncType": "overseas",
  "enabled": true,
  "alertValue": 50,
  "warehouseId": "warehouse-uuid",
  "kingdeeCode": "KD-OVERSEAS-001",
  "localName": "Plant Genomic DNA Extraction Kit"
}
```

---

## 仓库管理接口

### 1. 创建仓库
```
POST /warehouses
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "code": "WH-NEW-001",
  "name": "新仓库",
  "type": "domestic",
  "location": "广州市",
  "contact": "赵六",
  "phone": "13700137000"
}
```

### 2. 获取仓库列表
```
GET /warehouses?type=domestic&status=active
Authorization: Bearer <token>
```

### 3. 获取仓库详情
```
GET /warehouses/:id
Authorization: Bearer <token>
```

### 4. 更新仓库
```
PUT /warehouses/:id
Authorization: Bearer <token>
```

### 5. 删除仓库
```
DELETE /warehouses/:id
Authorization: Bearer <token>
```

---

## MIMS同步接口

### 1. 同步单个实体
```
POST /sync/single
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "entityType": "product",    // product | reagent
  "entityId": "uuid",
  "target": "mainland"         // mainland | overseas
}

Response:
{
  "id": "uuid",
  "entityType": "product",
  "entityId": "uuid",
  "syncType": "mainland",
  "status": "success",
  "responseData": { ... },
  "createdAt": "2024-01-15T10:00:00Z"
}
```

### 2. 批量同步
```
POST /sync/batch
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "entityType": "product",
  "entityIds": ["uuid1", "uuid2", "uuid3"],
  "target": "overseas"
}

Response:
[
  { "id": "uuid1", "status": "success", ... },
  { "id": "uuid2", "status": "failed", "errorMessage": "..." },
  { "id": "uuid3", "status": "success", ... }
]
```

### 3. 获取同步日志
```
GET /sync/logs?entityType=product&status=failed&page=1&limit=20
Authorization: Bearer <token>

Response:
{
  "data": [
    {
      "id": "uuid",
      "entityType": "product",
      "entityId": "uuid",
      "syncType": "mainland",
      "status": "failed",
      "errorMessage": "API调用超时",
      "operator": { "name": "系统管理员" },
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "total": 50
}
```

### 4. 获取实体同步状态
```
GET /sync/status/product/:entityId
Authorization: Bearer <token>

Response:
[
  { "syncType": "mainland", "status": "success", "syncedAt": "...", ... },
  { "syncType": "overseas", "status": "failed", "errorMessage": "...", ... }
]
```

---

## 用户管理接口

### 1. 获取用户列表
```
GET /users
Authorization: Bearer <token>

Response:
[
  {
    "id": "uuid",
    "username": "admin",
    "name": "系统管理员",
    "role": "admin",
    "status": "active",
    "department": "技术部"
  }
]
```

### 2. 获取用户详情
```
GET /users/:id
Authorization: Bearer <token>
```

---

## 数据模型

### 产品状态 (ProductStatus)
- `pending` - 待审批
- `effective` - 在售
- `obsolete` - 下架

### 试剂状态 (ReagentStatus)
- `pending` - 待审批
- `effective` - 在售
- `obsolete` - 下架

### 产品类别 (ProductCategory)
- `自主研发`
- `定制开发`

### 仓库类型 (WarehouseType)
- `domestic` - 海外/国内
- `mainland` - 大陆

### 同步目标 (SyncTarget)
- `mainland` - 大陆MIMS
- `overseas` - 海外MIMS

---

## 错误响应

```json
{
  "statusCode": 400,
  "message": "错误描述",
  "error": "Bad Request"
}
```

### 常见错误码
- `400` - 请求参数错误
- `401` - 未授权/登录失效
- `403` - 权限不足
- `404` - 资源不存在
- `409` - 资源冲突（如编号重复）
- `500` - 服务器内部错误
