const utils = require('../utils');

module.exports = {
  search: async (req, res) => {
    if(Object.keys(req.query).length!==2 || !utils.isValidQuery(req.query.q)) {
      res.status(404).send({
        error: '2 query parameters are required'
      });
      return;
    }

    let query = req.query.q;
    const algorithm = req.query.algorithm;

    query = utils.sanitizeSearchQuery(query);

    const solrQuery = `q=${query}&sort=${utils.getSolrSortQueryValue(algorithm)}`;
    try {
      const result = await utils.querySolr('select', solrQuery);
      let responseObj = await utils.processSolrSearchResults(result.response.docs, query);
      res.status(200).send(responseObj);
    } catch(err) {
      res.status(500).send({
        error: err
      })
      return;
    }
  },
  suggest: async(req, res) => {
    if(!utils.isValidQuery(req.query.q)) {
      res.status(404).send({
        error: 'query term for suggestion required'
      });
      return;
    }
    const query = utils.sanitizeSearchQuery(req.query.q);
    try {
      const result = await utils.querySolr('suggest', `q=${query}`);
      const suggestions = result.suggest.suggest[query].suggestions.map(suggestion => {
        return suggestion.term
      });
      res.status(200).send({
        suggestions: suggestions
      });
    } catch(err) {
      res.status(404).send({
        error: 'error fetching autocomplete suggestions'
      });
    }
  }
}
