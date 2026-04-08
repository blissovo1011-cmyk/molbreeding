/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Layout, Menu, Table, Button, Tag, Space, Modal, Form, Input, InputNumber,
  Select, Switch, Drawer, Descriptions, message, Spin, Dropdown, 
  Typography, ConfigProvider, theme, Card, Badge, Popover, Checkbox, Radio
} from 'antd';
import { 
  LayoutDashboard, Package, FlaskConical, Globe, MapPin, 
  Plus, MoreHorizontal, RefreshCw, CheckCircle2, AlertCircle, 
  ArrowRightLeft, FileText, Settings, Database, Info, Settings2,
  Menu as MenuIcon, MinusCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { MenuProps } from 'antd';
import * as api from './services/api';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;

// --- Types ---

type ProductStatus = 'Pending' | 'Effective' | 'Obsolete';

type FixedType = 'left' | 'right' | undefined;
interface ColumnConfig {
  key: string;
  title: string;
  visible: boolean;
  fixed?: FixedType;
}

const DEFAULT_COLUMNS_CONFIG: ColumnConfig[] = [
  { key: 'code', title: '产品编号', visible: true, fixed: 'left' },
  { key: 'category', title: '产品类别', visible: true },
  { key: 'version', title: '产品版本', visible: true },
  { key: 'nameCn', title: '产品名称(中)', visible: true },
  { key: 'nameEn', title: '产品名称(英)', visible: true },
  { key: 'projectCode', title: '项目编号', visible: true },
  { key: 'productType', title: '产品类型', visible: true },
  { key: 'productTech', title: '产品技术', visible: true },
  { key: 'species', title: '物种', visible: true },
  { key: 'clientUnit', title: '客户单位', visible: true },
  { key: 'clientName', title: '客户姓名', visible: true },
  { key: 'alertValue', title: '试剂预警值(次)', visible: true },
  { key: 'deliveryForm', title: '可选结果交付形式', visible: true },
  { key: 'finalReport', title: '配置finalreport', visible: false },
  { key: 'coverModule', title: '产品覆盖模块', visible: false },
  { key: 'dataStandardGb', title: '数据量标准（Gb）', visible: false },
  { key: 'dataLowerLimitGb', title: '数据量下限（Gb）', visible: false },
  { key: 'actualDataGb', title: '实际上机数据量（Gb）', visible: false },
  { key: 'segmentCount', title: '区段数', visible: false },
  { key: 'coreSnpCount', title: '核心SNP位点数', visible: false },
  { key: 'mSnpCount', title: 'mSNP位点数', visible: false },
  { key: 'indelCount', title: 'InDel数', visible: false },
  { key: 'targetRegionCount', title: '目标区域数', visible: false },
  { key: 'segmentInnerType', title: '区段内位点类型', visible: false },
  { key: 'refGenome', title: '参考基因组', visible: false },
  { key: 'annotationInfo', title: '注释信息', visible: false },
  { key: 'refGenomeSpecies', title: '参考基因组对应品种信息', visible: false },
  { key: 'refGenomeSizeGb', title: '参考基因组大小（Gb）', visible: false },
  { key: 'qcParam', title: '产品质控参数', visible: false },
  { key: 'qcStandard', title: '产品质控标准', visible: false },
  { key: 'applicationDirection', title: '应用方向', visible: false },
  { key: 'catalog', title: 'catalog', visible: false },
  { key: 'configDir', title: 'config目录', visible: false },
  { key: 'isLocusSecret', title: '位点信息是否保密', visible: false },
  { key: 'reagentQc', title: '试剂质控', visible: false },
  { key: 'transferDate', title: '转产日期', visible: false },
  { key: 'usage', title: '用法', visible: false },
  { key: 'recommendCrossCycle', title: '推荐杂交循环数', visible: false },
  { key: 'traitName', title: '性状名称', visible: false },
  { key: 'canUpgradeToNewVersion', title: '升级后能否再生产为新版本', visible: false },
  { key: 'minEffectiveDepth', title: '最低有效测序深度', visible: false },
  { key: 'transgenicEvent', title: '转基因事件', visible: false },
  { key: 'transferInfo', title: '转产信息', visible: false },
  { key: 'remark', title: '备注', visible: false },
  { key: 'status', title: '产品状态', visible: true, fixed: 'right' },
  { key: 'sync', title: '同步状态', visible: true },
  { key: 'action', title: '操作', visible: true, fixed: 'right' },
];

interface Product {
  id: string;
  category: string;
  status: ProductStatus;
  code: string;
  version: string;
  nameEn: string;
  nameCn: string;
  projectCode?: string;
  productType: string;
  productTech: string;
  species: string;
  clientUnit?: string;
  clientName?: string;
  alertValue: number;
  deliveryForm?: string;
  finalReport: boolean;
  coverModule?: string;
  dataStandardGb?: string;
  dataLowerLimitGb?: string;
  actualDataGb?: string;
  segmentCount?: string;
  coreSnpCount?: string;
  mSnpCount?: string;
  indelCount?: string;
  targetRegionCount?: string;
  segmentInnerType?: string;
  refGenome?: string;
  annotationInfo?: string;
  refGenomeSpecies?: string;
  refGenomeSizeGb?: string;
  qcParam?: string;
  qcStandard?: string;
  applicationDirection?: string;
  catalog?: string;
  configDir?: string;
  isLocusSecret: boolean;
  reagentQc?: string;
  transferDate?: string;
  usage?: string;
  recommendCrossCycle?: string;
  traitName?: string;
  canUpgradeToNewVersion: boolean;
  minEffectiveDepth?: string;
  transgenicEvent?: string;
  transferInfo?: string;
  remark?: string;

  // Legacy fields for table rendering
  syncMainland: boolean;
  syncOverseas: boolean;
  mainlandConfig?: { alertValue: number; status?: ProductStatus };
  overseasConfig?: { alertValue: number; status?: ProductStatus };
}

interface ReagentWarehouse {
  warehouse: string;
  itemNo: string;
  kingdeeCode: string;
}

interface Reagent {
  id: string;
  category: string;
  name: string;
  productId: string; // Linked Product ID
  spec: string;
  warehouses: ReagentWarehouse[];
  batchNo?: string;
  stock?: number;
  expiryDate?: string;
  syncMainland: boolean;
  syncOverseas: boolean;
  mainlandConfig?: { alertValue: number; warehouse: string; kingdeeCode: string };
  overseasConfig?: { alertValue: number; warehouse: string; kingdeeCode: string; localName: string };
  status: ProductStatus;
}

// --- Mock Data Removed - Using API ---

// --- Components ---

const MODAL_BODY_STYLE: React.CSSProperties = { maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' };

/**
 * InventoryCell: Dynamic Inventory Simulation
 */
const InventoryCell: React.FC<{ warehouse: ReagentWarehouse }> = ({ warehouse }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{ batchNo: string; stock: number; expiry: string }[] | null>(null);
  const [error, setError] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(false);
    
    // Simulate 80% success
    const isSuccess = Math.random() > 0.2;
    const delay = isSuccess ? 500 : 1500;

    await new Promise(resolve => setTimeout(resolve, delay));

    if (isSuccess) {
      const numBatches = Math.floor(Math.random() * 3) + 1;
      const batches = Array.from({ length: numBatches }).map(() => ({
        batchNo: `B${Math.floor(Math.random() * 10000)}`,
        stock: Math.floor(Math.random() * 500),
        expiry: '2026-12-31'
      }));
      setData(batches);
      setExpanded(true);
    } else {
      setError(true);
    }
    setLoading(false);
  };

  return (
    <div className="w-full">
      {!expanded && !loading && !error && (
        <span className="text-blue-500 text-xs cursor-pointer hover:underline inline-flex items-center gap-1" onClick={fetchData}><RefreshCw size={10} />查看库存</span>
      )}
      {loading && <span className="text-gray-400 text-xs flex items-center gap-1"><RefreshCw size={12} className="animate-spin" /> 获取中...</span>}
      {error && <span className="text-red-500 text-xs flex items-center gap-1 cursor-pointer" onClick={fetchData}><AlertCircle size={12} /> 获取失败，重试</span>}
      {expanded && data && (
        <div className="flex flex-col gap-1 w-full">
          {data.map((batch, idx) => (
            <div key={idx} className="flex justify-between items-center bg-white p-1.5 rounded border border-gray-100">
              <div className="text-gray-500">
                批次: <span className="text-gray-800">{batch.batchNo}</span> <span className="mx-1">|</span> 效期: {batch.expiry}
              </div>
              <div className="text-gray-800">
                库存: <span className="font-medium text-green-600">{batch.stock}</span>
              </div>
            </div>
          ))}
          <span className="text-gray-400 text-xs cursor-pointer hover:text-gray-600" onClick={() => setExpanded(false)}>收起</span>
        </div>
      )}
    </div>
  );
};

/**
 * ProductManagement: Center Console
 */
const ProductManagement: React.FC<{ 
  products: Product[]; 
  onRefresh: () => Promise<void>;
  readOnly?: boolean;
  filterSystem?: 'Mainland' | 'Overseas';
}> = ({ products, onRefresh, readOnly = false, filterSystem }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);
  const [isSubPublishModalOpen, setIsSubPublishModalOpen] = useState(false);
  const [isSubOfflineModalOpen, setIsSubOfflineModalOpen] = useState(false);
  const [subActionTarget, setSubActionTarget] = useState<{ product: Product, system: 'mainland' | 'overseas' } | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [columnConfigs, setColumnConfigs] = useState<ColumnConfig[]>(DEFAULT_COLUMNS_CONFIG);
  const [activeTab, setActiveTab] = useState('全部');
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const [syncForm] = Form.useForm();
  const [publishForm] = Form.useForm();
  const [offlineForm] = Form.useForm();
  const [subPublishForm] = Form.useForm();
  const [subOfflineForm] = Form.useForm();

  const handleStatusChange = (record: Product, newStatus: ProductStatus) => {
    if (newStatus === 'Effective') {
      setEditingProduct(record);
      publishForm.setFieldsValue({
        syncMainland: record.syncMainland || false,
        syncOverseas: record.syncOverseas || false,
        mainlandAlert: record.mainlandConfig?.alertValue,
        overseasAlert: record.overseasConfig?.alertValue,
      });
      setIsPublishModalOpen(true);
    } else if (newStatus === 'Obsolete') {
      setEditingProduct(record);
      offlineForm.resetFields();
      setIsOfflineModalOpen(true);
    }
  };

  const handleColumnConfigChange = (key: string, field: 'visible' | 'fixed', value: any) => {
    setColumnConfigs(prev => prev.map(col => col.key === key ? { ...col, [field]: value } : col));
  };

  const columnsContent = (
    <div className="w-80 max-h-96 overflow-y-auto">
      {columnConfigs.map(col => (
        <div key={col.key} className="flex items-center justify-between py-2 border-b last:border-0">
          <Checkbox 
            checked={col.visible} 
            onChange={(e) => handleColumnConfigChange(col.key, 'visible', e.target.checked)}
          >
            {col.title}
          </Checkbox>
          <Radio.Group 
            size="small" 
            value={col.fixed || 'none'} 
            onChange={(e) => handleColumnConfigChange(col.key, 'fixed', e.target.value === 'none' ? undefined : e.target.value)}
          >
            <Radio.Button value="left">左</Radio.Button>
            <Radio.Button value="none">无</Radio.Button>
            <Radio.Button value="right">右</Radio.Button>
          </Radio.Group>
        </div>
      ))}
    </div>
  );

  const filteredData = useMemo(() => {
    let data = products;
    if (filterSystem) {
      data = data.filter(p => filterSystem === 'Mainland' ? p.syncMainland : p.syncOverseas);
    }
    if (activeTab !== '全部') {
      data = data.filter(p => p.category === activeTab);
    }
    return data;
  }, [products, filterSystem, activeTab]);

  const handleAdd = () => {
    setEditingProduct(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record: Product) => {
    setEditingProduct(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleSync = (record: Product) => {
    setEditingProduct(record);
    syncForm.setFieldsValue({
      syncMainland: record.syncMainland,
      syncOverseas: record.syncOverseas,
      mainlandAlert: record.mainlandConfig?.alertValue,
      overseasAlert: record.overseasConfig?.alertValue,
    });
    setIsDrawerOpen(true);
  };

  const onModalSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, values);
        message.success('产品更新成功');
      } else {
        await api.createProduct(values);
        message.success('产品新增成功');
      }
      setIsModalOpen(false);
      await onRefresh();
    } catch (err: any) {
      if (err.errorFields) return;
      message.error(err.message || '操作失败');
    } finally {
      setSubmitting(false);
    }
  };

  const onSyncSubmit = async () => {
    try {
      const values = await syncForm.validateFields();
      setSubmitting(true);
      if (editingProduct) {
        await api.syncProductConfig(editingProduct.id, {
          syncMainland: values.syncMainland,
          syncOverseas: values.syncOverseas,
          mainlandAlertValue: values.mainlandAlert,
          overseasAlertValue: values.overseasAlert,
        });
        message.success('同步配置已提交审批');
        setIsDrawerOpen(false);
        await onRefresh();
      }
    } catch (err: any) {
      if (err.errorFields) return;
      message.error(err.message || '操作失败');
    } finally {
      setSubmitting(false);
    }
  };

  const onPublishSubmit = async () => {
    try {
      const values = await publishForm.validateFields();
      setSubmitting(true);
      if (editingProduct) {
        await api.publishProduct(editingProduct.id, {
          transferInfo: values.transferInfo,
          remark: values.remark,
          syncMainland: values.syncMainland,
          syncOverseas: values.syncOverseas,
          mainlandAlertValue: values.mainlandAlert,
          overseasAlertValue: values.overseasAlert,
        });
        message.success('已发起上架审批');
        setIsPublishModalOpen(false);
        await onRefresh();
      }
    } catch (err: any) {
      if (err.errorFields) return;
      message.error(err.message || '操作失败');
    } finally {
      setSubmitting(false);
    }
  };

  const onOfflineSubmit = async () => {
    try {
      const values = await offlineForm.validateFields();
      setSubmitting(true);
      if (editingProduct) {
        await api.offlineProduct(editingProduct.id, {
          offlineReason: values.offlineReason,
          remark: values.remark,
        });
        message.success('已发起下架审批');
        setIsOfflineModalOpen(false);
        await onRefresh();
      }
    } catch (err: any) {
      if (err.errorFields) return;
      message.error(err.message || '操作失败');
    } finally {
      setSubmitting(false);
    }
  };

  const onSubPublishSubmit = async () => {
    try {
      await subPublishForm.validateFields();
      setSubmitting(true);
      if (subActionTarget) {
        await api.subPublishProduct(subActionTarget.product.id, subActionTarget.system);
        message.success('已发起上架审批');
        setIsSubPublishModalOpen(false);
        await onRefresh();
      }
    } catch (err: any) {
      if (err.errorFields) return;
      message.error(err.message || '操作失败');
    } finally {
      setSubmitting(false);
    }
  };

  const onSubOfflineSubmit = async () => {
    try {
      await subOfflineForm.validateFields();
      setSubmitting(true);
      if (subActionTarget) {
        await api.subOfflineProduct(subActionTarget.product.id, subActionTarget.system);
        message.success('已发起下架审批');
        setIsSubOfflineModalOpen(false);
        await onRefresh();
      }
    } catch (err: any) {
      if (err.errorFields) return;
      message.error(err.message || '操作失败');
    } finally {
      setSubmitting(false);
    }
  };

  const getBaseColumns = () => {
    const cols: Record<string, any> = {
      code: { title: '产品编号', dataIndex: 'code', key: 'code', width: 150, render: (text: string) => <Text strong>{text}</Text> },
      category: { title: '产品类别', dataIndex: 'category', key: 'category', width: 120 },
      version: { title: '产品版本', dataIndex: 'version', key: 'version', width: 100 },
      nameCn: { title: '产品名称(中)', dataIndex: 'nameCn', key: 'nameCn', width: 150 },
      nameEn: { title: '产品名称(英)', dataIndex: 'nameEn', key: 'nameEn', width: 150 },
      projectCode: { title: '项目编号', dataIndex: 'projectCode', key: 'projectCode', width: 120 },
      productType: { title: '产品类型', dataIndex: 'productType', key: 'productType', width: 120 },
      productTech: { title: '产品技术', dataIndex: 'productTech', key: 'productTech', width: 120 },
      species: { title: '物种', dataIndex: 'species', key: 'species', width: 120 },
      clientUnit: { title: '客户单位', dataIndex: 'clientUnit', key: 'clientUnit', width: 150 },
      clientName: { title: '客户姓名', dataIndex: 'clientName', key: 'clientName', width: 120 },
      alertValue: { 
        title: '试剂预警值(次)', 
        key: 'alertValue', 
        width: 120,
        render: (_: any, record: Product) => {
          if (filterSystem === 'Mainland') return record.mainlandConfig?.alertValue ? `${record.mainlandConfig.alertValue} 次` : '-';
          if (filterSystem === 'Overseas') return record.overseasConfig?.alertValue ? `${record.overseasConfig.alertValue} 次` : '-';
          return record.alertValue ? `${record.alertValue} 次` : '-';
        }
      },
      deliveryForm: { title: '可选结果交付形式', dataIndex: 'deliveryForm', key: 'deliveryForm', width: 150 },
      finalReport: { title: '配置finalreport', dataIndex: 'finalReport', key: 'finalReport', width: 120, render: (v: boolean) => v ? '是' : '否' },
      coverModule: { title: '产品覆盖模块', dataIndex: 'coverModule', key: 'coverModule', width: 150 },
      dataStandardGb: { title: '数据量标准（Gb）', dataIndex: 'dataStandardGb', key: 'dataStandardGb', width: 150 },
      dataLowerLimitGb: { title: '数据量下限（Gb）', dataIndex: 'dataLowerLimitGb', key: 'dataLowerLimitGb', width: 150 },
      actualDataGb: { title: '实际上机数据量（Gb）', dataIndex: 'actualDataGb', key: 'actualDataGb', width: 150 },
      segmentCount: { title: '区段数', dataIndex: 'segmentCount', key: 'segmentCount', width: 100 },
      coreSnpCount: { title: '核心SNP位点数', dataIndex: 'coreSnpCount', key: 'coreSnpCount', width: 150 },
      mSnpCount: { title: 'mSNP位点数', dataIndex: 'mSnpCount', key: 'mSnpCount', width: 120 },
      indelCount: { title: 'InDel数', dataIndex: 'indelCount', key: 'indelCount', width: 100 },
      targetRegionCount: { title: '目标区域数', dataIndex: 'targetRegionCount', key: 'targetRegionCount', width: 120 },
      segmentInnerType: { title: '区段内位点类型', dataIndex: 'segmentInnerType', key: 'segmentInnerType', width: 150 },
      refGenome: { title: '参考基因组', dataIndex: 'refGenome', key: 'refGenome', width: 150 },
      annotationInfo: { title: '注释信息', dataIndex: 'annotationInfo', key: 'annotationInfo', width: 150 },
      refGenomeSpecies: { title: '参考基因组对应品种信息', dataIndex: 'refGenomeSpecies', key: 'refGenomeSpecies', width: 200 },
      refGenomeSizeGb: { title: '参考基因组大小（Gb）', dataIndex: 'refGenomeSizeGb', key: 'refGenomeSizeGb', width: 180 },
      qcParam: { title: '产品质控参数', dataIndex: 'qcParam', key: 'qcParam', width: 150 },
      qcStandard: { title: '产品质控标准', dataIndex: 'qcStandard', key: 'qcStandard', width: 150 },
      applicationDirection: { title: '应用方向', dataIndex: 'applicationDirection', key: 'applicationDirection', width: 150 },
      catalog: { title: 'catalog', dataIndex: 'catalog', key: 'catalog', width: 120 },
      configDir: { title: 'config目录', dataIndex: 'configDir', key: 'configDir', width: 120 },
      isLocusSecret: { title: '位点信息是否保密', dataIndex: 'isLocusSecret', key: 'isLocusSecret', width: 150, render: (v: boolean) => v ? '是' : '否' },
      reagentQc: { title: '试剂质控', dataIndex: 'reagentQc', key: 'reagentQc', width: 120 },
      transferDate: { title: '转产日期', dataIndex: 'transferDate', key: 'transferDate', width: 120 },
      usage: { title: '用法', dataIndex: 'usage', key: 'usage', width: 120 },
      recommendCrossCycle: { title: '推荐杂交循环数', dataIndex: 'recommendCrossCycle', key: 'recommendCrossCycle', width: 150 },
      traitName: { title: '性状名称', dataIndex: 'traitName', key: 'traitName', width: 120 },
      canUpgradeToNewVersion: { title: '升级后能否再生产为新版本', dataIndex: 'canUpgradeToNewVersion', key: 'canUpgradeToNewVersion', width: 200, render: (v: boolean) => v ? '是' : '否' },
      minEffectiveDepth: { title: '最低有效测序深度', dataIndex: 'minEffectiveDepth', key: 'minEffectiveDepth', width: 150 },
      transgenicEvent: { title: '转基因事件', dataIndex: 'transgenicEvent', key: 'transgenicEvent', width: 150 },
      transferInfo: { title: '转产信息', dataIndex: 'transferInfo', key: 'transferInfo', width: 200 },
      remark: { title: '备注', dataIndex: 'remark', key: 'remark', width: 200 },
      status: {
        title: '产品状态',
        dataIndex: 'status',
        key: 'status',
        width: 100,
        render: (status: ProductStatus) => {
          const colors = { Effective: 'success', Pending: 'warning', Obsolete: 'error' };
          return <Tag color={colors[status]}>{status === 'Effective' ? '在售' : status === 'Pending' ? '待定' : '下架'}</Tag>;
        }
      },
      sync: {
        title: '同步状态',
        key: 'sync',
        width: 150,
        render: (_: any, record: Product) => (
          <Space>
            {record.syncMainland && <Tag color="blue">大陆</Tag>}
            {record.syncOverseas && <Tag color="purple">海外</Tag>}
            {!record.syncMainland && !record.syncOverseas && <Text type="secondary">未同步</Text>}
          </Space>
        )
      },
      action: {
        title: '操作',
        key: 'action',
        width: 120,
        render: (_: any, record: Product) => {
          const items: MenuProps['items'] = [];
          if (record.status !== 'Effective') {
            items.push({ key: '1', label: '申请上架', onClick: () => handleStatusChange(record, 'Effective') });
          } else {
            items.push({ key: '2', label: '申请下架', onClick: () => handleStatusChange(record, 'Obsolete') });
            items.push({ key: '3', label: '同步产品', onClick: () => handleSync(record) });
          }

          return (
            <Space>
              <Button type="link" size="small" onClick={() => handleEdit(record)}>详情</Button>
              {!readOnly && items.length > 0 && (
                <Dropdown menu={{ items }}>
                  <Button type="link" size="small">更多</Button>
                </Dropdown>
              )}
            </Space>
          );
        }
      }
    };
    return cols;
  };

  const baseColumns = getBaseColumns();
  const columns = columnConfigs
    .filter(col => col.visible)
    .map(col => ({
      ...baseColumns[col.key],
      fixed: col.fixed,
    }));

  return (
    <div className="p-4">
      <div className="mb-4">
        <Menu 
          mode="horizontal" 
          selectedKeys={[activeTab]} 
          onClick={(e) => setActiveTab(e.key)}
          items={[
            { key: '全部', label: '全部' },
            { key: '自主研发', label: '自主研发' },
            { key: '定制开发', label: '定制开发' },
          ]}
          className="border-b-0 text-base"
        />
      </div>
      <div className="flex justify-end items-center mb-4">
        <Space>
          {!readOnly && (
            <Button type="primary" icon={<Plus size={16} />} onClick={handleAdd}>
              新增产品
            </Button>
          )}
          <Popover content={columnsContent} title="列设置" trigger="click" placement="bottomRight">
            <Button icon={<Settings2 size={16} />} />
          </Popover>
        </Space>
      </div>

      <Table 
        dataSource={filteredData} 
        columns={columns} 
        rowKey="id"
        scroll={{ x: 1500 }}
        expandable={readOnly ? undefined : {
          expandedRowRender: (record) => {
            const syncData = [];
            if (record.syncMainland) {
              syncData.push({
                key: 'mainland',
                system: '大陆MIMS',
                alertValue: record.mainlandConfig?.alertValue,
                status: record.mainlandConfig?.status || record.status,
                record,
              });
            }
            if (record.syncOverseas) {
              syncData.push({
                key: 'overseas',
                system: '海外MIMS',
                alertValue: record.overseasConfig?.alertValue,
                status: record.overseasConfig?.status || record.status,
                record,
              });
            }

            const syncColumns = [
              { title: '同步系统', dataIndex: 'system', key: 'system' },
              { title: '试剂预警值', dataIndex: 'alertValue', key: 'alertValue', render: (val: number) => val ? `${val} 次` : '-' },
              { 
                title: '产品状态', 
                dataIndex: 'status', 
                key: 'status', 
                render: (status: ProductStatus) => {
                  const text = status === 'Effective' ? '在售' : status === 'Pending' ? '待定' : '下架';
                  const color = status === 'Effective' ? 'success' : status === 'Pending' ? 'warning' : 'error';
                  return <Tag color={color}>{text}</Tag>;
                } 
              },
              {
                title: '操作',
                key: 'action',
                render: (_: any, row: any) => {
                  const isEffective = row.status === 'Effective';
                  return (
                    <Button 
                      type="link" 
                      danger={isEffective}
                      onClick={() => {
                        setSubActionTarget({ product: row.record, system: row.key });
                        if (isEffective) {
                          subOfflineForm.resetFields();
                          setIsSubOfflineModalOpen(true);
                        } else {
                          subPublishForm.resetFields();
                          setIsSubPublishModalOpen(true);
                        }
                      }}
                    >
                      {isEffective ? '下架' : '上架'}
                    </Button>
                  );
                }
              }
            ];

            return (
              <div className="bg-white p-6 m-2 rounded-sm shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-base text-gray-800">在售区域</div>
                  <Space>
                    <Button icon={<RefreshCw size={14} />} type="text" />
                  </Space>
                </div>
                {syncData.length > 0 ? (
                  <Table
                    dataSource={syncData}
                    columns={syncColumns}
                    pagination={false}
                    size="middle"
                  />
                ) : (
                  <div className="text-center py-8 text-gray-400">该产品尚未同步至任何业务系统</div>
                )}
              </div>
            );
          },
        }}
      />

      <Modal
        title={readOnly ? "产品详情" : (editingProduct ? "编辑产品" : "新增产品")}
        open={isModalOpen}
        onOk={readOnly ? undefined : onModalSubmit}
        onCancel={() => setIsModalOpen(false)}
        width={1000}
        confirmLoading={submitting}
        footer={readOnly ? <Button onClick={() => setIsModalOpen(false)}>关闭</Button> : undefined}
        centered styles={{ body: MODAL_BODY_STYLE }}
      >
        <Form form={form} layout="vertical" className="grid grid-cols-4 gap-x-4" disabled={readOnly}>
          <Form.Item name="category" label="产品类别" rules={[{ required: true }]}><Select placeholder="请选择产品类别" options={[{ value: '自主研发', label: '自主研发' }, { value: '定制开发', label: '定制开发' }]} /></Form.Item>
          <Form.Item name="code" label="产品编号" rules={[{ required: true }]}><Input placeholder="请选择产品前缀" /></Form.Item>
          <Form.Item name="version" label="产品版本（格式：Ver1.0）"><Input placeholder="请输入版本号" addonBefore="Ver" /></Form.Item>

          <Form.Item name="nameEn" label="产品名称（英）" className="col-span-2"><Input placeholder="请输入产品名称（英）" /></Form.Item>
          <Form.Item name="nameCn" label="产品名称（中）" className="col-span-2"><Input placeholder="请输入产品名称（中）" /></Form.Item>

          <Form.Item name="projectCode" label="项目编号"><Input placeholder="请输入项目编号" /></Form.Item>
          <Form.Item name="productType" label="产品类型" rules={[{ required: true }]}><Select placeholder="请选择产品类型" options={[{ value: '对外产品', label: '对外产品' }, { value: '对内产品', label: '对内产品' }, { value: '定制产品', label: '定制产品' }]} /></Form.Item>
          <Form.Item name="productTech" label="产品技术" rules={[{ required: true }]}><Select placeholder="请选择产品技术" options={[{ value: 'GenoBaits®', label: 'GenoBaits®' }, { value: 'GenoPlexs®', label: 'GenoPlexs®' }]} /></Form.Item>
          <Form.Item name="species" label="物种" rules={[{ required: true }]}><Select placeholder="请选择物种" options={[{ value: '玉米', label: '玉米' }, { value: '山羊', label: '山羊' }]} /></Form.Item>

          <Form.Item name="clientUnit" label="客户单位"><Input placeholder="请输入客户单位" /></Form.Item>
          <Form.Item name="clientName" label="客户姓名"><Input placeholder="请输入客户姓名" /></Form.Item>
          <Form.Item name="alertValue" label="试剂预警值(次)" rules={[{ required: true }]}><InputNumber min={1} precision={0} placeholder="请输入" style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="deliveryForm" label="可选结果交付形式"><Input placeholder="请选择可选结果交付形式" /></Form.Item>

          <Form.Item name="finalReport" label="配置finalreport" valuePropName="checked"><Switch /></Form.Item>
          <Form.Item name="coverModule" label="产品覆盖模块"><Input placeholder="请选择产品覆盖模块" /></Form.Item>
          <Form.Item name="dataStandardGb" label="数据量标准（Gb）"><Input placeholder="请输入数据量标准（Gb）" /></Form.Item>
          <Form.Item name="dataLowerLimitGb" label="数据量下限（Gb）"><Input placeholder="请输入数据量下限（Gb）" /></Form.Item>

          <Form.Item name="actualDataGb" label="实际上机数据量（Gb）"><Input placeholder="请输入实际上机数据量（Gb）" /></Form.Item>
          <Form.Item name="segmentCount" label="区段数"><Input placeholder="请输入区段数" /></Form.Item>
          <Form.Item name="coreSnpCount" label="核心SNP位点数"><Input placeholder="请输入核心SNP位点数" /></Form.Item>
          <Form.Item name="mSnpCount" label="mSNP位点数"><Input placeholder="请输入mSNP位点数" /></Form.Item>

          <Form.Item name="indelCount" label="InDel数"><Input placeholder="请输入InDel数" /></Form.Item>
          <Form.Item name="targetRegionCount" label="目标区域数"><Input placeholder="请输入目标区域数" /></Form.Item>
          <Form.Item name="segmentInnerType" label="区段内位点类型"><Input placeholder="请输入区段内位点类型" /></Form.Item>
          <Form.Item name="refGenome" label="参考基因组"><Input placeholder="请输入参考基因组" /></Form.Item>

          <Form.Item name="annotationInfo" label="注释信息"><Input placeholder="请输入注释信息" /></Form.Item>
          <Form.Item name="refGenomeSpecies" label="参考基因组对应品种信息"><Input placeholder="请输入参考基因组对应品种信息" /></Form.Item>
          <Form.Item name="refGenomeSizeGb" label="参考基因组大小（Gb）"><Input placeholder="请输入参考基因组大小（Gb）" /></Form.Item>
          <Form.Item name="qcParam" label="产品质控参数"><Input placeholder="请输入产品质控参数" /></Form.Item>

          <Form.Item name="qcStandard" label="产品质控标准"><Input placeholder="请输入产品质控标准" /></Form.Item>
          <Form.Item name="applicationDirection" label="应用方向"><Input placeholder="请输入应用方向" /></Form.Item>
          <Form.Item name="catalog" label="catalog"><Input placeholder="请输入catalog" /></Form.Item>
          <Form.Item name="configDir" label="config目录"><Input placeholder="请输入config目录" /></Form.Item>

          <Form.Item name="isLocusSecret" label="位点信息是否保密" valuePropName="checked"><Switch /></Form.Item>
          <Form.Item name="reagentQc" label="试剂质控"><Input placeholder="请输入试剂质控" /></Form.Item>
          <Form.Item name="transferDate" label="转产日期"><Input placeholder="请选择转产日期" /></Form.Item>
          <Form.Item name="usage" label="用法"><Input placeholder="请输入用法" /></Form.Item>

          <Form.Item name="recommendCrossCycle" label="推荐杂交循环数"><Input placeholder="请输入推荐杂交循环数" /></Form.Item>
          <Form.Item name="traitName" label="性状名称"><Input placeholder="请选择性状名称" /></Form.Item>
          <Form.Item name="canUpgradeToNewVersion" label="升级后能否再生产为新版本" valuePropName="checked"><Switch /></Form.Item>
          <Form.Item name="minEffectiveDepth" label="最低有效测序深度"><Input placeholder="请输入最低有效测序深度" /></Form.Item>

          <Form.Item name="transgenicEvent" label="转基因事件" className="col-span-4"><Input placeholder="请选择转基因事件" /></Form.Item>
          
          <Form.Item name="transferInfo" label="转产信息" className="col-span-4"><Input.TextArea rows={4} placeholder="请填写转产信息" maxLength={1000} showCount /></Form.Item>
          <Form.Item name="remark" label="备注" className="col-span-4"><Input.TextArea rows={4} placeholder="请填写备注" maxLength={1000} showCount /></Form.Item>
        </Form>
      </Modal>

      <Modal
        title="同步产品"
        onCancel={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
        width={500}
        onOk={onSyncSubmit}
        okText="提交审批并同步"
        confirmLoading={submitting}
        centered styles={{ body: MODAL_BODY_STYLE }}
      >
        <Form form={syncForm} layout="vertical" className="mt-4">
          <div className="border rounded-lg p-4 mb-4 bg-white shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <Text strong>大陆 MIMS</Text>
              <Form.Item name="syncMainland" valuePropName="checked" noStyle><Switch /></Form.Item>
            </div>
            <Form.Item 
              noStyle 
              shouldUpdate={(prev, curr) => prev.syncMainland !== curr.syncMainland}
            >
              {({ getFieldValue }) => getFieldValue('syncMainland') && (
                <Form.Item name="mainlandAlert" label="试剂预警值(次)" rules={[{ required: true }]}>
                  <InputNumber min={1} precision={0} style={{ width: '100%' }} />
                </Form.Item>
              )}
            </Form.Item>
          </div>

          <div className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <Text strong>海外 MIMS</Text>
              <Form.Item name="syncOverseas" valuePropName="checked" noStyle><Switch /></Form.Item>
            </div>
            <Form.Item 
              noStyle 
              shouldUpdate={(prev, curr) => prev.syncOverseas !== curr.syncOverseas}
            >
              {({ getFieldValue }) => getFieldValue('syncOverseas') && (
                <Form.Item name="overseasAlert" label="试剂预警值(次)" rules={[{ required: true }]}>
                  <InputNumber min={1} precision={0} style={{ width: '100%' }} />
                </Form.Item>
              )}
            </Form.Item>
          </div>
        </Form>
      </Modal>

      <Modal
        title="申请上架审批"
        open={isPublishModalOpen}
        onOk={onPublishSubmit}
        onCancel={() => setIsPublishModalOpen(false)}
        width={800}
        okText="确定"
        cancelText="取消"
        confirmLoading={submitting}
        centered styles={{ body: MODAL_BODY_STYLE }}
      >
        <Form form={publishForm} layout="vertical" className="mt-4">
          <Form.Item name="transferInfo" label="产品转产信息" rules={[{ required: true, message: '请填写产品转产信息' }]}>
            <Input.TextArea rows={4} placeholder="飞书云文档路径：&#10;飞书云文档链接：" maxLength={500} showCount />
          </Form.Item>

          <div className="flex items-center gap-4 mb-4">
            <Text strong>同步到大陆MIMS：</Text>
            <Form.Item name="syncMainland" valuePropName="checked" noStyle><Switch /></Form.Item>
          </div>
          <Form.Item 
            noStyle 
            shouldUpdate={(prev, curr) => prev.syncMainland !== curr.syncMainland}
          >
            {({ getFieldValue }) => getFieldValue('syncMainland') && (
              <Form.Item name="mainlandAlert" label="试剂预警值（次）" rules={[{ required: true }]}>
                <InputNumber min={1} precision={0} placeholder="请输入" style={{ width: '100%' }} />
              </Form.Item>
            )}
          </Form.Item>

          <div className="flex items-center gap-4 mb-4 mt-6">
            <Text strong>同步到海外MIMS：</Text>
            <Form.Item name="syncOverseas" valuePropName="checked" noStyle><Switch /></Form.Item>
          </div>
          <Form.Item 
            noStyle 
            shouldUpdate={(prev, curr) => prev.syncOverseas !== curr.syncOverseas}
          >
            {({ getFieldValue }) => getFieldValue('syncOverseas') && (
              <Form.Item name="overseasAlert" label="试剂预警值（次）" rules={[{ required: true }]}>
                <InputNumber min={1} precision={0} placeholder="请输入" style={{ width: '100%' }} />
              </Form.Item>
            )}
          </Form.Item>

          <Form.Item name="remark" label="备注" className="mt-6">
            <Input.TextArea rows={4} maxLength={500} showCount />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="申请下架审批"
        open={isOfflineModalOpen}
        onOk={onOfflineSubmit}
        onCancel={() => setIsOfflineModalOpen(false)}
        width={800}
        okText="确定"
        cancelText="取消"
        confirmLoading={submitting}
        centered styles={{ body: MODAL_BODY_STYLE }}
      >
        <Form form={offlineForm} layout="vertical" className="mt-4">
          <Form.Item name="offlineReason" label="下架原因" rules={[{ required: true, message: '请填写下架原因' }]}>
            <Input.TextArea rows={4} maxLength={500} showCount />
          </Form.Item>

          <div className="flex items-center gap-4 mb-4 mt-6">
            <Text strong>同步下架大陆/海外MIMS</Text>
            <Switch checked disabled />
          </div>

          <Form.Item name="remark" label="备注" className="mt-6">
            <Input.TextArea rows={4} maxLength={500} showCount />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`申请上架审批 (${subActionTarget?.system === 'mainland' ? '大陆MIMS' : '海外MIMS'})`}
        open={isSubPublishModalOpen}
        onOk={onSubPublishSubmit}
        onCancel={() => setIsSubPublishModalOpen(false)}
        width={600}
        okText="确定"
        cancelText="取消"
        confirmLoading={submitting}
        centered styles={{ body: MODAL_BODY_STYLE }}
      >
        <Form form={subPublishForm} layout="vertical" className="mt-4">
          <Form.Item name="publishReason" label="上架原因" rules={[{ required: true, message: '请填写上架原因' }]}>
            <Input.TextArea rows={4} maxLength={500} showCount />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`申请下架审批 (${subActionTarget?.system === 'mainland' ? '大陆MIMS' : '海外MIMS'})`}
        open={isSubOfflineModalOpen}
        onOk={onSubOfflineSubmit}
        onCancel={() => setIsSubOfflineModalOpen(false)}
        width={600}
        okText="确定"
        cancelText="取消"
        confirmLoading={submitting}
        centered styles={{ body: MODAL_BODY_STYLE }}
      >
        <Form form={subOfflineForm} layout="vertical" className="mt-4">
          <Form.Item name="offlineReason" label="下架原因" rules={[{ required: true, message: '请填写下架原因' }]}>
            <Input.TextArea rows={4} maxLength={500} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

const getInitialReagentConfigs = (sys?: 'Mainland' | 'Overseas'): ColumnConfig[] => {
  const base: ColumnConfig[] = [
    { key: 'category', title: '分类', visible: true, fixed: 'left' },
    { key: 'name', title: '名称', visible: true },
    { key: 'productId', title: '关联检测产品', visible: true },
    { key: 'spec', title: '规格', visible: true },
    { key: 'warehouseInfo', title: '库存信息', visible: true },
  ];
  if (sys) {
    base.push({ key: 'alertValue', title: '预警值', visible: true });
  }
  if (sys === 'Overseas') {
    base.push({ key: 'localName', title: '海外本地化名称', visible: true });
  }
  base.push(
    { key: 'status', title: '试剂状态', visible: true, fixed: 'right' },
    { key: 'sync', title: '同步状态', visible: true },
    { key: 'action', title: '操作', visible: true, fixed: 'right' }
  );
  return base;
};

/**
 * ReagentManagement: Center Console
 */
const ReagentManagement: React.FC<{ 
  reagents: Reagent[]; 
  onRefresh: () => Promise<void>;
  products: Product[];
  readOnly?: boolean;
  filterSystem?: 'Mainland' | 'Overseas';
}> = ({ reagents, onRefresh, products, readOnly = false, filterSystem }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingReagent, setEditingReagent] = useState<Reagent | null>(null);
  const [columnConfigs, setColumnConfigs] = useState<ColumnConfig[]>(() => getInitialReagentConfigs(filterSystem));
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const [syncForm] = Form.useForm();

  useEffect(() => {
    setColumnConfigs(getInitialReagentConfigs(filterSystem));
  }, [filterSystem]);

  const handleColumnConfigChange = (key: string, field: 'visible' | 'fixed', value: any) => {
    setColumnConfigs(prev => prev.map(col => col.key === key ? { ...col, [field]: value } : col));
  };

  const columnsContent = (
    <div className="w-80 max-h-96 overflow-y-auto">
      {columnConfigs.map(col => (
        <div key={col.key} className="flex items-center justify-between py-2 border-b last:border-0">
          <Checkbox 
            checked={col.visible} 
            onChange={(e) => handleColumnConfigChange(col.key, 'visible', e.target.checked)}
          >
            {col.title}
          </Checkbox>
          <Radio.Group 
            size="small" 
            value={col.fixed || 'none'} 
            onChange={(e) => handleColumnConfigChange(col.key, 'fixed', e.target.value === 'none' ? undefined : e.target.value)}
          >
            <Radio.Button value="left">左</Radio.Button>
            <Radio.Button value="none">无</Radio.Button>
            <Radio.Button value="right">右</Radio.Button>
          </Radio.Group>
        </div>
      ))}
    </div>
  );

  const effectiveProducts = useMemo(() => products.filter(p => p.status === 'Effective'), [products]);

  const filteredData = useMemo(() => {
    if (!filterSystem) return reagents;
    return reagents.filter(r => filterSystem === 'Mainland' ? r.syncMainland : r.syncOverseas);
  }, [reagents, filterSystem]);

  const handleAdd = () => {
    setEditingReagent(null);
    form.resetFields();
    form.setFieldsValue({ warehouses: [{}] });
    setIsModalOpen(true);
  };

  const handleEdit = (record: Reagent) => {
    setEditingReagent(record);
    form.setFieldsValue({
      ...record,
      warehouses: record.warehouses?.length ? record.warehouses : [{}]
    });
    setIsModalOpen(true);
  };

  const handleSync = (record: Reagent) => {
    setEditingReagent(record);
    syncForm.setFieldsValue({
      syncMainland: record.syncMainland,
      syncOverseas: record.syncOverseas,
      mainlandAlert: record.mainlandConfig?.alertValue,
      overseasAlert: record.overseasConfig?.alertValue,
      overseasLocalName: record.overseasConfig?.localName,
    });
    setIsDrawerOpen(true);
  };

  const onModalSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      if (editingReagent) {
        await api.updateReagent(editingReagent.id, values);
        message.success('试剂更新成功');
      } else {
        await api.createReagent(values);
        message.success('试剂新增成功');
      }
      setIsModalOpen(false);
      await onRefresh();
    } catch (err: any) {
      if (err.errorFields) return;
      message.error(err.message || '操作失败');
    } finally {
      setSubmitting(false);
    }
  };

  const onSyncSubmit = async () => {
    try {
      const values = await syncForm.validateFields();
      setSubmitting(true);
      if (editingReagent) {
        await api.syncReagentConfig(editingReagent.id, {
          syncMainland: values.syncMainland,
          syncOverseas: values.syncOverseas,
          mainlandConfig: values.syncMainland ? {
            alertValue: values.mainlandAlert,
          } : undefined,
          overseasConfig: values.syncOverseas ? {
            alertValue: values.overseasAlert,
            localName: values.overseasLocalName,
          } : undefined,
        });
        message.success('同步配置已提交');
        setIsDrawerOpen(false);
        await onRefresh();
      }
    } catch (err: any) {
      if (err.errorFields) return;
      message.error(err.message || '操作失败');
    } finally {
      setSubmitting(false);
    }
  };

  const getBaseColumns = () => {
    const cols: Record<string, any> = {
      category: { title: '分类', dataIndex: 'category', key: 'category' },
      name: { title: '名称', dataIndex: 'name', key: 'name' },
      productId: { 
        title: '关联检测产品', 
        dataIndex: 'productId', 
        key: 'productId',
        render: (pid: string) => products.find(p => p.id === pid)?.nameCn || '未知产品'
      },
      spec: { title: '规格', dataIndex: 'spec', key: 'spec' },
      warehouseInfo: { 
        title: '库存信息', 
        key: 'warehouseInfo',
        width: 360,
        render: (_: any, record: Reagent) => (
          <div className="flex flex-col gap-2 py-1">
            {record.warehouses?.map((w, i) => (
              <div key={i} className="bg-gray-50 border border-gray-100 rounded p-2 text-xs flex flex-col">
                <div className="flex justify-between items-center border-b border-gray-200 pb-1.5 mb-1">
                  <div className="font-medium text-blue-600 flex items-center gap-1">
                    <MapPin size={12} />
                    {w.warehouse}
                  </div>
                  <div className="text-gray-500 flex gap-3">
                    <div>货号: <span className="text-gray-700">{w.itemNo || '-'}</span></div>
                    <div>物料编码: <span className="text-gray-700">{w.kingdeeCode || '-'}</span></div>
                  </div>
                </div>
                <InventoryCell warehouse={w} />
              </div>
            ))}
          </div>
        )
      },
      alertValue: {
        title: '预警值',
        key: 'alertValue',
        render: (_: any, record: Reagent) => {
          if (filterSystem === 'Mainland') return record.mainlandConfig?.alertValue ? `${record.mainlandConfig.alertValue} 次` : '-';
          if (filterSystem === 'Overseas') return record.overseasConfig?.alertValue ? `${record.overseasConfig.alertValue} 次` : '-';
          return '-';
        }
      },
      localName: {
        title: '海外本地化名称',
        key: 'localName',
        render: (_: any, record: Reagent) => record.overseasConfig?.localName || '-'
      },
      status: {
        title: '试剂状态',
        dataIndex: 'status',
        key: 'status',
        render: (status: ProductStatus) => {
          const colors = { Effective: 'success', Pending: 'warning', Obsolete: 'error' };
          return <Tag color={colors[status]}>{status === 'Effective' ? '在售' : status === 'Pending' ? '待定' : '下架'}</Tag>;
        }
      },
      sync: {
        title: '同步状态',
        key: 'sync',
        render: (_: any, record: Reagent) => (
          <Space>
            {record.syncMainland && <Tag color="blue">大陆</Tag>}
            {record.syncOverseas && <Tag color="purple">海外</Tag>}
          </Space>
        )
      },
      action: {
        title: '操作',
        key: 'action',
        render: (_: any, record: Reagent) => {
          const isEffective = record.status === 'Effective';
          const items: MenuProps['items'] = [];
          
          if (!readOnly) {
            items.push({
              key: '1',
              label: isEffective ? '下架' : '上架',
              danger: isEffective,
              onClick: async () => {
                try {
                  if (isEffective) {
                    await api.offlineReagent(record.id);
                    message.success('已下架');
                  } else {
                    await api.publishReagent(record.id);
                    message.success('已上架');
                  }
                  await onRefresh();
                } catch (err: any) {
                  message.error(err.message || '操作失败');
                }
              }
            });
            items.push({
              key: '2',
              label: '同步试剂',
              onClick: () => handleSync(record)
            });
          }

          return (
            <Space>
              <Button type="link" size="small" onClick={() => handleEdit(record)}>详情</Button>
              {!readOnly && items.length > 0 && (
                <Dropdown menu={{ items }}>
                  <Button type="link" size="small">更多</Button>
                </Dropdown>
              )}
            </Space>
          );
        }
      }
    };
    return cols;
  };

  const baseColumns = getBaseColumns();
  const columns = columnConfigs
    .filter(col => col.visible)
    .map(col => ({
      ...baseColumns[col.key],
      fixed: col.fixed,
    }));

  return (
    <div className="p-4">
      <div className="flex justify-end items-center mb-4">
        <Space>
          {!readOnly && (
            <Button type="primary" icon={<Plus size={16} />} onClick={handleAdd}>
              新增试剂
            </Button>
          )}
          <Popover content={columnsContent} title="列设置" trigger="click" placement="bottomRight">
            <Button icon={<Settings2 size={16} />} />
          </Popover>
        </Space>
      </div>

      <Table 
        dataSource={filteredData} 
        columns={columns} 
        rowKey="id"
        scroll={{ x: 1500 }}
        expandable={readOnly ? undefined : {
          expandedRowRender: (record) => {
            const syncData = [];
            if (record.syncMainland) {
              syncData.push({
                key: 'mainland',
                system: '大陆MIMS',
                record,
                alertValue: record.mainlandConfig?.alertValue,
                status: record.mainlandConfig?.status || record.status,
              });
            }
            if (record.syncOverseas) {
              syncData.push({
                key: 'overseas',
                system: '海外MIMS',
                record,
                alertValue: record.overseasConfig?.alertValue,
                localName: record.overseasConfig?.localName,
                status: record.overseasConfig?.status || record.status,
              });
            }

            const syncColumns = [
              { title: '同步系统', dataIndex: 'system', key: 'system' },
              { 
                title: '库存信息', 
                key: 'warehouseInfo',
                width: 360,
                render: (_: any, row: any) => (
                  <div className="flex flex-col gap-2 py-1">
                    {row.record.warehouses?.map((w: ReagentWarehouse, i: number) => (
                      <div key={i} className="bg-gray-50 border border-gray-100 rounded p-2 text-xs flex flex-col">
                        <div className="flex justify-between items-center border-b border-gray-200 pb-1.5 mb-1">
                          <div className="font-medium text-blue-600 flex items-center gap-1">
                            <MapPin size={12} />
                            {w.warehouse}
                          </div>
                          <div className="text-gray-500 flex gap-3">
                            <div>货号: <span className="text-gray-700">{w.itemNo || '-'}</span></div>
                            <div>物料编码: <span className="text-gray-700">{w.kingdeeCode || '-'}</span></div>
                          </div>
                        </div>
                        <InventoryCell warehouse={w} />
                      </div>
                    ))}
                  </div>
                )
              },
              { title: '预警值', dataIndex: 'alertValue', key: 'alertValue', render: (val: number) => val ? `${val} 次` : '-' },
              { title: '英文名称', dataIndex: 'localName', key: 'localName', render: (val: string) => val || '-' },
              { 
                title: '试剂状态', 
                dataIndex: 'status', 
                key: 'status', 
                render: (status: ProductStatus) => {
                  const text = status === 'Effective' ? '在售' : status === 'Pending' ? '待定' : '下架';
                  const color = status === 'Effective' ? 'success' : status === 'Pending' ? 'warning' : 'error';
                  return <Tag color={color}>{text}</Tag>;
                } 
              },
              {
                title: '操作',
                key: 'action',
                render: (_: any, row: any) => {
                  const isEffective = row.status === 'Effective';
                  return (
                    <Button 
                      type="link" 
                      danger={isEffective}
                      onClick={async () => {
                        try {
                          if (isEffective) {
                            await api.subOfflineReagent(row.record.id, row.key);
                            message.success('已下架');
                          } else {
                            await api.subPublishReagent(row.record.id, row.key);
                            message.success('已上架');
                          }
                          await onRefresh();
                        } catch (err: any) {
                          message.error(err.message || '操作失败');
                        }
                      }}
                    >
                      {isEffective ? '下架' : '上架'}
                    </Button>
                  );
                }
              }
            ];

            return (
              <div className="bg-white p-6 m-2 rounded-sm shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-base text-gray-800">在售区域</div>
                  <Space>
                    <Button icon={<RefreshCw size={14} />} type="text" />
                  </Space>
                </div>
                {syncData.length > 0 ? (
                  <Table
                    dataSource={syncData}
                    columns={syncColumns}
                    pagination={false}
                    size="middle"
                  />
                ) : (
                  <div className="text-center py-8 text-gray-400">该试剂尚未同步至任何业务系统</div>
                )}
              </div>
            );
          },
        }}
      />

      <Modal
        title={readOnly ? "试剂详情" : (editingReagent ? "编辑试剂" : "新增试剂")}
        open={isModalOpen}
        onOk={readOnly ? undefined : onModalSubmit}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={submitting}
        footer={readOnly ? <Button onClick={() => setIsModalOpen(false)}>关闭</Button> : undefined}
        centered styles={{ body: MODAL_BODY_STYLE }}
      >
        <Form form={form} layout="vertical" disabled={readOnly}>
          <Form.Item name="productId" label="关联检测产品 (仅限生效产品)" rules={[{ required: true }]}>
            <Select 
              placeholder="请选择已生效的产品"
              options={effectiveProducts.map(p => ({
                value: p.id,
                label: `${p.nameCn} (${p.code})`
              }))}
            />
          </Form.Item>
          <Form.Item name="category" label="分类" rules={[{ required: true }]}>
            <Select 
              placeholder="请选择分类"
              options={[
                { value: 'Panel类', label: 'Panel类' },
                { value: '建库类', label: '建库类' },
                { value: '定量类', label: '定量类' },
                { value: '提取类', label: '提取类' },
                { value: '单位点检测类', label: '单位点检测类' },
                { value: 'SSR检测类', label: 'SSR检测类' },
                { value: '其它', label: '其它' },
              ]}
            />
          </Form.Item>
          <Form.Item name="name" label="名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="spec" label="规格" rules={[{ required: true }]}><Input /></Form.Item>
          
          <div className="mb-2 font-medium">库房配置</div>
          <Form.List name="warehouses">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} className="flex gap-2 items-start mb-2">
                    <Form.Item
                      {...restField}
                      name={[name, 'warehouse']}
                      rules={[{ required: true, message: '请输入库房' }]}
                      className="mb-0 flex-1"
                    >
                      <Input placeholder="输入库房" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'itemNo']}
                      rules={[{ required: true, message: '请输入货号' }]}
                      className="mb-0 flex-1"
                    >
                      <Input placeholder="货号" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'kingdeeCode']}
                      rules={[{ required: true, message: '请输入金蝶物料编码' }]}
                      className="mb-0 flex-1"
                    >
                      <Input placeholder="金蝶物料编码" />
                    </Form.Item>
                    {fields.length > 1 && (
                      <Button 
                        type="text" 
                        danger 
                        icon={<MinusCircle size={16} />} 
                        onClick={() => remove(name)} 
                      />
                    )}
                  </div>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<Plus size={16} />}>
                    添加库房
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>

      <Modal
        title="同步试剂"
        onCancel={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
        width={500}
        onOk={onSyncSubmit}
        okText="提交同步"
        confirmLoading={submitting}
        centered styles={{ body: MODAL_BODY_STYLE }}
      >
        <Form form={syncForm} layout="vertical" className="mt-4">
          <div className="border rounded-lg p-4 mb-4 bg-white shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <Text strong>大陆 MIMS</Text>
              <Form.Item name="syncMainland" valuePropName="checked" noStyle><Switch /></Form.Item>
            </div>
            <Form.Item noStyle shouldUpdate={(prev, curr) => prev.syncMainland !== curr.syncMainland}>
              {({ getFieldValue }) => getFieldValue('syncMainland') && (
                <div className="mt-2">
                  <Form.Item name="mainlandAlert" label="预警值(次)" rules={[{ required: true }]}><InputNumber min={1} precision={0} style={{ width: '100%' }} /></Form.Item>
                </div>
              )}
            </Form.Item>
          </div>

          <div className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <Text strong>海外 MIMS</Text>
              <Form.Item name="syncOverseas" valuePropName="checked" noStyle><Switch /></Form.Item>
            </div>
            <Form.Item noStyle shouldUpdate={(prev, curr) => prev.syncOverseas !== curr.syncOverseas}>
              {({ getFieldValue }) => getFieldValue('syncOverseas') && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Form.Item name="overseasAlert" label="预警值(次)" rules={[{ required: true }]}><InputNumber min={1} precision={0} style={{ width: '100%' }} /></Form.Item>
                  <Form.Item name="overseasLocalName" label="英文名称" rules={[{ required: true }]}><Input /></Form.Item>
                </div>
              )}
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [currentMenu, setCurrentMenu] = useState('product-center-manage');
  const [products, setProducts] = useState<Product[]>([]);
  const [reagents, setReagents] = useState<Reagent[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (err: any) {
      message.error(err.message || '获取产品列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchReagents = async () => {
    setLoading(true);
    try {
      const data = await api.getReagents();
      setReagents(data);
    } catch (err: any) {
      message.error(err.message || '获取试剂列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchReagents();
  }, []);

  const menuItems: MenuProps['items'] = [
    {
      key: 'product-center',
      label: '产品试剂中心',
      icon: <LayoutDashboard size={18} />,
      children: [
        { key: 'product-center-manage', label: '产品管理', icon: <Package size={16} /> },
        { key: 'product-center-reagent', label: '试剂管理', icon: <FlaskConical size={16} /> },
      ],
    },
    {
      key: 'mainland-mims',
      label: '大陆 MIMS',
      icon: <MapPin size={18} />,
      children: [
        { key: 'mainland-product', label: '产品列表', icon: <Database size={16} /> },
        { key: 'mainland-reagent', label: '试剂列表', icon: <FlaskConical size={16} /> },
      ],
    },
    {
      key: 'overseas-mims',
      label: '海外 MIMS',
      icon: <Globe size={18} />,
      children: [
        { key: 'overseas-product', label: '产品列表', icon: <Database size={16} /> },
        { key: 'overseas-reagent', label: '试剂列表', icon: <FlaskConical size={16} /> },
      ],
    },
  ];

  const renderContent = () => {
    switch (currentMenu) {
      case 'product-center-manage':
        return <ProductManagement products={products} onRefresh={fetchProducts} />;
      case 'product-center-reagent':
        return <ReagentManagement reagents={reagents} onRefresh={fetchReagents} products={products} />;
      case 'mainland-product':
        return <ProductManagement products={products} onRefresh={fetchProducts} readOnly filterSystem="Mainland" />;
      case 'mainland-reagent':
        return <ReagentManagement reagents={reagents} onRefresh={fetchReagents} products={products} readOnly filterSystem="Mainland" />;
      case 'overseas-product':
        return <ProductManagement products={products} onRefresh={fetchProducts} readOnly filterSystem="Overseas" />;
      case 'overseas-reagent':
        return <ReagentManagement reagents={reagents} onRefresh={fetchReagents} products={products} readOnly filterSystem="Overseas" />;
      default:
        return <div className="p-10 text-center"><Info className="mx-auto mb-2" />请选择菜单</div>;
    }
  };

  const getBreadcrumb = () => {
    switch (currentMenu) {
      case 'product-center-manage': return '产品试剂中心 / 产品管理';
      case 'product-center-reagent': return '产品试剂中心 / 试剂管理';
      case 'mainland-product': return '大陆 MIMS / 产品列表';
      case 'mainland-reagent': return '大陆 MIMS / 试剂列表';
      case 'overseas-product': return '海外 MIMS / 产品列表';
      case 'overseas-reagent': return '海外 MIMS / 试剂列表';
      default: return '';
    }
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 6,
        },
        components: {
          Layout: {
            siderBg: '#001529',
            headerBg: '#ffffff',
          },
          Menu: {
            darkItemBg: '#001529',
            darkSubMenuItemBg: '#000c17',
          }
        }
      }}
    >
      <Layout style={{ minHeight: '100vh' }}>
        <Sider width={240} theme="dark" style={{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0, top: 0, bottom: 0 }}>
          <div className="h-16 flex items-center px-4 gap-3">
            <div className="w-8 h-8 bg-[#23523B] rounded-full flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-5 h-5">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" fill="#23523B" stroke="none" />
                <path d="M12 22V12M12 12C12 6 18 6 18 6M12 12C12 18 6 18 6 18" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-white text-lg font-bold">MolBreeding</span>
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[currentMenu]}
            defaultOpenKeys={['product-center']}
            items={menuItems}
            onClick={({ key }) => setCurrentMenu(key)}
          />
        </Sider>
        <Layout style={{ marginLeft: 240 }}>
          <Header className="px-6 flex items-center justify-between border-b" style={{ padding: '0 24px', position: 'sticky', top: 0, zIndex: 10 }}>
            <Space size="middle">
              <MenuIcon size={20} className="cursor-pointer text-gray-500" />
              <div className="text-gray-500 text-sm">
                {getBreadcrumb().split(' / ').map((part, index, array) => (
                  <React.Fragment key={index}>
                    {index > 0 && ' / '}
                    <span className={index === array.length - 1 ? "text-gray-800" : ""}>{part}</span>
                  </React.Fragment>
                ))}
              </div>
            </Space>
            <Space size="large">
              <Badge dot><Settings size={20} className="text-gray-500 cursor-pointer mt-1" /></Badge>
              <div className="flex items-center gap-2 cursor-pointer">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">B</div>
                <Text strong>Admin</Text>
              </div>
            </Space>
          </Header>
          <Content className="bg-[#f0f2f5] p-4" style={{ overflow: 'auto', height: 'calc(100vh - 64px)' }}>
            <div className="bg-white rounded-lg min-h-full shadow-sm">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentMenu}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Spin spinning={loading}>
                    {renderContent()}
                  </Spin>
                </motion.div>
              </AnimatePresence>
            </div>
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}
