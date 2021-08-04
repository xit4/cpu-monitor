const express = require("express");
const path = require("path");
const app = express();
const cpuAPI = require("./cpu");
const env = process.env.NODE_ENV || "development";

// serve the files in the build folder
app.use(express.static(path.join(__dirname, "../build")));

app.get("/api/cpu", (_, response) => {
  return response.json(cpuAPI.fetchLoadAvg());
});

// redirect any random undefined route to the index
app.get("*", (_, response) => {
  response.redirect("/");
});

const PORT = 4242
app.listen(PORT, () => {
  if (env === "development" || env === "dev") {
    console.log(
      `The CPU Monitor is served at http://localhost:${PORT}`
    );
  }
});
