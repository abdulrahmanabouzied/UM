import passport from"passport"
import { Router } from "express";
const app = Router();

app.get("/google/error", (req, res) => {
    res.json({ message: "Login Failed" });
  });
  //add the url !
//   const CLIENT_URL =process.env.CLIENT_URL
  app.get(
    "/google/signin",
    passport.authenticate("google", {
      successRedirect: "/",
      failureRedirect: "/google/error",
      scope: ["profile", "email"],
    })
  );
  app.get(
    "/google/callback", passport.authenticate("google", {failureRedirect: `${CLIENT_URL}/login`,}),
   async function (req, res) {
      const clientUrl = req.headers.origin || req.headers.referer;
      const existingUser=req.user
    //   createSendToken(existingUser, 200, res,clientUrl)
    }
  );
module.exports=app