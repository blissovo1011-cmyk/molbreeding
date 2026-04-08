import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_DATABASE || 'molbreeding',
  entities: ['src/**/*.entity{.ts,.js}'],
  migrations: ['src/database/migrations/*{.ts,.js}'],
  synchronize: false,
});

const seed = async () => {
  await AppDataSource.initialize();
  console.log('Database connected');

  const userRepo = AppDataSource.getRepository('User');
  const warehouseRepo = AppDataSource.getRepository('Warehouse');
  const productRepo = AppDataSource.getRepository('Product');
  const reagentRepo = AppDataSource.getRepository('Reagent');

  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  const admin = await userRepo.save({
    username: 'admin',
    password: adminPassword,
    name: '系统管理员',
    email: 'admin@molbreeding.com',
    department: '技术部',
    role: 'admin',
    status: 'active',
  });

  const user = await userRepo.save({
    username: 'user',
    password: userPassword,
    name: '测试用户',
    email: 'user@molbreeding.com',
    department: '研发部',
    role: 'user',
    status: 'active',
  });

  console.log('Users seeded');

  const warehouse1 = await warehouseRepo.save({
    code: 'WH-DOM-001',
    name: '国内仓库',
    type: 'domestic',
    location: '北京市昌平区',
    contact: '张三',
    phone: '13800138000',
    status: 'active',
  });

  const warehouse2 = await warehouseRepo.save({
    code: 'WH-ML-001',
    name: '大陆仓库',
    type: 'mainland',
    location: '上海市浦东新区',
    contact: '李四',
    phone: '13900139000',
    status: 'active',
  });

  console.log('Warehouses seeded');

  const products = await productRepo.save([
    {
      code: 'P001',
      version: 'v1.0',
      nameCn: '水稻基因组检测套餐A',
      nameEn: 'Rice Genome Panel A',
      category: '自主研发',
      productType: '基因组检测',
      productTech: 'GBS',
      species: '水稻',
      status: 'effective',
      alertValue: 50,
      finalReport: true,
      dataStandardGb: '10',
      refGenome: 'IRGSP1.0',
      createdBy: admin.id,
      updatedBy: admin.id,
    },
    {
      code: 'P002',
      version: 'v2.0',
      nameCn: '玉米SNP芯片检测',
      nameEn: 'Maize SNP Chip Assay',
      category: '自主研发',
      productType: 'SNP检测',
      productTech: '芯片',
      species: '玉米',
      status: 'effective',
      alertValue: 100,
      finalReport: true,
      dataStandardGb: '5',
      refGenome: 'B73_v4',
      createdBy: admin.id,
      updatedBy: admin.id,
    },
    {
      code: 'P003',
      version: 'v1.0',
      nameCn: '小麦全基因组关联分析',
      nameEn: 'Wheat GWAS Service',
      category: '定制开发',
      productType: 'GWAS',
      productTech: 'WGS',
      species: '小麦',
      status: 'pending',
      clientUnit: '某某农业公司',
      clientName: '王五',
      alertValue: 30,
      createdBy: user.id,
      updatedBy: user.id,
    },
  ]);

  console.log('Products seeded');

  const reagents = await reagentRepo.save([
    {
      category: '提取试剂',
      name: '植物基因组DNA提取试剂盒',
      productId: products[0].id,
      spec: '50T',
      status: 'effective',
      batchNo: 'BT20240101',
      stock: 200,
      createdBy: admin.id,
      updatedBy: admin.id,
    },
    {
      category: '检测试剂',
      name: 'PCR扩增试剂盒',
      productId: products[0].id,
      spec: '100T',
      status: 'effective',
      batchNo: 'BT20240102',
      stock: 150,
      createdBy: admin.id,
      updatedBy: admin.id,
    },
    {
      category: '芯片试剂',
      name: '水稻芯片杂交试剂',
      productId: products[1].id,
      spec: '24反应',
      status: 'pending',
      batchNo: 'BT20240103',
      stock: 50,
      createdBy: user.id,
      updatedBy: user.id,
    },
  ]);

  console.log('Reagents seeded');

  const reagentWarehouseConfigRepo = AppDataSource.getRepository('ReagentWarehouseConfig');
  await reagentWarehouseConfigRepo.save([
    {
      reagentId: reagents[0].id,
      warehouseId: warehouse1.id,
      itemNo: 'IT001',
      kingdeeCode: 'KD001',
      currentStock: 200,
      alertStock: 20,
    },
    {
      reagentId: reagents[0].id,
      warehouseId: warehouse2.id,
      itemNo: 'IT002',
      kingdeeCode: 'KD002',
      currentStock: 100,
      alertStock: 10,
    },
  ]);

  console.log('Reagent warehouse configs seeded');

  console.log('All seed data completed!');
  await AppDataSource.destroy();
};

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
