import type { Request, Response, NextFunction } from 'express';
import * as productService from '../services/productService.js';
import * as syncService from '../services/syncService.js';
import type { SubSystem } from '../types.js';

export function list(req: Request, res: Response, next: NextFunction): void {
  try {
    const category = req.query.category as string | undefined;
    const system = req.query.system as SubSystem | undefined;
    const products = productService.listProducts({ category, system });
    res.json({ success: true, data: products });
  } catch (err) {
    next(err);
  }
}

export function getById(req: Request, res: Response, next: NextFunction): void {
  try {
    const product = productService.getProduct(req.params.id);
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
}

export function create(req: Request, res: Response, next: NextFunction): void {
  try {
    const product = productService.createProduct(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
}

export function update(req: Request, res: Response, next: NextFunction): void {
  try {
    const product = productService.updateProduct(req.params.id, req.body);
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
}

export function publish(req: Request, res: Response, next: NextFunction): void {
  try {
    const product = productService.publishProduct(req.params.id, req.body);
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
}

export function offline(req: Request, res: Response, next: NextFunction): void {
  try {
    const product = productService.offlineProduct(req.params.id, req.body);
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
}

export function syncConfig(req: Request, res: Response, next: NextFunction): void {
  try {
    const product = syncService.updateProductSync(req.params.id, req.body);
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
}

export function subPublish(req: Request, res: Response, next: NextFunction): void {
  try {
    const product = syncService.subPublishProduct(req.params.id, req.body.system);
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
}

export function subOffline(req: Request, res: Response, next: NextFunction): void {
  try {
    const product = syncService.subOfflineProduct(req.params.id, req.body.system);
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
}
