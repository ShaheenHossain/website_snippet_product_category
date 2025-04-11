from odoo import http
from odoo.http import request
from odoo.addons.website.controllers.main import QueryURL
import traceback


class Website(http.Controller):

    @http.route(
        ["/website_sale/render_product_category"],
        type="json",
        auth="public",
        website=True,
    )
    def render_product_category(self, template, **kwargs):
        categories = request.env["product.public.category"].search([
            ("parent_id", "=", False),
            ("published_in_product_category_snippet", "=", True),
        ])
        keep = QueryURL("/shop", category=0)
        return request.env["ir.qweb"]._render(template, {
            "object": categories,
            "keep": keep
        })


    @http.route(
        ["/website_sale/get_products"],
        type="json",
        auth="public",
        website=True,
        csrf=False
    )
    def get_products(self, category_id, **kwargs):
        try:
            domain = [('website_published', '=', True)]

            if int(category_id) != 0:
                category = request.env['product.public.category'].browse(int(category_id))
                all_category_ids = category.search([('id', 'child_of', category.id)]).ids
                domain.append(('public_categ_ids', 'in', all_category_ids))

            # Get products with their variants in a single query
            products = request.env['product.template'].with_context(
                active_test=False
            ).search(domain)

            # Prefetch variants data to optimize performance
            products.read(['name', 'list_price', 'image_1920', 'currency_id'])

            # Get all variants for these products
            variants = request.env['product.product'].search([
                ('product_tmpl_id', 'in', products.ids),
                ('active', '=', True),
            ])

            variants_by_product = {}
            for variant in variants:
                if variant.product_tmpl_id.id not in variants_by_product:
                    variants_by_product[variant.product_tmpl_id.id] = []
                variants_by_product[variant.product_tmpl_id.id].append({
                    'id': variant.id,
                    'display_name': variant.display_name,
                    'lst_price': variant.lst_price,
                    'price_extra': variant.price_extra,
                    'attribute_values': variant.product_template_attribute_value_ids.mapped('name')
                })

            return request.env['ir.qweb']._render(
                'website_snippet_product_category.s_product_list', {
                    'products': products,
                    'variants_by_product': variants_by_product,
                }
            )
        except Exception as e:
            error_msg = _("Error loading products: %s") % str(e)
            return {
                "error": error_msg,
                "products": [],
                "variants_by_product": {}
            }