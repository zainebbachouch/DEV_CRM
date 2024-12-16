const express = require("express");
const commandsController = require("../controllers/commandsContoller");
const router = express.Router();

router.get("/getAllCommands", commandsController.getAllCommands);
router.get('/searchCommands/:searchTerm', commandsController.searchCommands);
router.get('/command/getCommandStats/', commandsController.getCommandsStats);

router.put("/updateStatus", commandsController.updateCommandStatus);
router.get("/getCommandsByClientId/:clientId", commandsController.getCommandsByClientId);
router.get("/getCommandsByCommandId/:CommandId", commandsController.getCommandsByCommandId);
router.get("/getCustomerByIDCommand/:CommandId", commandsController.getCustomerByIDCommand);


router.delete('/deleteCommand/:idcommande', commandsController.deleteCommand);

module.exports = router;
