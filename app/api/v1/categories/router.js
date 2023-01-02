// import router dari express
const express = require('express');
const router = express();

// import product controller
const { create, index, find, update, destroy } = require('./controller');

// pasangkan route endpoint dengan method 'create'
router.post('/categories', create);
// pasangkan route endpoint dengan method 'index'
router.get('/categories', index);
// pasangkan route endpoint dengan method 'find'
router.get('/categories/:id', find);
// pasangkan route endpoint dengan method 'update'
router.put('/categories/:id', update);
// pasangkan route endpoint dengan method 'destroy'
router.delete('/categories/:id', destroy);

// export router
module.exports = router;