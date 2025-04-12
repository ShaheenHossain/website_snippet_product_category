# Copyright 2020 Tecnativa - Alexandre Díaz
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
from odoo import fields, models


class ProductPublicCategory(models.Model):
    _inherit = "product.public.category"

    published_in_product_category_snippet = fields.Boolean(
        "Published in product category snippet", copy=False
    )




from odoo import models, fields, api

class ExportPosToWebsite(models.TransientModel):
    _name = 'export.pos.to.website.wizard'
    _description = 'Export POS Product Categories to Website'

    def export_pos_products_to_website(self):
        # Find all products available only in POS
        pos_products = self.env['product.template'].search([
            ('available_in_pos', '=', True),
            ('website_published', '=', False)
        ])

        for product in pos_products:
            # Check if product has a public category
            pos_category = product.public_categ_ids[:1]  # You can enhance this logic if multiple categories
            if pos_category:
                # Check if same category exists on website (e.g. use name)
                website_category = self.env['product.public.category'].search([
                    ('name', '=', pos_category.name)
                ], limit=1)

                # Create if not exists
                if not website_category:
                    website_category = self.env['product.public.category'].create({
                        'name': pos_category.name,
                        'parent_id': pos_category.parent_id.id if pos_category.parent_id else False,
                    })

                # Link product to website category
                product.write({
                    'website_published': True,
                    'public_categ_ids': [(6, 0, [website_category.id])]
                })

        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'title': 'Export Complete',
                'message': 'POS products and categories have been published on the website.',
                'sticky': False,
            }
        }


from odoo import models, api
import logging

_logger = logging.getLogger(__name__)


class PosCategory(models.Model):
    _inherit = 'pos.category'

    @api.model
    def _export_to_website(self, active_ids):
        product_obj = self.env['product.template']
        public_categ_obj = self.env['product.public.category']
        pos_categories = self.browse(active_ids)

        for pos_categ in pos_categories:
            # --- 1. Handle Parent Category ---
            parent_public_categ = False
            if pos_categ.parent_id:
                parent_public_categ = public_categ_obj.search([('name', '=', pos_categ.parent_id.name)], limit=1)
                if not parent_public_categ:
                    parent_public_categ = public_categ_obj.create({
                        'name': pos_categ.parent_id.name,
                    })

            # --- 2. Create or Find Current Category ---
            public_categ = public_categ_obj.search([('name', '=', pos_categ.name)], limit=1)
            if not public_categ:
                public_categ = public_categ_obj.create({
                    'name': pos_categ.name,
                    'parent_id': parent_public_categ.id if parent_public_categ else False
                })
            else:
                # Ensure parent relationship is synced
                public_categ.write({'parent_id': parent_public_categ.id if parent_public_categ else False})

            # --- 3. Assign Products ---
            products = product_obj.search([('pos_categ_id', '=', pos_categ.id)])
            for product in products:
                # Append to existing public categories (prevent override)
                updated_categ_ids = product.public_categ_ids.ids + [public_categ.id]
                updated_categ_ids = list(set(updated_categ_ids))  # Ensure uniqueness

                product.write({
                    'public_categ_ids': [(6, 0, updated_categ_ids)],
                    'website_published': True,
                })

            _logger.info(f"Exported {len(products)} products to public category '{public_categ.name}'")



class ProductTemplate(models.Model):
    _inherit = 'product.template'

    pos_categ_id = fields.Many2one(
        'pos.category',
        string="Point of Sale Category",
        compute='_compute_pos_categ_id',
        store=True
    )

    @api.depends('product_variant_ids')
    def _compute_pos_categ_id(self):
        for template in self:
            # Get POS category from the first variant (if exists)
            template.pos_categ_id = template.product_variant_ids[:1].pos_categ_id



    @api.model
    def _bulk_publish_to_website(self, active_ids):
        products = self.browse(active_ids)

        for product in products:
            if not product.website_published:
                product.website_published = True
                _logger.info(f"Published product: {product.name}")

        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'title': "Website Publishing",
                'message': f"{len(products)} product(s) published on the website.",
                'sticky': False,
            }
        }