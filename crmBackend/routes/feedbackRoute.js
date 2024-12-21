const express = require("express");
const feedbackController = require("../controllers/feedbackController");
const router = express.Router();

router.get('/feedback', feedbackController.getAllFeedback);
router.post('/createfeedback', feedbackController.createFeedback);
router.put('/updatefeedback/:idfeedback', feedbackController.updateFeedback);
router.delete('/feedback/:idfeedback', feedbackController.deleteFeedback);
router.post('/likedislike',feedbackController.Like_Dislike_Feedback)
module.exports = router;
