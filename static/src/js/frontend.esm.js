/** @odoo-module **/

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
                    $("<div/>", {
                        class: "alert alert-warning alert-dismissible text-center",
                        text: _t("No categories were found. Make sure you have categories defined."),
                    })
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

                    // Initialize variant selection after products are loaded
                    _this.initVariantSelection($productDisplay);
                }).catch(function (error) {
                    console.error("Failed to fetch products:", error);
                    if (_this.editableMode) {
                        _this.$target.closest(".row").find(".js_product_display").html(
                            $("<div/>", {
                                class: "alert alert-danger",
                                text: _t("An error occurred while fetching products. Please try again later."),
                            })
                        );
                    }
                });
            });

            // Auto-load the first category
            $links.first().trigger("click");
        }).catch(function (error) {
            console.error("Failed to fetch categories:", error);
            if (_this.editableMode) {
                _this.$target.append(
                    $("<div/>", {
                        class: "alert alert-danger",
                        text: _t("An error occurred with this product categories block. If the problem persists, please consider deleting it and adding a new one."),
                    })
                );
            }
        });

        return $.when(this._super.apply(this, arguments), def);
    },

    /**
     * Initialize variant selection functionality
     */
    initVariantSelection: function($container) {
        // Handle variant dropdown toggle
        $container.on('click', '.variant-toggle', function() {
            const $toggle = $(this);
            const $options = $toggle.closest('.card-body').find('.variant-options');
            const $icon = $toggle.find('i');

            $options.slideToggle(200);
            $icon.toggleClass('fa-chevron-down fa-chevron-up');
        });

        // Handle variant selection
        $container.on('click', '.variant-item', function(e) {
            e.stopPropagation();
            const $variant = $(this);
            const price = $variant.find('.variant-price').text().trim();
            const $card = $variant.closest('.card');

            // Update main price display
            $card.find('.price-display').text(price);

            // Close dropdown
            $card.find('.variant-options').slideUp(200);
            $card.find('.variant-toggle i')
                .removeClass('fa-chevron-up')
                .addClass('fa-chevron-down');
        });

        // Initialize dropdowns
        $container.find('.variant-options').each(function() {
            const $options = $(this);
            const $items = $options.find('.variant-item');

            // Highlight first variant by default
            if ($items.length > 0) {
                const $firstVariant = $items.first();
                const price = $firstVariant.find('.variant-price').text().trim();
                $firstVariant.closest('.card').find('.price-display').text(price);
            }
        });
    },
    /**
     * @override
     */
    destroy: function () {
        this.$target.empty();
        this._super.apply(this, arguments);
    },
});