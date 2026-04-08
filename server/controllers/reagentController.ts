import type { Request, Response, NextFunction } from 'express';
import * as reagentService from '../services/reagentService.js';
import * as syncService from '../services/syncService.js';
import type { SubSystem } from '../types.js';

export function list(req: Request, res: Response, next: NextFunction): void {
  try {
    const system = req.query.system as SubSystem | undefined;
    const reagents = reagentService.listReagents({ system });
    res.json({ success: true, data: reagents });
  } catch (err) {
    next(err);
  }
}

export function getById(req: Request, res: Response, next: NextFunction): void {
  try {
    const reagent = reagentService.getReagent(req.params.id);
    res.json({ success: true, data: reagent });
  } catch (err) {
    next(err);
  }
}

export function create(req: Request, res: Response, next: NextFunction): void {
  try {
    const reagent = reagentService.createReagent(req.body);
    res.status(201).json({ success: true, data: reagent });
  } catch (err) {
    next(err);
  }
}

export function update(req: Request, res: Response, next: NextFunction): void {
  try {
    const reagent = reagentService.updateReagent(req.params.id, req.body);
    res.json({ success: true, data: reagent });
  } catch (err) {
    next(err);
  }
}

export function publish(req: Request, res: Response, next: NextFunction): void {
  try {
    const reagent = reagentService.publishReagent(req.params.id);
    res.json({ success: true, data: reagent });
  } catch (err) {
    next(err);
  }
}

export function offline(req: Request, res: Response, next: NextFunction): void {
  try {
    const reagent = reagentService.offlineReagent(req.params.id);
    res.json({ success: true, data: reagent });
  } catch (err) {
    next(err);
  }
}

export function syncConfig(req: Request, res: Response, next: NextFunction): void {
  try {
    const reagent = syncService.updateReagentSync(req.params.id, req.body);
    res.json({ success: true, data: reagent });
  } catch (err) {
    next(err);
  }
}

export function subPublish(req: Request, res: Response, next: NextFunction): void {
  try {
    const reagent = syncService.subPublishReagent(req.params.id, req.body.system);
    res.json({ success: true, data: reagent });
  } catch (err) {
    next(err);
  }
}

export function subOffline(req: Request, res: Response, next: NextFunction): void {
  try {
    const reagent = syncService.subOfflineReagent(req.params.id, req.body.system);
    res.json({ success: true, data: reagent });
  } catch (err) {
    next(err);
  }
}
