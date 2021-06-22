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
const lab = require('lab').script();
exports.lab = lab;

const { test, suite } = lab;

const originalDocument = require('./../data/data');
const StatementsService = require('./../../services/StatementsService');

suite('[test][Statement]', () => {
    test('Should return a post update statement', async () => {
        const mutations = { "posts": [{ "_id": 2, "value": "too" }] };
        //const statements = await generateUpdateStatement(originalDocument, mutations);
        const statements = await new StatementsService().handle(originalDocument, mutations);

        expect(statements).to.equal({ "$update": { "posts.0.value": "too" } });
    });

    test('Should return a post add statement', async () => {
        const mutations = { "posts": [{ "value": "four" }] };
        const statements = await new StatementsService().handle(originalDocument, mutations);

        expect(statements).to.equal({ "$add": { "posts": [{ "value": "four" }] } });
    });

    test('Should return a remove post statement', async () => {
        const mutations = { "posts": [{ "_id": 2, "_delete": true }] };
        const statements = await new StatementsService().handle(originalDocument, mutations);

        expect(statements).to.equal({ "$remove": { "posts.0": true } });
    });

    test('Should return a mentions update statement', async () => {
        const mutations = { "posts": [{ "_id": 3, "mentions": [{ "_id": 5, "text": "pear" }] }] }
        const statements = await new StatementsService().handle(originalDocument, mutations);

        expect(statements).to.equal({ "$update": { "posts.1.mentions.0.text": "pear" } });
    });

    test('Should return a mentions add statement', async () => {
        const mutations = { "posts": [{ "_id": 3, "mentions": [{ "text": "banana" }] }] };
        const statements = await new StatementsService().handle(originalDocument, mutations);

        expect(statements).to.equal({ "$add": { "posts.1.mentions": [{ "text": "banana" }] } });
    });

    test('Should return a mentions remove statement', async () => {
        const mutations = { "posts": [{ "_id": 3, "mentions": [{ "_id": 6, "_delete": true }] }] };
        const statements = await new StatementsService().handle(originalDocument, mutations);

        expect(statements).to.equal({ "$remove": { "posts.1.mentions.1": true } });
    });

    test('Should return a posts update, add and remove statements', async () => {
        const mutations = {
            "posts": [
                { "_id": 2, "value": "too" },
                { "value": "four" },
                { "_id": 4, "_delete": true }
            ]
        };
        const statements = await new StatementsService().handle(originalDocument, mutations);

        /**
         * PDF says that this result should be index 1 for $remove statement, but the index for ID 4 on sample data is 2.
         */
        expect(statements).to.equal({
            "$update": { "posts.0.value": "too" },
            "$add": { "posts": [{ "value": "four" }] },
            "$remove": { "posts.2": true }
        });
    });
});