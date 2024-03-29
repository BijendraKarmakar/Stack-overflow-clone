const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

//Load Person Model
const Person = require("../../models/Person");

//Load Profile Model
const Profile = require("../../models/Profile");

//Load Question Model
const Question = require("../../models/Question");

//@type     GET
//@route    /api/questions
//@desc     route for getting all questions
//@access   PUBLIC
router.get("/", (req, res) => {
  Question.find()
    .sort("-date")
    .then(questions => res.json(questions))
    .catch(err => res.json({ noquestions: "No questions found" }));
});

//@type     POST
//@route    /api/questions/ask
//@desc     route for asking questions
//@access   PRIVATE
router.post(
  "/ask",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const newQuestions = new Question({
      user: req.body.id,
      name: req.body.name,
      yourques: req.body.yourques,
      code: req.body.code
    });
    newQuestions
      .save()
      .then(questions => res.json(questions))
      .catch(err => console.log("Error in uploading your question " + err));
  }
);

//@type     POST
//@route    /api/questions/answer/:id
//@desc     route for submitting answers to the questions
//@access   PRIVATE

router.post(
  "/answer/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Question.findById(req.params.id)
      .then(question => {
        const newAnswer = {
          user: req.user.id,
          ans: req.body.ans,
          name: req.body.name
        };

        question.answers.push(newAnswer);
        question
          .save()
          .then(question => res.json(question))
          .catch(err => console.log(err));
      })
      .catch(err => console.log(err));
  }
);

//@type     POST
//@route    /api/questions/upvote/:id
//@desc     route for upvoting the question
//@access   PRIVATE
router.post(
  "/upvote/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        Question.findById(req.params.id)
          .then(question => {
            if (
              question.upvotes.filter(
                upvote => upvote.user.toString() === req.user.id.toString()
              ).length > 0
            ) {
              return res.status(400).json({ noupvote: "User already upvoted" });
            }
            question.upvotes.push({ user: req.user.id });
            question
              .save()
              .then(question => res.json(question))
              .catch(err => console.log(err));
          })
          .catch(err => console.log(err));
      })
      .catch(err => console.log(err));
  }
);

module.exports = router;
