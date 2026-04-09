import { Router } from 'express';
import * as reagentController from '../controllers/reagentController.js';

const router = Router();

// CRUD routes
router.get('/', reagentController.list);
router.get('/:id', reagentController.getById);
router.post('/', reagentController.create);
router.put('/:id', reagentController.update);
router.delete('/:id', reagentController.remove);

router.post('/:id/publish', reagentController.publish);
router.post('/:id/offline', reagentController.offline);
router.put('/:id/sync', reagentController.syncConfig);
router.post('/:id/sub-publish', reagentController.subPublish);
router.post('/:id/sub-offline', reagentController.subOffline);

export default router;
