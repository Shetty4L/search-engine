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
      const responseObj = result.response.docs.map(doc => {
        const title = utils.isValidQuery(doc.title) ? doc.title : 'N/A';
        const url = utils.isValidQuery(doc.og_url) ? doc.og_url : 'N/A';
        const id = utils.isValidQuery(doc.id) ? doc.id : 'N/A';
        const description = utils.isValidQuery(doc.og_description) ? doc.og_description : 'N/A';
        const object = {
          title: title,
          url: url,
          id: id,
          description: description
        };
        return object;
      });
      res.status(200).send(responseObj);
    } catch(err) {
      res.status(500).send({
        error: err
      })
      return;
    }
  }
}
