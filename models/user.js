const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const modelSchema = new Schema(
    {
        name: { type: String },
        password: { type: String, required: true },
        email: { type: String, required: true },
        cart: Schema.Types.Mixed,
        resetToken: String,
        resetTokenExpire: Date,
    },
    { minimize: false }
);
const Order = require("./order");

modelSchema.methods.addToCart = function (product) {
    if (this.cart[product._id]) {
        // increase quantity
        this.cart[product._id].quantity += 1;
        this.markModified("cart");
        return this.save();
    }

    // no such item yet, add it
    this.cart[product._id] = { product: product, quantity: 1 };
    this.markModified("cart");
    return this.save();
};

modelSchema.methods.getCart = function () {
    return this.cart;
};

modelSchema.methods.deleteFromCart = function (productId) {
    if ((this.cart[productId].quantity -= 1) == 0) {
        delete this.cart[productId];
    }
    this.markModified("cart");
    return this.save();
};

modelSchema.methods.checkout = function () {
    const order = new Order({
        cart: this.cart,
        user: { name: this.name, email: this.email, id: this._id },
    });
    order.markModified("cart");
    order.markModified("user");
    return order
        .save()
        .then((_) => {
            this.cart = {};
            this.markModified("cart");
            return this.save();
        })
        .catch((err) => {
            console.log(err);
        });
};

modelSchema.methods.getOrders = function () {
    return Order.find({ "user.id": this._id }).catch((err) => {
        console.log(err);
    });
};

module.exports = mongoose.model("User", modelSchema);
module.exports.schema = modelSchema;
