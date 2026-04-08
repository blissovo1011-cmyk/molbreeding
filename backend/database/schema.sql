-- =============================================
-- MolBreeding 试剂产品中心 - 数据库表设计
-- PostgreSQL
-- =============================================

-- 1. 用户表
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    department VARCHAR(100),
    role VARCHAR(20) NOT NULL DEFAULT 'user', -- admin, manager, user
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, inactive
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. 产品表
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,           -- 产品编号
    version VARCHAR(20) NOT NULL,                -- 产品版本
    name_cn VARCHAR(200) NOT NULL,               -- 产品名称(中文)
    name_en VARCHAR(200),                        -- 产品名称(英文)
    
    -- 分类信息
    category VARCHAR(50) NOT NULL,               -- 自主研发/定制开发
    product_type VARCHAR(100),                   -- 产品类型
    product_tech VARCHAR(100),                    -- 产品技术
    species VARCHAR(100),                         -- 物种
    
    -- 产品状态
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending待审批, effective在售, obsolete下架
    
    -- 客户信息
    client_unit VARCHAR(200),                    -- 客户单位
    client_name VARCHAR(100),                    -- 客户姓名
    project_code VARCHAR(50),                     -- 项目编号
    
    -- 技术参数
    alert_value INTEGER DEFAULT 100,             -- 试剂预警值
    delivery_form VARCHAR(100),                  -- 结果交付形式
    final_report BOOLEAN DEFAULT false,           -- 配置finalreport
    cover_module VARCHAR(200),                   -- 产品覆盖模块
    
    -- 数据量相关
    data_standard_gb VARCHAR(50),                -- 数据量标准（Gb）
    data_lower_limit_gb VARCHAR(50),             -- 数据量下限（Gb）
    actual_data_gb VARCHAR(50),                  -- 实际上机数据量
    segment_count VARCHAR(50),                   -- 区段数
    core_snp_count VARCHAR(50),                  -- 核心SNP位点数
    m_snp_count VARCHAR(50),                     -- mSNP位点数
    indel_count VARCHAR(50),                     -- InDel数
    target_region_count VARCHAR(50),             -- 目标区域数
    segment_inner_type VARCHAR(100),             -- 区段内位点类型
    
    -- 基因组信息
    ref_genome VARCHAR(100),                     -- 参考基因组
    annotation_info TEXT,                         -- 注释信息
    ref_genome_species VARCHAR(100),              -- 参考基因组对应品种
    ref_genome_size_gb VARCHAR(50),              -- 参考基因组大小
    
    -- 质控参数
    qc_param TEXT,                                -- 产品质控参数
    qc_standard TEXT,                             -- 产品质控标准
    reagent_qc TEXT,                              -- 试剂质控
    
    -- 其他配置
    application_direction VARCHAR(200),          -- 应用方向
    catalog VARCHAR(100),                         -- catalog
    config_dir VARCHAR(200),                      -- config目录
    is_locus_secret BOOLEAN DEFAULT false,       -- 位点信息是否保密
    min_effective_depth VARCHAR(50),            -- 最低有效测序深度
    transgenic_event VARCHAR(100),               -- 转基因事件
    
    -- 生产信息
    transfer_date DATE,                          -- 转产日期
    usage TEXT,                                   -- 用法
    recommend_cross_cycle VARCHAR(50),           -- 推荐杂交循环数
    trait_name VARCHAR(100),                     -- 性状名称
    can_upgrade_to_new_version BOOLEAN DEFAULT true, -- 升级后能否再生产为新版本
    transfer_info TEXT,                           -- 转产信息
    remark TEXT,                                  -- 备注
    
    -- 审计字段
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. 产品同步配置表
CREATE TABLE product_sync_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sync_type VARCHAR(20) NOT NULL,              -- mainland/overseas
    enabled BOOLEAN DEFAULT false,
    alert_value INTEGER DEFAULT 100,
    status VARCHAR(20),                          -- pending/effective/obsolete
    synced_at TIMESTAMP,
    sync_result JSONB,                           -- 同步结果详情
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, sync_type)
);

-- 4. 仓库表
CREATE TABLE warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,            -- 仓库编码
    name VARCHAR(100) NOT NULL,                  -- 仓库名称
    type VARCHAR(20) NOT NULL,                   -- domestic海外/mainland大陆
    location VARCHAR(200),                       -- 仓库位置
    contact VARCHAR(100),                        -- 联系人
    phone VARCHAR(20),                           -- 联系电话
    status VARCHAR(20) DEFAULT 'active',        -- active/inactive
    remark TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. 试剂表
CREATE TABLE reagents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(50) NOT NULL,               -- 分类
    name VARCHAR(200) NOT NULL,                   -- 试剂名称
    product_id UUID REFERENCES products(id),      -- 关联产品
    spec VARCHAR(100),                           -- 规格
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending待审批, effective在售, obsolete下架
    
    -- 批次信息
    batch_no VARCHAR(50),                         -- 批次号
    stock INTEGER,                               -- 库存
    expiry_date DATE,                            -- 效期
    
    -- 审计字段
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. 试剂仓库配置表
CREATE TABLE reagent_warehouse_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reagent_id UUID NOT NULL REFERENCES reagents(id) ON DELETE CASCADE,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id),
    item_no VARCHAR(50),                         -- 货号
    kingdee_code VARCHAR(100),                   -- 金蝶物料编码
    current_stock INTEGER DEFAULT 0,            -- 当前库存
    alert_stock INTEGER DEFAULT 10,             -- 预警库存
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(reagent_id, warehouse_id)
);

-- 7. 试剂同步配置表
CREATE TABLE reagent_sync_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reagent_id UUID NOT NULL REFERENCES reagents(id) ON DELETE CASCADE,
    sync_type VARCHAR(20) NOT NULL,              -- mainland/overseas
    enabled BOOLEAN DEFAULT false,
    alert_value INTEGER DEFAULT 100,
    warehouse_id UUID REFERENCES warehouses(id),
    kingdee_code VARCHAR(100),                   -- 金蝶物料编码
    local_name VARCHAR(200),                    -- 海外本地化名称
    synced_at TIMESTAMP,
    sync_result JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(reagent_id, sync_type)
);

-- 8. 库存批次表
CREATE TABLE inventory_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reagent_id UUID NOT NULL REFERENCES reagents(id) ON DELETE CASCADE,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id),
    batch_no VARCHAR(50) NOT NULL,               -- 批次号
    stock INTEGER NOT NULL DEFAULT 0,           -- 库存数量
    expiry_date DATE,                            -- 效期
    production_date DATE,                        -- 生产日期
    quality_status VARCHAR(20) DEFAULT 'qualified', -- qualified合格, unqualified不合格
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. 同步日志表
CREATE TABLE sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(20) NOT NULL,            -- product/reagent
    entity_id UUID NOT NULL,
    sync_type VARCHAR(20) NOT NULL,              -- mainland/overseas
    status VARCHAR(20) NOT NULL,                 -- pending/success/failed
    request_data JSONB,
    response_data JSONB,
    error_message TEXT,
    operator_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. 操作日志表
CREATE TABLE operation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL,            -- product/reagent/warehouse等
    entity_id UUID,
    action VARCHAR(50) NOT NULL,                  -- create/update/delete/publish等
    before_data JSONB,
    after_data JSONB,
    operator_id UUID REFERENCES users(id),
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_products_code ON products(code);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_sync_mainland ON products(id) WHERE sync_mainland = true;
CREATE INDEX idx_products_sync_overseas ON products(id) WHERE sync_overseas = true;

CREATE INDEX idx_reagents_product_id ON reagents(product_id);
CREATE INDEX idx_reagents_status ON reagents(status);

CREATE INDEX idx_inventory_reagent ON inventory_batches(reagent_id);
CREATE INDEX idx_inventory_warehouse ON inventory_batches(warehouse_id);
CREATE INDEX idx_inventory_expiry ON inventory_batches(expiry_date);

CREATE INDEX idx_sync_logs_entity ON sync_logs(entity_type, entity_id);
CREATE INDEX idx_sync_logs_status ON sync_logs(status);
CREATE INDEX idx_sync_logs_created ON sync_logs(created_at);

CREATE INDEX idx_operation_logs_entity ON operation_logs(entity_type, entity_id);
CREATE INDEX idx_operation_logs_operator ON operation_logs(operator_id);
CREATE INDEX idx_operation_logs_created ON operation_logs(created_at);

-- 触发器：自动更新updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_warehouses_updated_at BEFORE UPDATE ON warehouses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reagents_updated_at BEFORE UPDATE ON reagents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reagent_warehouse_configs_updated_at BEFORE UPDATE ON reagent_warehouse_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reagent_sync_configs_updated_at BEFORE UPDATE ON reagent_sync_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_batches_updated_at BEFORE UPDATE ON inventory_batches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
