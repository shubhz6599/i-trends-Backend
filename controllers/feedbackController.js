const Feedback = require("../models/Feedback");

const submitFeedback = async (req, res) => {
  try {
    // Convert the structured feedback to a JSON string
    const feedbackMessage = JSON.stringify(req.body);

    // Save the feedback in the database
    const feedback = await Feedback.create({
      userId: req.user.id,
      message: feedbackMessage,
    });

    res.status(201).json({ message: 'Feedback submitted successfully', feedback });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getMyFeedback = async (req, res) => {
  try {
    // Find feedback for the logged-in user
    const feedbacks = await Feedback.find({ userId: req.user.id });

    // Parse the JSON string into a JavaScript object for each feedback
    const structuredFeedbacks = feedbacks.map((feedback) => ({
      ...feedback._doc,
      message: JSON.parse(feedback.message),
    }));

    res.json(structuredFeedbacks);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  submitFeedback,
  getMyFeedback
};
