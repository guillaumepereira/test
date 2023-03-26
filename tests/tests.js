const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const _ = require('lodash');
const should = chai.should();
const expect = chai.expect;

const Products = require('../data/products');

chai.use(chaiHttp);

describe('Products', () => {
    beforeEach((done) => { //Before each test we reinit the database
        _.remove(Products, {});
        Products.push(
            {
                "id": 1000,
                "code": "f230fh0g3",
                "name": "Bamboo Watch",
                "description": "Product Description",
                "image": "bamboo-watch.jpg",
                "price": 65,
                "category": "Accessories",
                "quantity": 24,
                "inventoryStatus": "INSTOCK",
                "rating": 5
            },
            {
                "id": 1001,
                "code": "nvklal433",
                "name": "Black Watch",
                "description": "Product Description",
                "image": "black-watch.jpg",
                "price": 72,
                "category": "Accessories",
                "quantity": 61,
                "inventoryStatus": "INSTOCK",
                "rating": 4
            });
        done();
    });
    /*
      * Test the /GET route
      */
    describe('/GET products', () => {
        it('it should GET all the products', (done) => {
            chai.request(server)
                .get('/products/')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    expect(res.body.length).to.equal(2);
                    done();
                });
        });

        it('it should GET a product by its ID', (done) => {
            chai.request(server)
                .get('/products/1001')
                .end((err, res) => {
                    res.should.have.status(200);
                    expect(res.body.id).to.equal(1001);
                    expect(res.body.name).to.equal('Black Watch');
                    done();
                });
        });
        it('it should return an error if it GET a unknown product', (done) => {
            chai.request(server)
                .get('/products/1010')
                .end((err, res) => {
                    res.should.have.status(404);
                    expect(res.error.text).to.equal('{"message":"no product exists with id : 1010"}');
                    done();
                });
        });
    });

    describe('/POST product', () => {
        it('it should post a new valid product', (done) => {
            const newProduct = {
                "code": "ps5",
                "name": "Playstation 5",
                "description": "Sony Playstation 5",
                "image": "ps5.jpg",
                "price": 500,
                "category": "Video games",
                "quantity": 2,
                "inventoryStatus": "INSTOCK",
                "rating": 10
            };

            chai.request(server)
                .post('/products/')
                .set('content-type', 'application/json')
                .send(newProduct)
                .end((err, res) => {
                    res.should.have.status(200);
                    expect(res.body.message).to.equal('created product');
                    expect(res.body.before).to.equal(2);
                    expect(res.body.after).to.equal(3);
                    done();
                });
        });

        it('it should not POST an invalid product', (done) => {
            const newProduct = {
                "code": "ps5",
                "name": "Playstation 5",
                "description": "Sony Playstation 5",
                "image": "ps5.jpg",
                "price": 500,
                "category": "Video games",
                "quantity": 2.4,
                "inventoryStatus": "INSTOCK",
                "rating": 10
            };

            chai.request(server)
                .post('/products/')
                .set('content-type', 'application/json')
                .send(newProduct)
                .end((err, res) => {
                    res.should.have.status(400);
                    expect(res.error.text).to.equal('Error validating request body. "quantity" must be an integer.');
                    done();
                });
        });
    });
    describe('/PATCH product', () => {
        it('it should PATCH an existing product', (done) => {
            const modifiedProduct = {
                "code": "nvklal433",
                "name": "Black Watch",
                "description": "Product Description",
                "image": "black-watch.jpg",
                "price": 72,
                "category": "Accessories",
                "quantity": 6100,
                "inventoryStatus": "INSTOCK",
                "rating": 4
            };

            chai.request(server)
                .patch('/products/1001')
                .set('content-type', 'application/json')
                .send(modifiedProduct)
                .end((err, res) => {
                    res.should.have.status(200);
                    expect(res.body.message).to.equal('product updated');
                    const product = _.find(Products, { id: 1001 });
                    expect(product.id).to.equal(1001);
                    expect(product.quantity).to.equal(6100);
                    done();
                });
        });

        it('it should get an error if it PATCH a non-existing product', (done) => {
            const modifiedProduct = {
                "code": "nvklal433",
                "name": "Black Watch",
                "description": "Product Description",
                "image": "black-watch.jpg",
                "price": 72,
                "category": "Accessories",
                "quantity": 6100,
                "inventoryStatus": "INSTOCK",
                "rating": 4
            };

            chai.request(server)
                .patch('/products/1111')
                .set('content-type', 'application/json')
                .send(modifiedProduct)
                .end((err, res) => {
                    res.should.have.status(404);
                    expect(res.error.text).to.equal('{"message":"no product exists with id : 1111"}');
                    done();
                });
        });
    });
    describe('/DELETE product', () => {
        it('it should delete an existing product', (done) => {
            chai.request(server)
                .delete('/products/1001')
                .end((err, res) => {
                    res.should.have.status(200);
                    expect(res.body.message).to.equal('deleted product');
                    done();
                });
        });
    });
});