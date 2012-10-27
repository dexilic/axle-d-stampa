function showProduct(id) {
    hideAllProducts();

    showProductDetails(id);

    deActivateProduct(id);
}

function hideAllProducts() {
    $('.visible').attr('class', 'not-visible');
}

function showProductDetails(id) {
    $('#header-' + id).attr('class', 'visible');
    $('#image-' + id).attr('class', 'visible');
    $('#desc-' + id).attr('class', 'visible');
}

function deActivateProduct(id) {
    $('.product-link').attr('class', 'product-link');

    $('#product-title-link-' + id).attr('class', 'product-link active');
    $('#product-image-link-' + id).attr('class', 'product-link active');
}