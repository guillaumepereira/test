const route = (module.exports = require('express').Router());
const Products = require('../data/products');
const Joi = require('joi');
const _ = require('lodash');
const validator = require('express-joi-validation').createValidator({});

const schemaProduct = Joi.object({
    code: Joi.string().required(),
    name: Joi.string().required(),
    description: Joi.string().required(),
    price: Joi.number().required(),
    quantity: Joi.number().integer().required(),
    inventoryStatus: Joi.string().required().valid('INSTOCK', 'LOWSTOCK', 'OUTOFSTOCK'),
    category: Joi.string().required(),
    image: Joi.string(),
    rating: Joi.number(),
});

const requestParamId = Joi.object({
    id: Joi.number().integer().required(),
});

/**
 * This "GET /" endpoint is used to query all products
 */
route.get('/',
    (req, res) => {
        console.log('\n Getting all products');
        const products = _.filter(Products);
        if (products.length) {
            res.json(Products);
        } else {
            res.status(404).json({
                message: 'no product exists'
            });
        }
    })

/**
 * This "POST /" endpoint is used to create new product
 */
route.post(
    '/',
    require('body-parser').json(),
    validator.body(schemaProduct),
    (req, res) => {
        console.log(`\n Creating product with data ${JSON.stringify(req.body, null, 2)}.`)
        const before = Products.length;
        // Generate data required for insert (new id is incremented from previous max)
        const prevMaxId = (_.maxBy(Products, product => product.id)).id
        const data = { ...req.body, id: prevMaxId + 1 };

        Products.push(data);
        const after = Products.length;
        res.json({ message: "created product", before, after });
    }
);

/**
 * This "GET /:id" endpoint is used to query a product by its ID
 */
route.get('/:id',
    validator.params(requestParamId),
    (req, res) => {
        const { params: { id } } = req;
        console.log(`\nGetting product by id ${id}.`);
        const product = _.find(Products, { id: +id });
        console.log(product);

        if (product) {
            res.json(product);
        } else {
            res.status(404).json({
                message: `no product exists with id : ${id}`
            });
        }
    });

/**
 * This "PATCH /:id" endpoint is used to update a product by its ID
 */
route.patch(
    '/:id',
    require('body-parser').json(),
    validator.body(schemaProduct),
    validator.params(requestParamId),
    (req, res) => {
        const { params: { id } } = req;
        const data = { id: +id, ...req.body };
        console.log(`\n Modifying product with data ${JSON.stringify(data, null, 2)}.`);

        const product = _.find(Products, { id: +id });
        if (product) {
            var index = _.indexOf(Products, product);
            Products.splice(index, 1, data);
            res.json({ message: 'product updated' });
        } else {
            res.status(404).json({
                message: `no product exists with id : ${id}`
            });
        }
    }
);

/**
 * This "DELETE /:id" endpoint is used to remove a product with its ID
 */
route.delete('/:id',
    validator.params(requestParamId),
    (req, res) => {
        const { params: { id } } = req;
        console.log(`\nRemoving product by id ${id}.`);
        const before = Products.length;
        _.remove(Products, { id: +id });
        const after = Products.length;
        res.json({ message: "deleted product", before, after });
    });
