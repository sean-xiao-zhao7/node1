const fs = require("fs");

module.exports = (path) => {
    fs.unlink(path, (e) => {
        if (e) {
            throw e;
        }
    });
};
