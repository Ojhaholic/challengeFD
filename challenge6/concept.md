# Challenge 6 — Inventory Range Dashboard

## 1. What is this challenge?

The goal is to build an Inventory Analytics dashboard.

The user provides:

```text
Minimum Price
Maximum Price
```

For example:

```text
Minimum Price: ₹5,000
Maximum Price: ₹20,000
```

The application must find all products whose prices fall inside this range and calculate:

```text
Inventory Value = Product Price × Stock
```

The dashboard displays:

- Number of matching products
- Total inventory value
- Selected price range
- Matching products
- Each product's individual inventory value

The assignment also asks us to think about making repeated range queries efficient.

---

# 2. Project Structure

```text
challenge-06/
│
├── index.html
│
├── css/
│   └── style.css
│
└── js/
    ├── data.js
    └── app.js
```

`data.js` is the teacher-provided dataset.

Do not replace it with a new dataset.

---

# 3. Main DSA Idea

The important problem is this:

Suppose there are many products and the user repeatedly changes the price range.

A basic solution would scan every product every time:

```text
Query 1 → check every product
Query 2 → check every product
Query 3 → check every product
Query 4 → check every product
```

If there are `n` products and we make `q` queries, this costs approximately:

```text
O(q × n)
```

The challenge asks us to preprocess the data so future range queries become faster.

The solution uses:

```text
Sorting
    ↓
Binary Search
    ↓
Prefix Sum
```

---

# 4. Step 1 — Extract Products

The supplied data is nested:

```text
storeData
    ↓
categories
    ↓
subcategories
    ↓
products
```

We first flatten it into one array.

```javascript
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
```

This gives us:

```text
[
    MacBook Air M3,
    Dell Inspiron 14,
    HP Pavilion 15,
    ...
]
```

### Complexity

If there are `n` products:

```text
Time: O(n)
Space: O(n)
```

---

# 5. Step 2 — Sort Products by Price

We create a separate sorted array:

```javascript
const productsByPrice = [...products].sort(
    (a, b) => a.price - b.price
);
```

Now the prices are ordered:

```text
₹699
₹799
₹899
₹1,299
₹1,599
₹3,999
₹6,999
...
₹124,999
```

This is important because binary search requires sorted data.

### Complexity

Sorting takes:

```text
O(n log n)
```

This is a one-time preprocessing operation.

---

# 6. Step 3 — Calculate Inventory Value

For every product:

```text
Inventory Value = price × stock
```

Example:

```text
Price = ₹10,000
Stock = 5

Inventory Value:
₹10,000 × 5
= ₹50,000
```

The code creates an array containing these values:

```javascript
const inventoryValues = productsByPrice.map(product => {

    return product.price * product.stock;

});
```

The important point is that `inventoryValues` has the same ordering as `productsByPrice`.

So:

```text
productsByPrice:

Index   Product       Price
0       Product A     ₹1,000
1       Product B     ₹2,000
2       Product C     ₹5,000


inventoryValues:

Index   Value
0       ₹5,000
1       ₹20,000
2       ₹10,000
```

---

# 7. Step 4 — Prefix Sum

This is the main DSA concept in Challenge 6.

A prefix sum stores cumulative totals.

Suppose:

```text
Inventory values:

[100, 200, 300, 400]
```

Prefix sum becomes:

```text
[0, 100, 300, 600, 1000]
```

The extra `0` makes range calculations easier.

For example, the sum from index `1` through `3` is:

```text
prefix[4] - prefix[1]

1000 - 100

= 900
```

So instead of adding:

```text
200 + 300 + 400
```

again, we use two prefix values.

---

# 8. Prefix Sum in the Project

The code is:

```javascript
const prefixInventory = [0];

for (const value of inventoryValues) {

    const previous =
        prefixInventory[prefixInventory.length - 1];

    prefixInventory.push(
        previous + value
    );
}
```

After preprocessing, the application has a cumulative inventory-value array.

This allows a range sum to be calculated in constant time once the range boundaries are known.

---

# 9. Step 5 — Binary Search for the Range

We need to find two positions:

```text
First product whose price >= minimum price
```

and:

```text
First product whose price > maximum price
```

These are found with two binary-search functions.

---

# 10. Lower Bound

The function:

```javascript
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
```

It finds the first position where:

```text
price >= targetPrice
```

Example:

```text
Prices:

100
200
300
400
500
```

Target:

```text
300
```

Lower bound returns the index of:

```text
300
```

---

# 11. Upper Bound

The function:

```javascript
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
```

It finds the first position where:

```text
price > targetPrice
```

This is useful because our requested maximum price is inclusive.

For example, if the maximum is:

```text
₹20,000
```

a product costing exactly:

```text
₹20,000
```

must be included.

---

# 12. Example Range

Suppose the sorted prices are:

```text
₹3,999
₹6,999
₹7,495
₹8,999
₹11,999
₹29,990
```

User selects:

```text
Minimum = ₹7,000
Maximum = ₹12,000
```

The matching products are:

```text
₹7,495
₹8,999
₹11,999
```

Binary search finds the beginning and ending positions.

We don't need to scan every product to determine the boundaries.

---

# 13. Step 6 — Calculate Total Inventory Value

Once we know:

```text
startIndex
endIndex
```

we calculate:

```javascript
const inventoryValue =
    prefixInventory[endIndex] -
    prefixInventory[startIndex];
```

This is the main benefit of prefix sums.

Without prefix sums, we would calculate:

```text
product 1 value
+
product 2 value
+
product 3 value
+
...
```

for every query.

With prefix sums, we use:

```text
one subtraction
```

after finding the boundaries.

---

# 14. Complete Range Query

The central function is:

```javascript
function getInventoryRange(minPrice, maxPrice) {

    const startIndex =
        lowerBound(minPrice);

    const endIndex =
        upperBound(maxPrice);

    if (startIndex >= endIndex) {

        return {
            products: [],
            productCount: 0,
            inventoryValue: 0
        };

    }

    const inventoryValue =
        prefixInventory[endIndex] -
        prefixInventory[startIndex];

    const matchingProducts =
        productsByPrice.slice(
            startIndex,
            endIndex
        );

    return {
        products: matchingProducts,
        productCount: matchingProducts.length,
        inventoryValue: inventoryValue
    };
}
```

It returns:

```text
matching products
number of products
total inventory value
```

---

# 15. Complexity

## Preprocessing

Extracting products:

```text
O(n)
```

Sorting:

```text
O(n log n)
```

Calculating inventory values:

```text
O(n)
```

Building prefix sums:

```text
O(n)
```

Therefore preprocessing is dominated by sorting:

```text
O(n log n)
```

---

# 16. Query Complexity

For each query:

### Lower bound

```text
O(log n)
```

### Upper bound

```text
O(log n)
```

### Prefix sum calculation

```text
O(1)
```

So the numeric range calculation is:

```text
O(log n)
```

If we also need to create/display every matching product, displaying `k` products costs:

```text
O(k)
```

Therefore the complete query is:

```text
O(log n + k)
```

where `k` is the number of products displayed.

---

# 17. Space Complexity

We store:

```text
products
productsByPrice
inventoryValues
prefixInventory
```

Therefore additional memory is:

```text
O(n)
```

The prefix array itself is also:

```text
O(n)
```

---

# 18. Initial vs Optimized Approach

## Initial Approach

A simple solution could be:

```javascript
function basicRangeQuery(min, max) {

    let count = 0;
    let value = 0;

    for (const product of products) {

        if (
            product.price >= min &&
            product.price <= max
        ) {

            count++;

            value +=
                product.price * product.stock;
        }
    }

    return {
        count,
        value
    };
}
```

Every query scans every product.

Complexity:

```text
Time: O(n)
Space: O(1)
```

For `q` queries:

```text
O(q × n)
```

---

# 19. Optimized Approach

The optimized approach is:

```text
Preprocess
    ↓
Sort by price
    ↓
Calculate inventory values
    ↓
Build prefix sums

For every query
    ↓
Binary Search lower bound
    ↓
Binary Search upper bound
    ↓
Prefix sum subtraction
```

Query complexity:

```text
O(log n + k)
```

where `k` is the number of products returned/displayed.

---

# 20. Why Sorting Is Necessary

Binary Search requires ordered data.

The original dataset is organized by category and subcategory, not by price.

Therefore:

```javascript
productsByPrice
```

is created as a price-sorted copy.

We don't destroy the original dataset.

This is useful because the original product objects remain available for rendering.

---

# 21. Slider

The UI also contains two range sliders:

```text
₹0 ───────●────────●────── ₹150,000
          min      max
```

There is:

```text
Minimum slider
Maximum slider
```

Changing a slider updates the corresponding input field.

The slider values are based on the minimum and maximum prices available in the dataset.

---

# 22. Input Validation

The application handles invalid cases.

### Empty input

```text
Minimum: empty
Maximum: empty
```

Displays:

```text
Please enter both minimum and maximum prices.
```

### Negative value

```text
-500
```

Rejected.

### Minimum greater than maximum

```text
Minimum = ₹50,000
Maximum = ₹10,000
```

Rejected.

### No matching products

If no product falls inside the selected range:

```text
No products were found in this price range.
```

---

# 23. DOM Manipulation

The UI is generated dynamically.

JavaScript obtains HTML elements using:

```javascript
document.getElementById()
```

For example:

```javascript
const resultsContainer =
    document.getElementById("results");
```

Product cards are created using:

```javascript
document.createElement("article");
```

and inserted with:

```javascript
resultsContainer.appendChild(card);
```

This means the page does not hardcode product cards.

The products come from `data.js`.

---

# 24. Event Handling

The Analyze button uses:

```javascript
document
    .getElementById("searchBtn")
    .addEventListener(
        "click",
        searchInventory
    );
```

So:

```text
User clicks Analyze
        ↓
searchInventory()
        ↓
Validate input
        ↓
Binary searches
        ↓
Prefix sum calculation
        ↓
Generate results
        ↓
Update DOM
```

The Enter key also triggers the search.

---

# 25. Example

Suppose the user enters:

```text
Minimum = ₹5,000
Maximum = ₹20,000
```

The application finds every product whose price is within:

```text
₹5,000 ≤ price ≤ ₹20,000
```

For every matching product:

```text
Inventory Value = price × stock
```

Then it calculates:

```text
Products = number of matches

Inventory Value =
sum of price × stock
```

The dashboard displays those values.

---

# 26. DSA Concepts Used

The main DSA concepts are:

### 1. Arrays

Products and calculated values are stored in arrays.

### 2. Sorting

Products are sorted by price.

### 3. Binary Search

Used to find range boundaries efficiently.

### 4. Prefix Sum

Used to calculate total inventory value for a range efficiently.

### 5. Data Preprocessing

The dataset is processed once so repeated queries become faster.

### 6. Range Queries

The application answers:

```text
Give me all products between price A and price B.
```

---

# 27. What to Tell the Teacher

If asked:

### "What is your project?"

> "I built an Inventory Range Dashboard. The user enters a minimum and maximum price, and the application returns the products in that range and calculates their total inventory value using price multiplied by stock."

### "What DSA did you use?"

> "I used sorting, binary search, prefix sums, arrays, and range-query techniques."

### "Why did you sort the products?"

> "Because binary search requires sorted data. Sorting allows me to find the boundaries of a price range efficiently."

### "Why binary search?"

> "Instead of checking every product to find the beginning and end of the range, binary search finds those positions in O(log n)."

### "Why prefix sum?"

> "The user can perform many range queries. Instead of adding the inventory value of every matching product for every query, I preprocess cumulative inventory values. Then the total range value can be calculated using one subtraction."

### "What is your query complexity?"

> "Finding the range boundaries takes O(log n), and the prefix-sum calculation takes O(1). If I display k matching products, the complete query is O(log n + k)."

### "What is preprocessing complexity?"

> "Sorting takes O(n log n), while inventory-value calculation and prefix-sum construction take O(n), so total preprocessing is O(n log n)."

### "Space complexity?"

> "O(n) because I maintain the sorted products and prefix-sum data."

---

# 28. 30-Second Explanation

> "I built an Inventory Range Dashboard using vanilla HTML, CSS and JavaScript. I first flatten the nested product dataset into an array and sort a copy by price. For every product I calculate inventory value as price times stock, then build a prefix-sum array. When the user enters a minimum and maximum price, I use binary search to find the first product inside the range and the first product outside it. The prefix sum then lets me calculate the total inventory value without scanning every matching product. The range calculation is O(log n), excluding the O(k) work required to display k matching products, while preprocessing takes O(n log n)."

---

# 29. Checklist

- [x] HTML
- [x] CSS
- [x] JavaScript
- [x] Provided `data.js`
- [x] Minimum price input
- [x] Maximum price input
- [x] Search button
- [x] Summary cards
- [x] Product count
- [x] Total inventory value
- [x] Matching product list
- [x] Price sliders
- [x] Responsive UI
- [x] Input validation
- [x] Empty-result handling
- [x] Sorting
- [x] Binary Search
- [x] Prefix Sum
- [x] Range Query
- [x] Complexity analysis

---

# 30. Important Viva Concepts

Before submitting, make sure you understand:

1. What is a range query?
2. Why is the data sorted?
3. What is `lowerBound`?
4. What is `upperBound`?
5. Why does binary search take O(log n)?
6. What is a prefix sum?
7. Why does prefix sum make range-sum queries O(1)?
8. Why is preprocessing useful?
9. What is the difference between O(n) and O(log n)?
10. What is `price × stock`?
11. Why is the final query O(log n + k)?
12. Why is space O(n)?
