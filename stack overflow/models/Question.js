const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const QuestionSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "myUsers"
  },
  name: {
    type: String
  },
  yourques: {
    type: String,
    require: true
  },
  code: {
    type: String,
    required: true
  },
  upvotes: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "myUsers"
      }
    }
  ],
  answers: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "myUsers"
      },
      ans: {
        type: String,
        required: true
      },
      name: {
        type: String
      },
      date: {
        type: Date,
        default: Date.now
      }
    }
  ],
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = Question = mongoose.model("myQuestion", QuestionSchema);
