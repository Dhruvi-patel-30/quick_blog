import express from 'express'
import { adminLogin, approveCommentById, deleteCommentByID, getAllBlogsAdmin, getAllComments, getDashboard } from '../controller/adminController.js';
import  auth  from '../middleware/auth.js';

const adminRouter = express.Router();

adminRouter.post('/login', adminLogin);
adminRouter.get('/comments', auth,  getAllComments);
adminRouter.get('/blog', auth,  getAllBlogsAdmin);
adminRouter.post('/delete-comment', auth,  deleteCommentByID);
adminRouter.post('/approve-comment', auth,  approveCommentById);
adminRouter.get('/dashboard', auth,  getDashboard);


export default adminRouter;