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

  describe('returns the correct sort query string value', () => {
    let alg;
    it('for lucene', () => {
      alg = 'lucene';
      expect(utils.getSolrSortQueryValue(alg)).toEqual('score desc');
    });

    it('for pagerank', () => {
      alg = 'pagerank';
      expect(utils.getSolrSortQueryValue(alg)).toEqual('pagerank desc');
    });
  })

  describe('process Solr results', () => {
    const docs = [{
      id: '08a33d9b-af5c-4e9c-8d25-0942007a00d0.html',
      title: ['title'],
      og_url: null,
      og_description: null
    }];
    let modifiedDocs;
    beforeEach(async () => {
      modifiedDocs = await utils.processSolrSearchResults(docs);
    });

    it('returns a description of N/A if no description is present', () => {
      expect(modifiedDocs[0].description).toEqual('N/A');
    });

    it('returns the correct url from the mapping if no url is present', () => {
      expect(modifiedDocs[0].url).toEqual('https://www.theguardian.com/us');
    });
  });

  describe('spell checker', () => {
    it('takes a wrongly spelt word and returns the correct word 1', () => {
      const wrongWord = 'speling';
      expect(utils.correctSpelling(wrongWord)).toEqual('spelling');
    });

    it('takes a wrongly spelt word and returns the correct word 2', () => {
      const wrongWord = 'clmat';
      expect(utils.correctSpelling(wrongWord)).toEqual('climate');
    });
  });
})
