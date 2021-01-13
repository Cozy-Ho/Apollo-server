import mongoose from "mongoose";

const { Schema } = mongoose;

const movieSchema = new Schema({
  id: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    required: false,
  },
});

module.exports = mongoose.model("Movie", movieSchema);
