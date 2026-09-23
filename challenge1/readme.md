# Challenge 1 — Smart Price Finder
## DSA + HTML/CSS/JavaScript Explanation

## 1. What is this project?

This project is a **Smart Price Finder** for the TechMart Product Explorer.

The user enters a target price, for example:

```text
₹70,000
```

The application finds the products whose prices are closest to that target and displays them as product cards.

The project uses:

- HTML for structure
- CSS for styling and responsive design
- JavaScript for application logic
- The provided `data.js` dataset for product information

The assignment requires the feature to include a price input, search button, result cards, product name, price, brand, rating, and a View Product button.

---

# 2. Project Structure

The project is organized like this:

```text
product-explorer/
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

### index.html

Contains the page structure:

- Navbar
- Heading
- Price input
- Search button
- Results section
- Product cards container
- Product detail modal

### style.css

Contains:

- Layout
- Colors
- Typography
- Product cards
- Search box
- Modal
- Responsive design

### data.js

Contains the dataset provided by the teacher.

The data is nested:

```text
storeData
    ↓
categories
    ↓
subcategories
    ↓
products
```

Each product contains information such as:

```text
id
name
brand
price
rating
reviews
stock
category
subcategory
tags
specifications
```

### app.js

Contains the main JavaScript logic:

1. Extract products
2. Sort products by price
3. Find the binary-search insertion point
4. Find closest products
5. Display results
6. Open product details
7. Handle user interaction

---

# 3. How the Data Is Structured

The supplied dataset contains categories and subcategories.

For example:

```text
Electronics
    ↓
Laptops
    ↓
MacBook Air M3
Dell Inspiron 14
HP Pavilion 15
Lenovo ThinkPad E14
ASUS ROG Gaming Laptop
```

The JavaScript cannot directly search all products because they are nested inside categories and subcategories.

Therefore, the first step is to flatten/extract them into one array.

---

# 4. Getting All Products

The function is:

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

## How it works

There are three levels:

```text
storeData
    ↓
category
    ↓
subcategory
    ↓
product
```

The outer loop goes through every category.

The second loop goes through every subcategory inside that category.

The third loop goes through every product inside that subcategory.

Each product is pushed into:

```javascript
const products = [];
```

At the end, we have one simple array:

```text
[
    MacBook Air M3,
    Dell Inspiron 14,
    HP Pavilion 15,
    Lenovo ThinkPad E14,
    ...
]
```

This makes later searching much easier.

## Complexity

If there are `n` products in total:

```text
Time Complexity: O(n)
Space Complexity: O(n)
```

We visit every product once and store every product in the new array.

---

# 5. Why Do We Sort the Products?

After extracting the products, we create a price-sorted array:

```javascript
const productsByPrice = [...products].sort(
    (a, b) => a.price - b.price
);
```

The result is something like:

```text
₹699
₹799
₹899
₹1,299
₹1,599
₹3,999
₹6,999
₹7,495
₹8,999
...
₹124,999
```

Sorting is important because it allows us to use **Binary Search**.

Instead of checking every product when the user searches for a price, we can quickly find where the target price belongs.

---

# 6. DSA Concept #1 — Sorting

Sorting means arranging data according to some order.

Here, we sort products according to:

```javascript
product.price
```

Ascending order:

```text
low price → high price
```

The JavaScript code is:

```javascript
products.sort((a, b) => a.price - b.price);
```

### Why do we need sorting?

Because Binary Search requires the data to be ordered.

For example:

```text
100
200
300
400
500
600
700
```

If the target is:

```text
550
```

we don't need to check every number.

We can repeatedly eliminate half of the search space.

---

# 7. DSA Concept #2 — Binary Search

Binary Search is an efficient searching algorithm that works on sorted data.

Suppose we have:

```text
100  200  300  400  500  600  700
```

Target:

```text
550
```

Instead of checking:

```text
100
200
300
400
500
...
```

we check the middle.

The middle is:

```text
400
```

Since 550 is greater than 400, everything before 400 can be ignored.

Then we continue searching the remaining half.

This gives Binary Search a time complexity of:

```text
O(log n)
```

instead of:

```text
O(n)
```

for a simple linear search.

---

# 8. Finding the Insertion Point

The function used in this project is:

```javascript
function findInsertionPoint(targetPrice) {

    let left = 0;

    let right = productsByPrice.length;

    while (left < right) {

        const middle =
            Math.floor((left + right) / 2);

        if (productsByPrice[middle].price < targetPrice) {

            left = middle + 1;

        } else {

            right = middle;
        }
    }

    return left;
}
```

The purpose of this function is not directly to find an exact product.

It finds the position where the target price would fit in the sorted array.

For example:

```text
₹60,000
₹65,000
₹69,000
₹72,000
₹80,000
```

Target:

```text
₹70,000
```

The insertion point is between:

```text
₹69,000
     ↑
₹72,000
```

So we know that the closest product is likely to be around this position.

---

# 9. Why Do We Need the Insertion Point?

Suppose the target is:

```text
₹70,000
```

and the sorted products around it are:

```text
₹68,999
₹69,999
₹72,999
₹74,999
```

The closest products must be near the insertion point.

We don't need to search the entire dataset again.

We compare products on the left and right side.

For example:

```text
Left:  ₹69,999
Right: ₹72,999
```

Differences:

```text
|69,999 - 70,000| = 1

|72,999 - 70,000| = 2,999
```

Therefore:

```text
₹69,999
```

is closer.

---

# 10. Finding the Closest Products

The function is:

```javascript
function findClosestProducts(targetPrice, count = 3) {

    const insertionPoint =
        findInsertionPoint(targetPrice);

    let left = insertionPoint - 1;

    let right = insertionPoint;

    const closestProducts = [];

    while (
        closestProducts.length < count &&
        (left >= 0 || right < productsByPrice.length)
    ) {

        if (left < 0) {

            closestProducts.push(
                productsByPrice[right]
            );

            right++;

            continue;
        }

        if (right >= productsByPrice.length) {

            closestProducts.push(
                productsByPrice[left]
            );

            left--;

            continue;
        }

        const leftDifference =
            Math.abs(
                productsByPrice[left].price - targetPrice
            );

        const rightDifference =
            Math.abs(
                productsByPrice[right].price - targetPrice
            );

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
```

---

# 11. Understanding the Two Pointers

This algorithm uses two positions:

```text
left
right
```

Example:

```text
₹60k  ₹65k  ₹69k  |  ₹72k  ₹75k  ₹80k
                  ↑
              target area
```

We have:

```text
left  → ₹69k
right → ₹72k
```

We compare both.

Whichever is closer to the target gets selected.

Then we move that pointer:

```text
left--
```

or:

```text
right++
```

We continue until we have found 3 products.

This is essentially a **two-pointer technique around a binary-search position**.

---

# 12. Calculating the Difference

The most important calculation is:

```javascript
Math.abs(product.price - targetPrice)
```

`Math.abs()` gives the absolute value.

Example:

```text
Product price = ₹68,999
Target = ₹70,000
```

Calculation:

```text
68,999 - 70,000
= -1,001
```

Absolute value:

```text
1,001
```

Therefore:

```text
Difference = ₹1,001
```

Another example:

```text
Product price = ₹72,999

72,999 - 70,000
= 2,999

Difference = ₹2,999
```

The smaller difference means the product is closer.

---

# 13. Example Search

Suppose the user enters:

```text
70000
```

The algorithm looks around the target price.

It may find:

```text
Google Pixel 9
₹69,999
Difference = ₹1

Dell Inspiron 14
₹68,999
Difference = ₹1,001

Lenovo ThinkPad E14
₹72,999
Difference = ₹2,999
```

So the UI displays these as the closest products.

---

# 14. Displaying the Products

Once the algorithm has found the products, the function:

```javascript
displayProducts(productsToDisplay, targetPrice)
```

creates HTML dynamically.

For every product, JavaScript creates:

```javascript
const card = document.createElement("article");
```

Then:

```javascript
card.className = "product-card";
```

And inserts the product information:

```text
Brand
Product Name
Price
Rating
Review Count
Distance From Target
View Product button
```

Finally:

```javascript
resultsContainer.appendChild(card);
```

adds the card to the webpage.

This is an example of **DOM manipulation**.

---

# 15. DSA Concept #3 — Arrays

The project uses JavaScript arrays extensively.

Example:

```javascript
const products = [];
```

Products are stored inside the array.

We also use:

```javascript
const closestProducts = [];
```

to store the results.

Arrays are useful because they allow us to:

- Store multiple products
- Iterate through products
- Sort products
- Access products by index
- Build result collections

---

# 16. DSA Concept #4 — Two Pointer Technique

The closest-product search uses:

```javascript
let left = insertionPoint - 1;
let right = insertionPoint;
```

This is a form of the **two-pointer technique**.

The two pointers move toward the closest products.

Instead of scanning the entire array, we only inspect the relevant neighborhood around the target.

This makes the search efficient.

---

# 17. DSA Concept #5 — Searching

There are two different ideas to understand.

### Linear Search

A simple approach would be:

```text
Check product 1
Check product 2
Check product 3
...
Check product n
```

Time:

```text
O(n)
```

### Binary Search

Our optimized approach first sorts the products and then uses binary search to locate the target region.

Search time:

```text
O(log n)
```

Then only a small number of nearby products are examined.

---

# 18. Initial Approach vs Optimized Approach

This is important because the assignment explicitly asks students to think about an initial and optimized approach.

## Initial Approach

One simple solution would be:

```text
1. Go through every product
2. Calculate the difference from target
3. Sort products according to difference
4. Take first 3
```

Example:

```javascript
const results = products
    .map(product => ({
        product,
        difference:
            Math.abs(product.price - targetPrice)
    }))
    .sort(
        (a, b) =>
            a.difference - b.difference
    )
    .slice(0, 3);
```

Complexity:

```text
Difference calculation: O(n)
Sorting:                O(n log n)

Overall:                O(n log n)
```

---

# 19. Optimized Approach

The implemented solution does:

```text
1. Sort products by price once
2. Use binary search for every query
3. Find insertion point
4. Expand around the insertion point
5. Select closest products
```

### Initial sorting

```text
O(n log n)
```

This happens once.

### Every search

Binary search:

```text
O(log n)
```

Finding the 3 nearby products:

```text
O(k)
```

where:

```text
k = 3
```

Therefore:

```text
O(log n + k)
```

Since k is fixed at 3:

```text
O(log n)
```

for each search.

---

# 20. Space Complexity

The sorted array is another array:

```javascript
const productsByPrice = [...products]
```

Therefore additional storage is proportional to the number of products.

Space complexity:

```text
O(n)
```

The result array only contains 3 products, so that part is:

```text
O(k)
```

and because k = 3:

```text
O(1)
```

---

# 21. Complete Complexity Summary

## Initial Approach

```text
Time Complexity:
O(n log n)

Space Complexity:
O(n)
```

## Optimized Approach

Preprocessing:

```text
O(n log n)
```

Each search:

```text
O(log n + k)
```

With k = 3:

```text
O(log n)
```

Space:

```text
O(n)
```

---

# 22. Why Not Use Binary Search Directly on the Original Data?

Binary Search only works when the data is ordered.

The supplied product dataset is organized by:

```text
Category
    ↓
Subcategory
    ↓
Product
```

It is not globally sorted by price.

Therefore we first create:

```javascript
const productsByPrice = [...products].sort(
    (a, b) => a.price - b.price
);
```

Then binary search becomes possible.

---

# 23. Product Details Modal

The assignment requires a "View Product" button.

When the user clicks it, JavaScript obtains the product ID:

```javascript
const productId =
    this.dataset.productId;
```

Then it finds the corresponding product:

```javascript
const product =
    products.find(
        item => item.id === productId
    );
```

Then:

```javascript
openProductModal(product);
```

opens the modal.

The modal displays:

- Brand
- Product name
- Rating
- Review count
- Price
- Stock
- Category
- Subcategory
- Specifications
- Tags

This demonstrates DOM manipulation and working with JavaScript objects.

---

# 24. DOM Manipulation Concepts Used

The project uses browser APIs such as:

```javascript
document.getElementById()
```

to find elements.

For example:

```javascript
const input =
    document.getElementById("priceInput");
```

It also uses:

```javascript
document.createElement()
```

to create product cards.

And:

```javascript
element.appendChild()
```

to add elements to the page.

It also uses:

```javascript
element.innerHTML
```

to insert HTML content.

---

# 25. Event Handling

The Search button uses:

```javascript
searchButton.addEventListener(
    "click",
    searchProducts
);
```

This means:

```text
User clicks Search
        ↓
Browser detects click
        ↓
searchProducts() runs
        ↓
Input is read
        ↓
Algorithm executes
        ↓
Results appear
```

The Enter key is also supported:

```javascript
if (event.key === "Enter") {
    searchProducts();
}
```

---

# 26. Input Validation

The application should not blindly trust user input.

For example, the user could enter:

```text
-500
```

or:

```text
nothing
```

The application checks:

```javascript
if (
    input.value.trim() === "" ||
    !Number.isFinite(targetPrice) ||
    targetPrice <= 0
)
```

If the input is invalid, the application displays an error instead of attempting the search.

This handles one of the assignment's required edge cases: **invalid input**.

---

# 27. Edge Cases

The project considers several edge cases.

### Empty input

```text
User clicks Search without entering a price.
```

Result:

```text
Please enter a valid price.
```

### Negative price

```text
-5000
```

Rejected.

### Very large price

Example:

```text
₹10,000,000
```

The algorithm still finds the closest available products.

### Target below every product

The algorithm handles the situation where the insertion point is at the beginning.

### Target above every product

The algorithm handles the situation where the insertion point is at the end.

### Fewer than 3 products

The algorithm returns however many products are available.

---

# 28. Why This Is a DSA Project and Not Just a Website

The UI is only one part of the project.

The DSA flow is:

```text
Nested Dataset
      ↓
Array Extraction
      ↓
Sorting by Price
      ↓
Binary Search
      ↓
Insertion Point
      ↓
Two Pointers
      ↓
Closest Products
      ↓
DOM Rendering
```

So the project combines:

```text
HTML
CSS
JavaScript
Arrays
Objects
Sorting
Binary Search
Two Pointers
DOM
Event Handling
Time Complexity
Space Complexity
Edge Cases
```

---

# 29. Important Concepts to Explain to the Teacher

If the teacher asks, "What DSA concepts did you use?", answer:

> "I used array traversal to extract the nested products, sorting to create a price-ordered dataset, binary search to find the insertion point of the target price, and a two-pointer approach to compare products on either side and find the closest products efficiently."

If asked:

**"Why binary search?"**

Answer:

> "Because the products are sorted by price. Binary search allows me to find the target region in O(log n) instead of scanning every product."

If asked:

**"Why did you sort the products?"**

Answer:

> "Binary search requires sorted data. The original dataset is nested and isn't globally sorted by price, so I create a separate price-sorted array."

If asked:

**"What is the time complexity?"**

Answer:

> "The initial preprocessing sort is O(n log n). After that, each search takes O(log n + k), where k is the number of products requested. Since I return only 3 products, the search is effectively O(log n)."

If asked:

**"What is the space complexity?"**

Answer:

> "O(n), because I maintain a separate array of products sorted by price."

---

# 30. One Important Limitation

This implementation assumes that the product dataset does not change while the page is running.

If products are added, removed, or their prices change dynamically, the sorted array would need to be updated or rebuilt.

For the current assignment, the provided dataset is static, so preprocessing the data once is reasonable.

---

# 31. Final Flow

The complete application works like this:

```text
                 USER
                  │
                  ▼
        Enters target price
             ₹70,000
                  │
                  ▼
          Clicks Search
                  │
                  ▼
        Read input from DOM
                  │
                  ▼
       Validate the input
                  │
                  ▼
       Binary Search on
       sorted price array
                  │
                  ▼
        Find insertion point
                  │
                  ▼
       Compare left/right
       using two pointers
                  │
                  ▼
        Select closest 3
             products
                  │
                  ▼
       Generate product cards
                  │
                  ▼
             DOM update
                  │
                  ▼
         Results displayed
                  │
                  ▼
       User clicks View Product
                  │
                  ▼
        Product detail modal
```

---

# 32. What I Should Be Able to Explain

Before submitting, make sure I can explain these without looking at the code:

1. What is an array?
2. Why do we extract all products?
3. Why do we sort products by price?
4. What is Binary Search?
5. Why is Binary Search O(log n)?
6. What is an insertion point?
7. Why are there `left` and `right` pointers?
8. Why do we use `Math.abs()`?
9. What is the difference between O(n) and O(log n)?
10. What is the preprocessing step?
11. What is the time complexity?
12. What is the space complexity?
13. How does `addEventListener()` work?
14. How does JavaScript create the product cards?
15. How does the View Product modal find the correct product?

If you understand these points, you should be able to explain the project rather than simply showing the code.

---

# 33. Assignment Requirements Checklist

- [x] HTML
- [x] CSS
- [x] JavaScript
- [x] Provided `data.js`
- [x] Price input
- [x] Search button
- [x] Product cards
- [x] Product name
- [x] Price
- [x] Brand
- [x] Rating
- [x] View Product button
- [x] Responsive UI
- [x] Input validation
- [x] Edge-case handling
- [x] Sorting
- [x] Binary Search
- [x] Two-pointer technique
- [x] Complexity analysis
- [x] Product details modal

---

## Quick viva answer

If your teacher says:

**"Explain your project in 30 seconds."**

You can say:

> "I built a Smart Price Finder using vanilla HTML, CSS and JavaScript. The provided product data is nested inside categories and subcategories, so I first traverse it and create a flat product array. I then preprocess a separate array sorted by product price. When the user enters a target price, I use binary search to find where that price would be inserted and then use two pointers around that position to find the three closest products. This reduces each search to O(log n) after O(n log n) preprocessing. The results are rendered dynamically using DOM manipulation, and each product has a View Product modal with its details."
