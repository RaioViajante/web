// minimatch 3 exported the matcher itself (`require("minimatch")(path, glob)`),
// with Minimatch, filter, match and friends hanging off it. minimatch 11 only
// has named exports, but its `minimatch` function carries the same members.
module.exports = require("minimatch-modern").minimatch;
