const deleteProduct = (button) => {
    const prodId = button.parentNode.querySelector("[name=id]").value;
    const csrf = button.parentNode.querySelector("[name=_csrf]").value;
    fetch("/admin/delete-product-json/" + prodId, {
        method: "DELETE",
        headers: {
            "csrf-token": csrf,
        },
    })
        .then((result) => {
            return result.json();
        })
        .then((body) => {
            button.closest("article").remove();
        })
        .catch((e) => console.log(e));
};
