import session from "express-session";
import mongoStore from "connect-mongodb-session";
import { config } from "dotenv";
config();

const sessionStore = mongoStore(session);
const webStore = new sessionStore({
  uri: process.env.DB_URI || process.env.DB_LOCAL,
  collection: "Sessions",
});

webStore.on("error", (err) => {
  console.log(`WebStore error.message: ${err.message}`);
  console.log(`WebStore error.name: ${err.name}`);
  console.log(`WebStore error.stack: ${err.stack}`);
});

export default session({
  store: webStore,
  resave: false,
  saveUninitialized: false,
  secret: process.env.SESSION_SECRET,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60,
  },
});
