const utils = require('../utils');

module.exports = {
  search: async (req, res) => {
    if(Object.keys(req.query).length<3 || !utils.isValidQuery(req.query.q)) {
      res.status(404).send({
        error: '3 query parameters are required'
      });
      return;
    }

    const query = utils.sanitizeSearchQuery(req.query.q);
    const spellCheck = (req.query.spellCheck==='true' ? true : false);
    const correctedQuery = (
      spellCheck ?
      query.split(' ').map(term => utils.correctSpelling(term)).join(' ') :
      query
    );
    const algorithm = req.query.algorithm;

    const solrQuery = `q=${correctedQuery}&sort=${utils.getSolrSortQueryValue(algorithm)}`;
    try {
      const result = await utils.querySolr('select', solrQuery);
      const docs = await utils.processSolrSearchResults(result.response.docs, correctedQuery);

      const responseObj = {
        original_query: query,
        corrected_query: correctedQuery,
        docs: docs
      };
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
