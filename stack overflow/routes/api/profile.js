const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

//Load Person Model
const Person = require("../../models/Person");

//Load Profile Model
const Profile = require("../../models/Profile");

//@type     GET
//@route    /api/profile
//@desc     route for personal profile page
//@access   PRIVATE
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        if (!profile) {
          return res.status(404).json({ profileError: "No profile found" });
        }
        res.json(profile);
      })
      .catch(err => console.log("Found some error in the profile " + err));
  }
);

//@type     POST
//@route    /api/profile
//@desc     route for updating/saving personal profile page
//@access   PRIVATE
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const profileValues = {};
    profileValues.user = req.user.id;
    if (req.body.username) profileValues.username = req.body.username;
    if (req.body.website) profileValues.website = req.body.website;
    if (req.body.country) profileValues.country = req.body.country;
    if (req.body.portfolio) profileValues.portfolio = req.body.portfolio;
    if (typeof req.body.languages !== undefined) {
      profileValues.languages = req.body.languages.split(",");
    }

    //Get social links
    profileValues.social = {};

    if (req.body.youtube) profileValues.social.youtube = req.body.youtube;
    if (req.body.facebook) profileValues.social.facebook = req.body.facebook;
    if (req.body.instragram)
      profileValues.social.instragram = req.body.instragram;

    //Do database stuff
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        if (profile) {
          Profile.findOneAndUpdate(
            { user: req.user.id },
            { $set: profileValues },
            { new: true }
          )
            .then(profile => res.json(profile))
            .catch(err => console.log("Problem in update " + err));
        } else {
          Profile.findOne({ username: profileValues.username })
            .then(profile => {
              //Username already exists
              if (profile) {
                res.status(400).json({ usererror: "Username already exits" });
              }
              //Save user
              new Profile(profileValues)
                .save()
                .then(profile => res.json(profile))
                .catch(err => console.log(err));
            })
            .catch(err => console.log(err));
        }
      })
      .catch(err => console.log("Problem in feteching the profile " + err));
  }
);

//@type     GET
//@route    /api/profile/user/:username
//@desc     route for getting user profile based on username
//@access   PUBLIC
router.get("/user/:username", (req, res) => {
  Profile.findOne({ username: req.params.username })
    .populate("user", ["name", "profilepic"])
    .then(profile => {
      if (!profile) {
        res.status(404).json({ usererror: "No user found with this username" });
      }
      res.json(profile);
    })
    .catch(err => console.log("Error in fetching your username: " + err));
});

//@type     GET
//@route    /api/profile/userid/:id
//@desc     route for getting user profile based on id
//@access   PUBLIC
router.get("/userid/:id", (req, res) => {
  Profile.findOne({ _id: req.params.id })
    .populate("user", ["name", "profilepic"])
    .then(profile => {
      if (!profile) {
        res.status(404).json({ usererror: "No user found with this id" });
      }
      res.json(profile);
    })
    .catch(err => console.log("Error in fetching your id: " + err));
});

//@type     GET
//@route    /api/profile/find/everyone
//@desc     route for getting user profile of everyone
//@access   PUBLIC
router.get("/find/everyone", (req, res) => {
  Profile.find()
    .populate("user", ["name", "profilepic"])
    .then(profiles => {
      if (!profiles) {
        res.status(404).json({ usererror: "No Profile/Account found" });
      }
      res.json(profiles);
    })
    .catch(err => console.log("Error in fetching your profiles: " + err));
});

//@type     DELETE
//@route    /api/profile
//@desc     route for DELETING user profile based on id
//@access   PRIVATE
router.delete(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id });
    Profile.findOneAndDelete({ user: req.user.id })
      .then(() => {
        Person.findOneAndDelete({ _id: req.user.id })
          .then(() =>
            res.json({ successdelete: "user profile successfully deleted" })
          )
          .catch(err => console.log("Error in deleting user profile " + err));
      })
      .catch(err => console.log(err));
  }
);

//@type     POST
//@route    /api/profile/experience
//@desc     route for updating work experience of a user
//@access   PRIVATE

router.post(
  "/experience",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        if (!profile) {
          res.status(404).json({ usererror: "No Profile/Account found" });
        }
        // Adding work experience
        const newWork = {
          role: req.body.role,
          company: req.body.company,
          country: req.body.country,
          from: req.body.from,
          to: req.body.to,
          current: req.body.current,
          details: req.body.details
        };
        profile.experience.push(newWork);
        profile
          .save()
          .then(profile => res.json(profile))
          .catch(err => console.log("saving unsuccessful " + err));
      })
      .catch(err => console.log(err));
  }
);

//@type     DELETE
//@route    /api/profile/experience/:ex_id
//@desc     route for deleting work experience of a user
//@access   PRIVATE

router.delete(
  "/experience/:ex_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        const removework = profile.experience
          .map(item => item.id)
          .indexOf(req.params.ex_id);

        profile.experience.splice(removework, 1);
        profile
          .save()
          .then(profile => res.json(profile))
          .catch(err => console.log(err));
      })
      .catch(err => console.log(err));
  }
);

module.exports = router;
