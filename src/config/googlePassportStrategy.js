import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import Client from "../models/Clients/model.js";
const googlePassportStrategy = (passport) => {
  passport.serializeUser((user, done) => {
    done(null, user.id);    
  });
  passport.deserializeUser(async (id, done) => {
    const user = await Client.findOne({ "ssoAuth.googleId": id });
    done(null, user);
  });
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENTID,
        clientSecret: process.env.GOOGLE_CLIENTSECRET,
        callbackURL: "http://localhost:3000/api/v1/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        let userObj = { 
          ssoAuth: { googleId: profile.id },
          fullname: profile.displayName,
          // firstName: profile.name.givenName,
          // lastName: profile.name.familyName,
          email: profile.emails[0].value,
          password: "",
                      role: "client",
        };
        const existingUser = await Client.findOne({ 
          "ssoAuth.googleId": profile.id,
        });
        if (existingUser) {
          return done(null, existingUser);
        }
        //handle create user fields
        const user = await Client.create(userObj);
        return done(null, user);
      }
    )
  );
};
export default googlePassportStrategy 
