import { Router } from 'express';
import * as productController from '../controllers/productController.js';

const router = Router();

// CRUD routes
router.get('/', productController.list);
router.get('/:id', productController.getById);
router.post('/', productController.create);
router.put('/:id', productController.update);

router.post('/:id/publish', productController.publish);
router.post('/:id/offline', productController.offline);
router.put('/:id/sync', productController.syncConfig);
router.post('/:id/sub-publish', productController.subPublish);
router.post('/:id/sub-offline', productController.subOffline);

export default router;
