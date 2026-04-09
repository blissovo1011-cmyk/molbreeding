import type { Request, Response, NextFunction } from 'express';
import * as productService from '../services/productService.js';
import * as syncService from '../services/syncService.js';
import type { SubSystem } from '../types.js';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const category = req.query.category as string | undefined;
    const system = req.query.system as SubSystem | undefined;
    const products = await productService.listProducts({ category, system });
    res.json({ success: true, data: products });
  } catch (err) { next(err); }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await productService.getProduct(req.params.id);
    res.json({ success: true, data: product });
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    res.json({ success: true, data: product });
  } catch (err) { next(err); }
}

export async function publish(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await productService.publishProduct(req.params.id, req.body);
    res.json({ success: true, data: product });
  } catch (err) { next(err); }
}

export async function offline(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await productService.offlineProduct(req.params.id, req.body);
    res.json({ success: true, data: product });
  } catch (err) { next(err); }
}

export async function syncConfig(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await syncService.updateProductSync(req.params.id, req.body);
    res.json({ success: true, data: product });
  } catch (err) { next(err); }
}

export async function subPublish(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await syncService.subPublishProduct(req.params.id, req.body.system);
    res.json({ success: true, data: product });
  } catch (err) { next(err); }
}

export async function subOffline(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await syncService.subOfflineProduct(req.params.id, req.body.system);
    res.json({ success: true, data: product });
  } catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await productService.deleteProduct(req.params.id);
    res.json({ success: true, data: null });
  } catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await productService.deleteProduct(req.params.id);
    res.json({ success: true, data: null });
  } catch (err) { next(err); }
}
