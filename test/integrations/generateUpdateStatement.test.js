/**
 *
 * Author:  AppSeed.us
 *
 * License: MIT - Copyright (c) AppSeed.us
 * @link https://github.com/app-generator/nodejs-starter
 *
 */

const _ = require('lodash');
const { expect } = require('code');
const request = require('supertest');
const lab = require('lab').script();
exports.lab = lab;
const originalDocument = require('./../data/data');
const app = require('../../index.js');

const { test, suite } = lab;

suite('[test][Statement]', () => {
    test('Should access a route /api/statements and return a update statement', async (done) => {
        const response = await request(app).post('/api/statements').send({
            originalDocument,
            mutations: { "posts": [{ "_id": 2, "value": "too" }] }
        }).set('Accept', 'application/json');

        expect(response.status).to.equal(200);
        expect(response.body).to.equal({ "$update": { "posts.0.value": "too" } });
    });
});
