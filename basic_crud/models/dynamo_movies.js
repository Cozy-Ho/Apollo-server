import dynamoose from "dynamoose";

const movieSchema = new dynamoose.Schema(
  {
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
  },
  {
    timestamps: {
      createdAt: ["createDate", "creation"],
      updatedAt: ["updateDate", "updated"],
    },
  }
);

module.exports = dynamoose.model("test02-movie", movieSchema);
