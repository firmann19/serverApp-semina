const express = require("express");
const router = express();
const { createCMSOrganizer } = require("./controller");
// import authentication
const {
    authenticateUser,
    authorizeRoles,
  } = require("../../../middlewares/auth");

router.post("/organizers", authenticateUser, authorizeRoles('owner'), createCMSOrganizer);
router.post("/users", authenticateUser, authorizeRoles('organizer'), createCMSOrganizer);

module.exports = router;
