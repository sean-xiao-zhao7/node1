const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const modelSchema = new Schema(
    {
        user: Schema.Types.Mixed,
        cart: Schema.Types.Mixed,
    },
    { minimize: false }
);

module.exports = mongoose.model("Order", modelSchema);
module.exports.schema = modelSchema;
