// import router dari express
const express = require("express");
const router = express();

// import product controller
const { create, index, find, update, destroy } = require("./controller");

// import authentication
const {
  authenticateUser,
  authorizeRoles,
} = require("../../../middlewares/auth");

// pasangkan route endpoint dengan method 'create'
router.post(
  "/categories",
  authenticateUser,
  authorizeRoles("organizer"),
  create
);
// pasangkan route endpoint dengan method 'index'
router.get("/categories", authenticateUser, authorizeRoles("organizer"), index);
// pasangkan route endpoint dengan method 'find'
router.get(
  "/categories/:id",
  authenticateUser,
  authorizeRoles("organizer"),
  find
);
// pasangkan route endpoint dengan method 'update'
router.put(
  "/categories/:id",
  authenticateUser,
  authorizeRoles("organizer"),
  update
);
// pasangkan route endpoint dengan method 'destroy'
router.delete(
  "/categories/:id",
  authenticateUser,
  authorizeRoles("organizer"),
  destroy
);

// export router
module.exports = router;
