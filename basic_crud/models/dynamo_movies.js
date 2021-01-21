import dynamoose from "dynamoose";

const movieSchema = new dynamoose.Schema(
  {
    dumy: {
      type: Number,
      required: true,
      hashKey: true,
    },
    id: {
      type: String,
      required: true,
      rangeKey: true,
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
    lang: {
      type: String,
    },
    subtitle: {
      type: String,
    },
    dubbing: {
      type: String,
    },
  },
  {
    useDocumentTypes: true,
    saveUnknown: true,
  }
);

module.exports = dynamoose.model("test02-movie3", movieSchema);
