"use strict";

const nconf = module.exports = require("nconf");
const path = require("path");

nconf
    // 1. Command-line arguments
    .argv()
    // 2. Environment variables
    .env([
        "NODE_ENV",
        "OAUTH2_CLIENT_ID",
        "OAUTH2_CLIENT_SECRET",
        "OAUTH2_CALLBACK",
        "PORT",
        "SECRET",
        "MONGODB_URI"
    ])
    // 3. Config file
    .file({ file: path.join(__dirname, "config.json") })
    // 4. Defaults
    .defaults({
        OAUTH2_CLIENT_ID: "",
        OAUTH2_CLIENT_SECRET: "",
        OAUTH2_CALLBACK: "",
        MONGODB_URI: "",

        // Port of the HTTP server
        PORT: 3000,

        SECRET: "keyboardcat"
    });

checkConfig("OAUTH2_CLIENT_ID");
checkConfig("OAUTH2_CLIENT_SECRET");
checkConfig("MONGODB_URI");

function checkConfig (setting) {
    if (!nconf.get(setting)) {
        throw new Error(`You must set ${setting} as an environment variable or in config.json!`);
    }
}