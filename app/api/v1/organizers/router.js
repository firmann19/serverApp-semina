const express = require("express");
const router = express();
const { createCMSOrganizer, getCMSUsers } = require("./controller");
// import authentication
const {
    authenticateUser,
    authorizeRoles,
  } = require("../../../middlewares/auth");

router.post("/organizers", authenticateUser, authorizeRoles('owner'), createCMSOrganizer);
router.get("/users", authenticateUser, authorizeRoles('owner'), getCMSUsers);
router.post("/users", authenticateUser, authorizeRoles('organizer'), createCMSOrganizer);

module.exports = router;
