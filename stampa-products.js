function showProduct(id) {
    hideAllProducts();

    showProductDetails(id);

    disActivateProduct(id);
}

function hideAllProducts() {
    $('.visible').attr('class', 'not-visible');
}

function showProductDetails(id) {
    $('#header-' + id).attr('class', 'visible');
    $('#image-' + id).attr('class', 'visible');
    $('#desc-' + id).attr('class', 'visible');
}

function disActivateProduct(id) {
    $('.product-link-inactive').attr('class', 'product-link-active');

    $('#product-title-link-' + id).attr('class', 'product-link-inactive');
    $('#product-image-link-' + id).attr('class', 'product-link-inactive');
}