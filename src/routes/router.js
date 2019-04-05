const utils = require('../utils');
const solrNode = require('solr-node');
const client = new solrNode({
  host: 'localhost',
  port: '8983',
  core: 'csci572-hw4'
});

module.exports = {
  search: async (req, res) => {
    if(Object.keys(req.query).length!==2 || !utils.isValidQuery(req.query.q)) {
      res.status(400).send({
        error: '2 query parameters are required'
      });
      return;
    }

    let query = req.query.q;
    const algorithm = req.query.algorithm;

    query = utils.sanitizeSearchQuery(query);

    let solrQuery = `q=${query}&sort=${utils.getSolrSortQueryValue(algorithm)}`;
    try {
      const result = await client.search(solrQuery);
      const responseObj = await utils.processSolrResults(result.response.docs);
      res.status(200).send(responseObj);
    } catch(err) {
      res.status(500).send({
        error: err
      })
      return;
    }
  }
}
