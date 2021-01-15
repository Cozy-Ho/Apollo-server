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
  desc: {
    type: String,
    required: false,
  },
  score: {
    type: Number,
    required: false,
  },
  watched: {
    type: Boolean,
    required: false,
  },
});

module.exports = mongoose.model("Movie", movieSchema);
