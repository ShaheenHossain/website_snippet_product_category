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

    # @http.route(
    #     ["/website_sale/get_products"],
    #     type="json",
    #     auth="public",
    #     website=True,
    #     csrf=False
    # )
    # def get_products(self, category_id, **kwargs):
    #     try:
    #         domain = [('website_published', '=', True)]
    #
    #         if int(category_id) != 0:
    #             # Get selected category and its descendants
    #             category = request.env['product.public.category'].browse(int(category_id))
    #             all_category_ids = category.search([('id', 'child_of', category.id)]).ids
    #             domain.append(('public_categ_ids', 'in', all_category_ids))
    #
    #         products = request.env['product.template'].sudo().search(domain)
    #
    #         # Fetch active variants grouped by product
    #         variants = request.env['product.product'].sudo().search([
    #             ('product_tmpl_id', 'in', products.ids),
    #             ('active', '=', True),
    #         ])
    #
    #         variants_by_product = {}
    #         for variant in variants:
    #             tmpl_id = variant.product_tmpl_id.id
    #             variants_by_product.setdefault(tmpl_id, []).append(variant)
    #
    #         return request.env['ir.qweb']._render(
    #             'website_snippet_product_category.s_product_list', {
    #                 'products': products,
    #                 'variants_by_product': variants_by_product,
    #             }
    #         )
    #     except Exception as e:
    #         return {
    #             "error": str(e),
    #             "traceback": traceback.format_exc()
    #         }



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

            products = request.env['product.template'].sudo().search(domain)

            variants = request.env['product.product'].sudo().search([
                ('product_tmpl_id', 'in', products.ids),
                ('active', '=', True),
            ])

            variants_by_product = {}
            for variant in variants:
                tmpl_id = variant.product_tmpl_id.id
                variants_by_product.setdefault(tmpl_id, []).append(variant)

            return request.env['ir.qweb']._render(
                'website_snippet_product_category.s_product_list', {
                    'products': products,
                    'variants_by_product': variants_by_product,
                }
            )
        except Exception as e:
            return {
                "error": str(e),
                "traceback": traceback.format_exc()
            }