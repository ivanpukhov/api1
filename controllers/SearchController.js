const SearchModel = require('../models/SearchModel');

class SearchController {
    async getAutocomplete(req, res) {
        try {
            const query = req.query.q;
            const suggestions = await SearchModel.getAutocompleteSuggestions(query);
            res.json(suggestions);
        } catch (error) {
            console.error("An error occurred:", error);
            res.status(500).send("Internal Server Error");
        }
    }
}

module.exports = new SearchController();
