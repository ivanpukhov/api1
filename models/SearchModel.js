const esClient = require('../config/elasticsearch');

class SearchModel {
    async getAutocompleteSuggestions(query) {
        try {
            const response = await esClient.search({
                index: 'products',
                body: {
                    query: {
                        match: {
                            name: {
                                query: query,
                                fuzziness: 'AUTO'
                            }
                        }
                    }
                }
            });

            if (response && response.hits && response.hits.hits) {
                return response.hits.hits.map(hit => hit._source.name);
            }

            return [];
        } catch (error) {
            console.error("An error occurred:", error);
            throw error;
        }
    }
}

module.exports = new SearchModel();
