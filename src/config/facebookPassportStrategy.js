const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { default: Client } = require("../models/Clients/model");

const facebookPassportStrategy = (passport) => {
  passport.serializeUser(function (user, cb) {
    cb(null, user);
  });

  passport.deserializeUser(function (user, cb) {
    cb(null, user);
  });

  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_CLIENTID,
        clientSecret: process.env.FACEBOOK_CLIENTSECRET,
        callbackURL: process.env.FACEBOOK_CALLBACKURL,
      },
      async function (accessToken, refreshToken, profile, done) {
        if (profile) {
          let userObj = {
            fullname: profile.displayName,
            ssoAuth: { facebookId: profile.id },
            email: profile.emails !== undefined ? profile.emails[0].value : "",
            password: "",
            role: "client",
          };
          let found = await Client.findOne({ email: userObj.email });
          if (found) {
            const id = found.id;
            await Client.updateOne({ _id: id }, userObj);
          } else {
            await Client.create(userObj);
          }
          let user = await Client.findOne({ "ssoAuth.googleId": profile.id });
          return done(null, user);
        }
        return done(null, null);
      }
    )
  );
};

module.exports = { facebookPassportStrategy };
