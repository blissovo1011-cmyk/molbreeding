import type { Request, Response, NextFunction } from 'express';
import * as reagentService from '../services/reagentService.js';
import * as syncService from '../services/syncService.js';
import type { SubSystem } from '../types.js';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const system = req.query.system as SubSystem | undefined;
    const reagents = await reagentService.listReagents({ system });
    res.json({ success: true, data: reagents });
  } catch (err) { next(err); }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const reagent = await reagentService.getReagent(req.params.id);
    res.json({ success: true, data: reagent });
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const reagent = await reagentService.createReagent(req.body);
    res.status(201).json({ success: true, data: reagent });
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const reagent = await reagentService.updateReagent(req.params.id, req.body);
    res.json({ success: true, data: reagent });
  } catch (err) { next(err); }
}

export async function publish(req: Request, res: Response, next: NextFunction) {
  try {
    const reagent = await reagentService.publishReagent(req.params.id);
    res.json({ success: true, data: reagent });
  } catch (err) { next(err); }
}

export async function offline(req: Request, res: Response, next: NextFunction) {
  try {
    const reagent = await reagentService.offlineReagent(req.params.id);
    res.json({ success: true, data: reagent });
  } catch (err) { next(err); }
}

export async function syncConfig(req: Request, res: Response, next: NextFunction) {
  try {
    const reagent = await syncService.updateReagentSync(req.params.id, req.body);
    res.json({ success: true, data: reagent });
  } catch (err) { next(err); }
}

export async function subPublish(req: Request, res: Response, next: NextFunction) {
  try {
    const reagent = await syncService.subPublishReagent(req.params.id, req.body.system);
    res.json({ success: true, data: reagent });
  } catch (err) { next(err); }
}

export async function subOffline(req: Request, res: Response, next: NextFunction) {
  try {
    const reagent = await syncService.subOfflineReagent(req.params.id, req.body.system);
    res.json({ success: true, data: reagent });
  } catch (err) { next(err); }
}
