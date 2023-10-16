// config/elasticsearch.js
const { Client } = require('@elastic/elasticsearch');

const client = new Client({ node: 'http://localhost:9200' });
// console.log("Elasticsearch client config: ", client);

module.exports = client;
