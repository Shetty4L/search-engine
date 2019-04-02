const utils = require('../utils');
const solrNode = require('solr-node');
const client = new solrNode({
  host: 'localhost',
  port: '8983',
  core: 'csci572-hw4'
});

module.exports = {
  search: async (req, res) => {
    let query = req.query.q;
    if(!utils.isValidQuery(query)) {
      res.status(400).send({
        error: 'Search term is not valid'
      });
      return;
    }

    query = utils.sanitizeSearchQuery(query);

    const solrQuery = client.query().q(query);
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
