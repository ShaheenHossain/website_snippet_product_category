/** @odoo-module **//*


// Copyright 2020 Tecnativa - Alexandre Díaz
// Copyright 2025 Tecnativa - Pilar Vargas
// License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
import sAnimation from "@website/js/content/snippets.animation";
import { _t } from "@web/core/l10n/translation";

sAnimation.registry.js_product_category = sAnimation.Class.extend({
    selector: ".js_product_category",
    disabledInEditableMode: false,

    */
/**
     * @override
     *//*

    init: function () {
        this._super.apply(this, arguments);
        this.rpc = this.bindService("rpc");
    },

    */
/**
     * Asynchronous server side template rendering
     * @override
     *//*

    start: function () {
        const _this = this;
        const template =
            this.$target.data("template") ||
            "website_snippet_product_category.s_product_category_items";

        // Prevent user edition
        this.$target.attr("contenteditable", "false");

        // Fetch and render categories
        const def = this.rpc("/website_sale/render_product_category", {
            template: template,
        }).then(
            function (object_html) {
                const $object_html = $(object_html);
                const count = $object_html.find("input[name='object_count']").val();

                // If no categories are found, show a warning message
                if (!count) {
                    _this.$target.append(
                        $("<div/>").append(
                            $("<div/>", {
                                class: "alert alert-warning alert-dismissible text-center",
                                text: _t(
                                    "No categories were found. Make sure you have categories defined."
                                ),
                            })
                        )
                    );
                    return;
                }

                // Render categories in the left section
                _this.$target.html($object_html);

                // Add click event to category links
                _this.$target.find(".categ_link").on("click", function (e) {
                    e.preventDefault();
                    const categoryId = $(this).data("category-id");

                    // Fetch products for the selected category
                    _this.rpc("/website_sale/get_products", {
                        category_id: categoryId,
                    })
                        .then(function (product_html) {
                            // Update the product display section (right side)
                            _this.$target.closest(".row").find(".js_product_display").html(product_html);
                        })
                        .catch(function (error) {
                            console.error("Failed to fetch products:", error);
                            if (_this.editableMode) {
                                _this.$target.closest(".row").find(".js_product_display").html(
                                    $("<p/>", {
                                        class: "text-danger",
                                        text: _t(
                                            "An error occurred while fetching products. Please try again later."
                                        ),
                                    })
                                );
                            }
                        });
                });
            },
            function (error) {
                console.error("Failed to fetch categories:", error);
                if (_this.editableMode) {
                    _this.$target.append(
                        $("<p/>", {
                            class: "text-danger",
                            text: _t(
                                "An error occurred with this product categories block. If the problem persists, please consider deleting it and adding a new one."
                            ),
                        })
                    );
                }
            }
        );

        return $.when(this._super.apply(this, arguments), def);
    },

    */
/**
     * @override
     *//*

    destroy: function () {
        this.$target.empty();
        this._super.apply(this, arguments);
    },
});


*/
/*

document.addEventListener("DOMContentLoaded", function () {
    let categoryButtons = document.querySelectorAll(".categ_link");
    let productContainer = document.querySelector(".js_product_display");

    categoryButtons.forEach(button => {
        button.addEventListener("click", function () {
            let categoryId = this.getAttribute("data-category-id");

            // Simulated API request to filter products by category
            fetch(`/get-products?category_id=${categoryId}`)
                .then(response => response.json())
                .then(data => {
                    productContainer.innerHTML = ""; // Clear existing products
                    data.products.forEach(product => {
                        let productHTML = `
                            <div class="product-item">
                                <div class="card">
                                    <img class="card-img-top" src="${product.image}" alt="${product.name}">
                                    <div class="card-body">
                                        <h5 class="card-title">${product.name}</h5>
                                        <p class="card-text">${product.price}</p>
                                    </div>
                                </div>
                            </div>
                        `;
                        productContainer.innerHTML += productHTML;
                    });
                });
        });
    });
});
*//*



document.addEventListener('DOMContentLoaded', function () {
    const links = document.querySelectorAll('.categ_link');
    const products = document.querySelectorAll('.product-item');

    links.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            // Active class switch
            links.forEach(l => l.classList.remove('active'));
            this.classList.add('active');

            const catId = this.dataset.categoryId;

            products.forEach(product => {
                const productCats = product.dataset.categories.split(',').map(id => id.trim());

                // Show all if 'All Products' (id = 0)
                if (catId === '0' || productCats.includes(catId)) {
                    product.style.display = 'block';
                } else {
                    product.style.display = 'none';
                }
            });
        });
    });
});*/




/** @odoo-module **/

// Copyright 2020 Tecnativa - Alexandre Díaz
// Copyright 2025 Tecnativa - Pilar Vargas
// License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
import sAnimation from "@website/js/content/snippets.animation";
import { _t } from "@web/core/l10n/translation";

sAnimation.registry.js_product_category = sAnimation.Class.extend({
    selector: ".js_product_category",
    disabledInEditableMode: false,

    /**
     * @override
     */
    init: function () {
        this._super.apply(this, arguments);
        this.rpc = this.bindService("rpc");
    },

    /**
     * Asynchronous server side template rendering
     * @override
     */
    start: function () {
        const _this = this;
        const template =
            this.$target.data("template") ||
            "website_snippet_product_category.s_product_category_items";

        // Prevent user edition
        this.$target.attr("contenteditable", "false");

        // Fetch and render categories
        const def = this.rpc("/website_sale/render_product_category", {
            template: template,
        }).then(function (object_html) {
            const $object_html = $(object_html);
            const count = $object_html.find("input[name='object_count']").val();

            if (!count) {
                _this.$target.append(
                    $("<div/>").append(
                        $("<div/>", {
                            class: "alert alert-warning alert-dismissible text-center",
                            text: _t("No categories were found. Make sure you have categories defined."),
                        })
                    )
                );
                return;
            }

            // Render categories in the left section
            _this.$target.html($object_html);

            const $links = _this.$target.find(".categ_link");

            // Add click event to category links
            $links.on("click", function (e) {
                e.preventDefault();
                const categoryId = $(this).data("category-id");

                // Highlight active category
                $links.removeClass("active");
                $(this).addClass("active");

                // Fetch products for selected category
                _this.rpc("/website_sale/get_products", {
                    category_id: categoryId,
                }).then(function (product_html) {
                    const $productDisplay = _this.$target.closest(".row").find(".js_product_display");
                    $productDisplay.html(product_html);

                    // 🔁 Bind variant price update logic here
                    $productDisplay.on("change", ".variant-select", function (e) {
                        const select = e.currentTarget;
                        const selectedOption = select.options[select.selectedIndex];
                        const newPrice = selectedOption.getAttribute("data-price");
                        const productId = select.getAttribute("data-product-id");

                        const productCard = select.closest(".product-item");
                        const priceEl = productCard.querySelector("#main_price_" + productId);

                        if (priceEl && newPrice) {
                            priceEl.textContent = newPrice;
                        }
                    });
                }).catch(function (error) {
                    console.error("Failed to fetch products:", error);
                    if (_this.editableMode) {
                        _this.$target.closest(".row").find(".js_product_display").html(
                            $("<p/>", {
                                class: "text-danger",
                                text: _t("An error occurred while fetching products. Please try again later."),
                            })
                        );
                    }
                });
            });

            // 🔥 Auto-load the first category
            $links.first().trigger("click");
        }).catch(function (error) {
            console.error("Failed to fetch categories:", error);
            if (_this.editableMode) {
                _this.$target.append(
                    $("<p/>", {
                        class: "text-danger",
                        text: _t("An error occurred with this product categories block. If the problem persists, please consider deleting it and adding a new one."),
                    })
                );
            }
        });

        return $.when(this._super.apply(this, arguments), def);
    },

    /**
     * @override
     */
    destroy: function () {
        this.$target.empty();
        this._super.apply(this, arguments);
    },
});
