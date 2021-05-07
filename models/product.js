const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const productSchema = new Schema({
    title: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: false },
    imageUrl: { type: String, required: false },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
});
module.exports.Product = mongoose.model("Product", productSchema);
module.exports.productSchema = productSchema;
