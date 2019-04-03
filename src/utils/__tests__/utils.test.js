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
      id: '08a33d9b-af5c-4e9c-8d25-0942007a00d0.html',
      title: ['title'],
      og_url: null,
      og_description: null
    }];
    let modifiedDocs;
    beforeEach(async () => {
      modifiedDocs = await utils.processSolrResults(docs);
    });

    it('returns a description of N/A if no description is present', () => {
      expect(modifiedDocs[0].description).toEqual('N/A');
    });

    it('returns the correct url from the mapping if no url is present', () => {
      expect(modifiedDocs[0].url).toEqual('https://www.theguardian.com/us');
    });
  });
})
