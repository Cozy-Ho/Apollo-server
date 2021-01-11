import mongoose from "mongoose";

const { Schema } = mongoose;

const movieSchema = new Schema({
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
