import Feedback from '../models/Feedback.js';

export const submitFeedback = async (req, res) => {
  const feedback = await Feedback.create({ userId: req.user.id, message: req.body.message });
  res.json(feedback);
};

export const getMyFeedback = async (req, res) => {
  const feedback = await Feedback.find({ userId: req.user.id });
  res.json(feedback);
};