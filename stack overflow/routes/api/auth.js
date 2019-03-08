const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jsonwt = require("jsonwebtoken");
const passport = require("passport");
const key = require("../../setup/connect");

//@type     GET
//@route    /api/auth
//@desc     just for testing
//@access   PUBLIC
router.get("/", (req, res) => res.json({ test: "Auth is success" }));

//Import schema for users to register
const Person = require("../../models/Person");

//@type     POST
//@route    /api/auth/register
//@desc     route for user registration
//@access   PUBLIC
router.post("/register", (req, res) => {
  Person.findOne({ email: req.body.email })
    .then(person => {
      if (person) {
        return res
          .status(400)
          .json({ emailerror: "Email is already registered" });
      } else {
        const newPerson = new Person({
          name: req.body.name,
          email: req.body.email,
          password: req.body.password,
          username: req.body.username,
          gender: req.body.gender
        });
        //Encrypt password using bcrypt
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newPerson.password, salt, (err, hash) => {
            if (err) throw err;
            newPerson.password = hash;
            newPerson
              .save()
              .then(person => res.json(person))
              .catch(err => console.log(err));
          });
        });
      }
    })
    .catch(err => console.log(err));
});

//@type     POST
//@route    /api/auth/login
//@desc     route for user login
//@access   PUBLIC

router.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  Person.findOne({ email })
    .then(person => {
      if (!person) {
        return res
          .status(404)
          .json({ AccountError: "No account found with this email" });
      }
      bcrypt
        .compare(password, person.password)
        .then(isCorrect => {
          if (isCorrect) {
            // res.json({ success: "User is able to login successfully" });
            // use payload and create token for use
            const payload = {
              id: person.id,
              name: person.name,
              email: person.email
            };
            jsonwt.sign(
              payload,
              key.secret,
              { expiresIn: 3600 },
              (err, token) => {
                if (err) throw err;
                res.json({
                  success: true,
                  token: "Bearer " + token
                });
              }
            );
          } else {
            res.status(400).json({ passwordError: "Password is incorrect" });
          }
        })
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
});

//@type     GET
//@route    /api/auth/profile
//@desc     route for user profile
//@access   PRIVATE

router.get(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      gender: req.user.gender,
      profilepic: req.user.profilepic
    }),
      console.log("Hello " + req.user.name);
  }
);

module.exports = router;
