const htmlParser = require('fast-html-parser');
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

  it('takes a url and returns a DOM object', async () => {
    const url = './data/abff2f3b-4739-4082-9dc1-97c67af48caa.html';
    try {
      const DOM = await utils.getHTMLDOMFromUrl(url);
      const htmlObject = {
        tagName: null,
        rawAttrs: '',
        childNodes: [],
        classNames: []
      };
      expect(DOM).toMatchObject(htmlObject);
    } catch(err) {}
  });

  it('takes a DOM object and returns a list of string', () => {
    const DOM = htmlParser.parse('<p>paragraph   </p><ul><li>item\n list</li></ul>');
    const text = utils.getSentencesFromDOM(DOM);
    expect(text).toEqual(['paragraph', 'item list']);
  })

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
      modifiedDocs = await utils.processSolrSearchResults(docs, 'test');
    });

    it('returns an empty description if no description is present', () => {
      expect(modifiedDocs[0].description).toEqual('');
    });

    it('returns the correct url from the mapping if no url is present', () => {
      expect(modifiedDocs[0].url).toEqual('https://www.theguardian.com/us');
    });
  });

  describe('spell checker', () => {
    it('takes a correctly spelt word and returns it', () => {
      const word = 'donald';
      expect(utils.correctSpelling(word)).toEqual('donald');
    });

    it('takes a wrongly spelt word and returns the correct word 1', () => {
      const wrongWord = 'speling';
      expect(utils.correctSpelling(wrongWord)).toEqual('spelling');
    });

    it('takes a wrongly spelt word and returns the correct word 2', () => {
      const wrongWord = 'clmat';
      expect(utils.correctSpelling(wrongWord)).toEqual('climate');
    });

    it('takes a wrongly spelt word and returns the correct word 2', () => {
      const wrongWord = 'chnge';
      expect(utils.correctSpelling(wrongWord)).toEqual('change');
    });
  });

  describe('snippet extaction', () => {
    const url = './data/abff2f3b-4739-4082-9dc1-97c67af48caa.html';
    it('takes an html page and a single query term and returns a snippet', async () => {
      const query = 'venezuela';
      let snippet;
      try {
        const DOM = await utils.getHTMLDOMFromUrl(url);
        const sentences = utils.getSentencesFromDOM(DOM);
        snippet = utils.generateSnippet(sentences, query);
      } catch(err) {}
      expect(snippet).toEqual('Trump tells Americans not to travel to Venezuela');
    });

    it('takes an html page with a sentence containing all query terms and returns a snippet',
      async () => {
      const query = 'klausner took her sweet revenge';
      let snippet;
      try {
        const DOM = await utils.getHTMLDOMFromUrl(url);
        const sentences = utils.getSentencesFromDOM(DOM);
        snippet = utils.generateSnippet(sentences, query);
      } catch(err) {}
      expect(snippet).toEqual('Today, Klausner took her sweet revenge on the Republican and staunch abortion opponent by raising thousands of dollars for Planned Parenthood.');
    });

    it('takes an html page with a sentence containing all query terms and returns a snippet 2',
      async () => {
      const new_url = './data/a6797eaa-4bca-4197-a699-bfff7aa9ea74.html';
      const query = 'climate change';
      let snippet;
      try {
        const DOM = await utils.getHTMLDOMFromUrl(new_url);
        const sentences = utils.getSentencesFromDOM(DOM);
        snippet = utils.generateSnippet(sentences, query);
      } catch(err) {}
      expect(snippet).toBe('... what most of the world fears most: the rising tides and temperatures of climate change.');
    });

    it('takes an html page with a sentence containing all query terms and returns a snippet 3',
      async () => {
      const new_url = './data/4c49a8b9-023e-4340-9bd3-693571650bf7.html';
      const query = 'climate change';
      let snippet;
      try {
        const DOM = await utils.getHTMLDOMFromUrl(new_url);
        const sentences = utils.getSentencesFromDOM(DOM);
        snippet = utils.generateSnippet(sentences, query);
      } catch(err) {}
      expect(snippet).toBe('Climate change has been the elephant in the room during the past two US presidential debates. Ignoring this issue would be more understandable if this ...');
    });

    it('takes an html page with a sentence containing all query terms but not in the same order and returns a snippet 1',
      async () => {
      const query = 'klausner sweet revenge';
      let snippet;
      try {
        const DOM = await utils.getHTMLDOMFromUrl(url);
        const sentences = utils.getSentencesFromDOM(DOM);
        snippet = utils.generateSnippet(sentences, query);
      } catch(err) {}
      expect(snippet).toEqual('Today, Klausner took her sweet revenge on the Republican and staunch abortion opponent by raising thousands of dollars for Planned Parenthood.');
    });

    it('takes an html page with a sentence containing all query terms but not in the same order and returns a snippet 2',
      async () => {
      const query = 'klausner trolls twitter fun';
      let snippet;
      try {
        const DOM = await utils.getHTMLDOMFromUrl(url);
        const sentences = utils.getSentencesFromDOM(DOM);
        snippet = utils.generateSnippet(sentences, query);
      } catch(err) {}
      expect(snippet).toEqual('Klausner clearly had fun with the trolls, of which there were many, because, you know, Twitter.');
    });

    it('takes an html page with a sentence containing some query terms and returns a snippet',
      async () => {
      const query = 'john kasich venezuela';
      let snippet;
      try {
        const DOM = await utils.getHTMLDOMFromUrl(url);
        const sentences = utils.getSentencesFromDOM(DOM);
        snippet = utils.generateSnippet(sentences, query);
      } catch(err) {}
      expect(snippet).toEqual('Earlier this month, former Ohio Governor John Kasich refused to sit in a “less desirable seat” and instead took comedian Julie Klausner’s seat on a flight from ...');
    });

    it('takes an html page with a sentence containing no query terms and returns a snippet',
      async () => {
      const query = 'ronald reagan';
      let snippet;
      try {
        const DOM = await utils.getHTMLDOMFromUrl(url);
        const sentences = utils.getSentencesFromDOM(DOM);
        snippet = utils.generateSnippet(sentences, query);
      } catch(err) {}
      expect(snippet).toEqual('');
    });
  });
})
