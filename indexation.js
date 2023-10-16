const esClient = require('./config/elasticsearch');
const Product = require("./models/Product"); // Import Elasticsearch client

// 1. Create index (if it doesn't exist)
esClient.indices.create({
    index: 'products',
    body: {
        settings: {
            analysis: {
                analyzer: {
                    my_edge_ngram_analyzer: {
                        type: "custom",
                        tokenizer: "my_edge_ngram_tokenizer",
                        filter: ["lowercase"]
                    },
                    my_search_analyzer: {
                        type: "custom",
                        tokenizer: "standard",
                        filter: ["lowercase"]
                    }
                },
                tokenizer: {
                    my_edge_ngram_tokenizer: {
                        type: "edge_ngram",
                        min_gram: 1,
                        max_gram: 25,
                        token_chars: ["letter", "digit"]
                    }
                }
            }
        },
        mappings: {
            properties: {
                name: {
                    type: 'text',
                    analyzer: 'my_edge_ngram_analyzer',
                    search_analyzer: 'my_search_analyzer'
                },
                description: {
                    type: 'text',
                    analyzer: 'my_edge_ngram_analyzer',
                    search_analyzer: 'my_search_analyzer'
                },
                category: {
                    type: 'keyword'
                },
                subcategory: {
                    type: 'keyword'
                }
            }
        }
    }
}, (err, resp, status) => {
    if (err) {
        console.log("Create index error:", err);
    } else {
        console.log("Create index response:", resp);
    }
});

// 2. Read data from your database
Product.getAll((err, products) => {
    if (err) {
        console.log("Database Error:", err);
        return;
    }

    // 3. Index data into Elasticsearch
    const body = products.flatMap(product => [{ index: { _index: 'products', _id: product.id } }, product]);

    esClient.bulk({ refresh: true, body }, (err, resp) => {
        if (err) {
            console.log("Elasticsearch Bulk Ingestion Error:", err);
        } else {
            console.log("Elasticsearch Bulk Ingestion Response:", resp);
        }
    });
});
