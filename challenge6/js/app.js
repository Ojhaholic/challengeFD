// ============================================================
// CHALLENGE 6 — INVENTORY RANGE DASHBOARD
// ============================================================


// ============================================================
// 1. EXTRACT ALL PRODUCTS
// ============================================================

function getAllProducts() {

    const products = [];

    for (const category of storeData.categories) {

        for (const subcategory of category.subcategories) {

            for (const product of subcategory.products) {

                products.push(product);

            }
        }
    }

    return products;
}


const products = getAllProducts();


// ============================================================
// 2. SORT PRODUCTS BY PRICE
// ============================================================

const productsByPrice = [...products].sort(
    (a, b) => a.price - b.price
);


// ============================================================
// 3. CALCULATE INVENTORY VALUE FOR EACH PRODUCT
// ============================================================

/*
    Inventory Value = Price × Stock

    Example:

    Price = ₹10,000
    Stock = 5

    Inventory Value = ₹50,000
*/

const inventoryValues = productsByPrice.map(product => {

    return product.price * product.stock;

});


// ============================================================
// 4. BUILD PREFIX SUM ARRAY
// ============================================================

/*
    Example:

    Inventory values:

    [100, 200, 300, 400]

    Prefix sum:

    [0, 100, 300, 600, 1000]

    This allows us to calculate a range sum quickly.
*/

const prefixInventory = [0];

for (const value of inventoryValues) {

    const previous =
        prefixInventory[prefixInventory.length - 1];

    prefixInventory.push(
        previous + value
    );
}


// ============================================================
// 5. LOWER BOUND
// ============================================================

/*
    Finds the first product whose price is:

        >= targetPrice

    Example:

    Prices:
    100
    200
    300
    400

    target = 250

    lowerBound returns index of 300.
*/

function lowerBound(targetPrice) {

    let left = 0;
    let right = productsByPrice.length;

    while (left < right) {

        const middle =
            Math.floor((left + right) / 2);

        if (
            productsByPrice[middle].price <
            targetPrice
        ) {

            left = middle + 1;

        } else {

            right = middle;
        }
    }

    return left;
}


// ============================================================
// 6. UPPER BOUND
// ============================================================

/*
    Finds the first product whose price is:

        > targetPrice

    We use this because the maximum price should be included.

    Example:

    Prices:
    100
    200
    300
    400

    target = 300

    upperBound returns index of 400.
*/

function upperBound(targetPrice) {

    let left = 0;
    let right = productsByPrice.length;

    while (left < right) {

        const middle =
            Math.floor((left + right) / 2);

        if (
            productsByPrice[middle].price <=
            targetPrice
        ) {

            left = middle + 1;

        } else {

            right = middle;
        }
    }

    return left;
}


// ============================================================
// 7. RANGE QUERY
// ============================================================

function getInventoryRange(minPrice, maxPrice) {

    // Find beginning of the range
    const startIndex =
        lowerBound(minPrice);

    // Find end of the range
    const endIndex =
        upperBound(maxPrice);


    // No products found

    if (startIndex >= endIndex) {

        return {
            products: [],
            productCount: 0,
            inventoryValue: 0
        };

    }


    /*
        Prefix sum formula:

        range sum =
        prefix[end] - prefix[start]
    */

    const inventoryValue =
        prefixInventory[endIndex] -
        prefixInventory[startIndex];


    // Get matching products

    const matchingProducts =
        productsByPrice.slice(
            startIndex,
            endIndex
        );


    return {

        products: matchingProducts,

        productCount:
            matchingProducts.length,

        inventoryValue:
            inventoryValue
    };
}


// ============================================================
// 8. FORMAT CURRENCY
// ============================================================

function formatPrice(value) {

    return `₹${value.toLocaleString("en-IN")}`;

}


// ============================================================
// 9. DISPLAY RESULTS
// ============================================================

function displayResults(
    result,
    minPrice,
    maxPrice
) {

    const resultsContainer =
        document.getElementById("results");

    const productCount =
        document.getElementById("productCount");

    const inventoryValue =
        document.getElementById("inventoryValue");

    const selectedRange =
        document.getElementById("selectedRange");

    const resultCount =
        document.getElementById("resultCount");


    // Update summary

    productCount.textContent =
        result.productCount;

    inventoryValue.textContent =
        formatPrice(result.inventoryValue);

    selectedRange.textContent =
        `${formatPrice(minPrice)} – ${formatPrice(maxPrice)}`;

    resultCount.textContent =
        `${result.productCount} matching products`;


    // Remove previous results

    resultsContainer.innerHTML = "";


    // No results

    if (result.products.length === 0) {

        resultsContainer.innerHTML = `
            <div class="message">
                No products were found in this price range.
            </div>
        `;

        return;
    }


    // Create product cards

    result.products.forEach(product => {

        const card =
            document.createElement("article");


        // Individual product inventory value

        const value =
            product.price * product.stock;


        card.className = "product-card";


        card.innerHTML = `

            <p class="product-category">
                ${product.category} · ${product.subcategory}
            </p>

            <p class="product-brand">
                ${product.brand}
            </p>

            <h3 class="product-name">
                ${product.name}
            </h3>

            <p class="product-price">
                ${formatPrice(product.price)}
            </p>

            <p class="product-stock">
                Stock: ${product.stock} units
            </p>

            <p class="product-value">
                Inventory Value: ${formatPrice(value)}
            </p>

        `;


        resultsContainer.appendChild(card);

    });
}


// ============================================================
// 10. SEARCH / VALIDATE INPUT
// ============================================================

function searchInventory() {

    const minInput =
        document.getElementById("minPrice");

    const maxInput =
        document.getElementById("maxPrice");

    const message =
        document.getElementById("message");


    const minPrice =
        Number(minInput.value);

    const maxPrice =
        Number(maxInput.value);


    // Empty input

    if (
        minInput.value.trim() === "" ||
        maxInput.value.trim() === ""
    ) {

        showError(
            "Please enter both minimum and maximum prices."
        );

        return;
    }


    // Invalid number

    if (
        !Number.isFinite(minPrice) ||
        !Number.isFinite(maxPrice)
    ) {

        showError(
            "Please enter valid numbers."
        );

        return;
    }


    // Negative prices

    if (minPrice < 0 || maxPrice < 0) {

        showError(
            "Prices cannot be negative."
        );

        return;
    }


    // Invalid range

    if (minPrice > maxPrice) {

        showError(
            "Minimum price cannot be greater than maximum price."
        );

        return;
    }


    // Hide error

    message.classList.add("hidden");

    message.classList.remove("error");


    // Perform optimized range query

    const result =
        getInventoryRange(
            minPrice,
            maxPrice
        );


    // Display results

    displayResults(
        result,
        minPrice,
        maxPrice
    );
}


// ============================================================
// 11. ERROR MESSAGE
// ============================================================

function showError(text) {

    const message =
        document.getElementById("message");

    message.textContent = text;

    message.classList.remove("hidden");

    message.classList.add("error");
}


// ============================================================
// 12. GET SLIDER ELEMENTS
// ============================================================

const minSlider =
    document.getElementById("minSlider");

const maxSlider =
    document.getElementById("maxSlider");

const minPriceInput =
    document.getElementById("minPrice");

const maxPriceInput =
    document.getElementById("maxPrice");

const sliderMinLabel =
    document.getElementById("sliderMinLabel");

const sliderMaxLabel =
    document.getElementById("sliderMaxLabel");


// ============================================================
// 13. GET MINIMUM AND MAXIMUM PRODUCT PRICES
// ============================================================

const minimumPrice =
    productsByPrice[0].price;

const maximumPrice =
    productsByPrice[
        productsByPrice.length - 1
    ].price;


// ============================================================
// 14. CONFIGURE SLIDERS
// ============================================================

minSlider.min =
    minimumPrice;

minSlider.max =
    maximumPrice;

minSlider.value =
    minimumPrice;


maxSlider.min =
    minimumPrice;

maxSlider.max =
    maximumPrice;

maxSlider.value =
    maximumPrice;


// ============================================================
// 15. UPDATE SLIDER LABELS
// ============================================================

function updateSliderLabels() {

    sliderMinLabel.textContent =
        formatPrice(
            Number(minSlider.value)
        );

    sliderMaxLabel.textContent =
        formatPrice(
            Number(maxSlider.value)
        );
}


// ============================================================
// 16. MINIMUM SLIDER
// ============================================================

minSlider.addEventListener(
    "input",
    function () {

        let min =
            Number(minSlider.value);

        let max =
            Number(maxSlider.value);


        // Don't allow min > max

        if (min > max) {

            min = max;

            minSlider.value =
                min;
        }


        // Update input

        minPriceInput.value =
            min;


        updateSliderLabels();

    }
);


// ============================================================
// 17. MAXIMUM SLIDER
// ============================================================

maxSlider.addEventListener(
    "input",
    function () {

        let min =
            Number(minSlider.value);

        let max =
            Number(maxSlider.value);


        // Don't allow max < min

        if (max < min) {

            max = min;

            maxSlider.value =
                max;
        }


        // Update input

        maxPriceInput.value =
            max;


        updateSliderLabels();

    }
);


// ============================================================
// 18. MIN INPUT → SLIDER
// ============================================================

minPriceInput.addEventListener(
    "change",
    function () {

        const value =
            Number(minPriceInput.value);


        if (
            Number.isFinite(value) &&
            value >= minimumPrice &&
            value <= maximumPrice
        ) {

            minSlider.value =
                value;

            updateSliderLabels();
        }

    }
);


// ============================================================
// 19. MAX INPUT → SLIDER
// ============================================================

maxPriceInput.addEventListener(
    "change",
    function () {

        const value =
            Number(maxPriceInput.value);


        if (
            Number.isFinite(value) &&
            value >= minimumPrice &&
            value <= maximumPrice
        ) {

            maxSlider.value =
                value;

            updateSliderLabels();
        }

    }
);


// ============================================================
// 20. SEARCH BUTTON
// ============================================================

document
    .getElementById("searchBtn")
    .addEventListener(
        "click",
        searchInventory
    );


// ============================================================
// 21. ENTER KEY — MIN PRICE
// ============================================================

document
    .getElementById("minPrice")
    .addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

                searchInventory();

            }

        }
    );


// ============================================================
// 22. ENTER KEY — MAX PRICE
// ============================================================

document
    .getElementById("maxPrice")
    .addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

                searchInventory();

            }

        }
    );


// ============================================================
// 23. INITIALIZE
// ============================================================

updateSliderLabels();

console.log(
    "Inventory Dashboard loaded successfully."
);

console.log(
    "Total products:",
    products.length
);

console.log(
    "Minimum price:",
    minimumPrice
);

console.log(
    "Maximum price:",
    maximumPrice
);