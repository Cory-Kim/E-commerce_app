const express = require('express');
const { createUser, loginUserCtrl, getAllUser, getSingleUser, deleteSingleUser, updateUser, blockUser, unblockUser } = require('../controller/userCtrl');
const {authMiddleware, isAdmin} = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/register', createUser);
router.post('/login', loginUserCtrl);
router.get('/all-users', getAllUser);
router.get('/:id', authMiddleware, isAdmin, getSingleUser);
router.delete('/:id', deleteSingleUser);
router.put('/edit-user', authMiddleware, updateUser);

router.put('/block-user/:id', authMiddleware, isAdmin, blockUser);
router.put('/unblock-user/:id', authMiddleware, isAdmin, unblockUser);

module.exports = router;