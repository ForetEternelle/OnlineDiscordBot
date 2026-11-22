const createClient = require('openapi-fetch').default;
const {baseUrlDataApi} = require('./settings');

/**
 * Typed client for the Pokemon Studio Data API.
 * Types are generated from the API's OpenAPI spec: run `npm run generate:data-api`.
 *
 * @type {import('openapi-fetch').Client<import('./dataApi.schema').paths>}
 */
const dataApi = createClient({baseUrl: baseUrlDataApi});

module.exports = {dataApi};
