// ============================================================
// SMART PRICE FINDER
// Challenge 1
// ============================================================


// ============================================================
// 1. EXTRACT ALL PRODUCTS
// ============================================================

function getAllProducts() {

    const products = [];

    // storeData contains categories
    for (const category of storeData.categories) {

        // Each category contains subcategories
        for (const subcategory of category.subcategories) {

            // Each subcategory contains products
            for (const product of subcategory.products) {

                products.push(product);

            }
        }
    }

    return products;
}


// Get all products from the supplied dataset
const products = getAllProducts();


// Check the data in browser console
console.log("Total products:", products.length);
console.log("Products:", products);


// ============================================================
// 2. SORT PRODUCTS BY PRICE
// ============================================================

// We create a copy so that we don't modify the original
// product array.

const productsByPrice = [...products].sort(
    (a, b) => a.price - b.price
);


console.log(
    "Products sorted by price:",
    productsByPrice
);


// ============================================================
// 3. BINARY SEARCH
// ============================================================

/*
    We want to find the position where targetPrice
    would be inserted.

    Example:

    Prices:

    100
    200
    300
    400
    500

    Target = 350

    Binary search gives us the position between:

    300 and 400
*/


function findInsertionPoint(targetPrice) {

    let left = 0;

    let right = productsByPrice.length;


    while (left < right) {

        const middle =
            Math.floor((left + right) / 2);


        if (productsByPrice[middle].price < targetPrice) {

            // Target is on the right side

            left = middle + 1;

        } else {

            // Target is on the left side
            // or exactly at middle

            right = middle;
        }
    }


    return left;
}


// ============================================================
// 4. FIND CLOSEST PRODUCTS
// ============================================================

function findClosestProducts(targetPrice, count = 3) {

    // Find where the target belongs
    const insertionPoint =
        findInsertionPoint(targetPrice);


    /*
        We will expand around the insertion point.

        Example:

        60k
        65k
        69k   ← left
        72k   ← right
        80k

        Target = 70k

        Compare left and right repeatedly.
    */


    let left = insertionPoint - 1;

    let right = insertionPoint;


    const closestProducts = [];


    while (
        closestProducts.length < count &&
        (left >= 0 || right < productsByPrice.length)
    ) {

        // If left side doesn't exist,
        // take from right.

        if (left < 0) {

            closestProducts.push(
                productsByPrice[right]
            );

            right++;

            continue;
        }


        // If right side doesn't exist,
        // take from left.

        if (right >= productsByPrice.length) {

            closestProducts.push(
                productsByPrice[left]
            );

            left--;

            continue;
        }


        // Calculate differences

        const leftDifference =
            Math.abs(
                productsByPrice[left].price - targetPrice
            );


        const rightDifference =
            Math.abs(
                productsByPrice[right].price - targetPrice
            );


        // Pick whichever is closer

        if (leftDifference <= rightDifference) {

            closestProducts.push(
                productsByPrice[left]
            );

            left--;

        } else {

            closestProducts.push(
                productsByPrice[right]
            );

            right++;
        }
    }


    return closestProducts;
}


// ============================================================
// 5. FORMAT PRICE
// ============================================================

function formatPrice(price) {

    return price.toLocaleString("en-IN");

}


// ============================================================
// 6. DISPLAY PRODUCTS
// ============================================================

function displayProducts(
    productsToDisplay,
    targetPrice
) {

    const resultsContainer =
        document.getElementById("results");

    const resultCount =
        document.getElementById("resultCount");


    // Clear previous results

    resultsContainer.innerHTML = "";


    // Update count

    resultCount.textContent =
        `${productsToDisplay.length} products found`;


    // Create cards

    productsToDisplay.forEach(
        (product, index) => {

            const difference =
                Math.abs(
                    product.price - targetPrice
                );


            const card =
                document.createElement("article");


            card.className = "product-card";


            card.innerHTML = `

                <div class="product-number">
                    ${index + 1}
                </div>

                <p class="product-brand">
                    ${product.brand}
                </p>

                <h3 class="product-name">
                    ${product.name}
                </h3>

                <p class="product-price">
                    ₹${formatPrice(product.price)}
                </p>

                <p class="product-rating">
                    ⭐ ${product.rating}
                    · ${formatPrice(product.reviews)} reviews
                </p>

                <p class="price-difference">
                    ₹${formatPrice(difference)}
                    away from your target
                </p>

                <button
                    class="view-btn"
                    data-product-id="${product.id}"
                >
                    View Product
                </button>

            `;


            resultsContainer.appendChild(card);
        }
    );


    // Attach View Product events

    const viewButtons =
        document.querySelectorAll(".view-btn");


    viewButtons.forEach(button => {

        button.addEventListener(
            "click",
            function () {

                const productId =
                    this.dataset.productId;


                const product =
                    products.find(
                        item => item.id === productId
                    );


                if (product) {

                    openProductModal(product);

                }

            }
        );

    });
}


// ============================================================
// 7. SEARCH PRODUCTS
// ============================================================

function searchProducts() {

    const input =
        document.getElementById("priceInput");


    const message =
        document.getElementById("message");


    const resultCount =
        document.getElementById("resultCount");


    const results =
        document.getElementById("results");


    const targetPrice =
        Number(input.value);


    // --------------------------------------------
    // VALIDATION
    // --------------------------------------------

    if (
        input.value.trim() === "" ||
        !Number.isFinite(targetPrice) ||
        targetPrice <= 0
    ) {

        message.classList.remove("hidden");

        message.classList.add("error");

        message.textContent =
            "Please enter a valid price greater than ₹0.";


        results.innerHTML = "";

        resultCount.textContent = "";

        return;
    }


    // --------------------------------------------
    // FIND CLOSEST PRODUCTS
    // --------------------------------------------

    const closestProducts =
        findClosestProducts(
            targetPrice,
            3
        );


    // --------------------------------------------
    // DISPLAY RESULTS
    // --------------------------------------------

    message.classList.add("hidden");

    message.classList.remove("error");


    displayProducts(
        closestProducts,
        targetPrice
    );
}


// ============================================================
// 8. PRODUCT MODAL
// ============================================================

function openProductModal(product) {

    const modal =
        document.getElementById("productModal");


    const modalBrand =
        document.getElementById("modalBrand");


    const modalName =
        document.getElementById("modalName");


    const modalRating =
        document.getElementById("modalRating");


    const modalPrice =
        document.getElementById("modalPrice");


    const modalStock =
        document.getElementById("modalStock");


    const modalCategory =
        document.getElementById("modalCategory");


    const modalSubcategory =
        document.getElementById("modalSubcategory");


    const modalSpecifications =
        document.getElementById(
            "modalSpecifications"
        );


    const modalTags =
        document.getElementById("modalTags");


    // --------------------------------------------
    // BASIC INFORMATION
    // --------------------------------------------

    modalBrand.textContent =
        product.brand;


    modalName.textContent =
        product.name;


    modalRating.textContent =
        `⭐ ${product.rating} · ${formatPrice(product.reviews)} reviews`;


    modalPrice.textContent =
        `₹${formatPrice(product.price)}`;


    modalStock.textContent =
        `${product.stock} units`;


    modalCategory.textContent =
        product.category;


    modalSubcategory.textContent =
        product.subcategory;


    // --------------------------------------------
    // SPECIFICATIONS
    // --------------------------------------------

    modalSpecifications.innerHTML = "";


    if (product.specifications) {

        Object.entries(
            product.specifications
        ).forEach(
            ([key, value]) => {

                const item =
                    document.createElement("div");


                item.className =
                    "spec-item";


                item.innerHTML = `

                    <span class="spec-key">
                        ${key}
                    </span>

                    <span class="spec-value">
                        ${value}
                    </span>

                `;


                modalSpecifications.appendChild(item);

            }
        );

    }


    // --------------------------------------------
    // TAGS
    // --------------------------------------------

    modalTags.innerHTML = "";


    if (product.tags) {

        product.tags.forEach(tag => {

            const tagElement =
                document.createElement("span");


            tagElement.className =
                "tag";


            tagElement.textContent =
                `#${tag}`;


            modalTags.appendChild(
                tagElement
            );

        });

    }


    // --------------------------------------------
    // SHOW MODAL
    // --------------------------------------------

    modal.classList.remove("hidden");

    document.body.style.overflow = "hidden";
}


// ============================================================
// 9. CLOSE PRODUCT MODAL
// ============================================================

function closeProductModal() {

    const modal =
        document.getElementById("productModal");


    modal.classList.add("hidden");

    document.body.style.overflow = "";
}


// ============================================================
// 10. EVENT LISTENERS
// ============================================================


// Search button

document
    .getElementById("searchBtn")
    .addEventListener(
        "click",
        searchProducts
    );


// Press Enter inside input

document
    .getElementById("priceInput")
    .addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

                searchProducts();

            }

        }
    );


// Close modal button

document
    .getElementById("closeModal")
    .addEventListener(
        "click",
        closeProductModal
    );


// Close modal by clicking outside

document
    .querySelector(".modal-overlay")
    .addEventListener(
        "click",
        closeProductModal
    );


// Escape key closes modal

document.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Escape") {

            closeProductModal();

        }

    }
);


// ============================================================
// 11. INITIAL STATE
// ============================================================

console.log(
    "Smart Price Finder loaded successfully."
);

console.log(
    "Number of products:",
    products.length
);