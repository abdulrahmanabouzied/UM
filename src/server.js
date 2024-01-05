import app from "./config/app.js";

app.listen(process.env.PORT || 8080, () => {
  console.log(`listening on port ${process.env.PORT || 8080}`);
});
