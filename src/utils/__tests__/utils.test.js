const utils = require('../index.js');

describe('helper functions', () => {
  it('checks if query is valid', () => {
    const q1 = null, q2 = undefined, q3 = '', q4 = 'test query';

    expect(utils.isValidQuery(q1)).toEqual(false);
    expect(utils.isValidQuery(q2)).toEqual(false);
    expect(utils.isValidQuery(q3)).toEqual(false);
    expect(utils.isValidQuery(q4)).toEqual(true);
  });

  it('converts query to lower case', () => {
    const q = 'TEST QUERY';
    expect(utils.sanitizeSearchQuery(q)).toEqual('test query');
  });

  describe('process Solr results', () => {
    const docs = [{
      "id": "id",
      "title": "title",
      "url": null,
      "description": null
    }];
    
    it('returns a description of N/A if no description is present', () => {
      const modifiedDocs = utils.processSolrResults(docs);
      expect(modifiedDocs.description).toEqual('N/A');
    });
  });
})
