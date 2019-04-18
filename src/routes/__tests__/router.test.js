const sinon = require('sinon');
const request = require('request-promise-native');
const mockResponses = require('./fixtures.json')

describe('search route', () => {
  const makeRequest = async (query, algorithm = 'lucene') => {
    const options = {
      uri: 'http://localhost:3000/search',
      qs: {
        q: query,
        algorithm: algorithm
      },
      resolveWithFullResponse: true
    };
    try {
      const response = await request.get(options);
      return response;
    } catch(err) {
      return err;
    }
  };

  describe('not stubbed', () => {
    let res = null;

    afterEach(() => {
      res = null;
    });

    describe('error', () => {
      it('throws error if request does not contain query and algorithm', async () => {
        const options = {
          uri: 'http://localhost:3000/search',
          qs: {
            q: 'search query'
          },
          resolveWithFullResponse: true
        };

        try {
          res = await request.get(options);
        } catch(err) {
          res = err;
        }
        expect(res.statusCode).toEqual(404);
        expect(JSON.parse(res.error)).toEqual({
          error: '2 query parameters are required'
        });
      });

      it('should return a status code of 404 for invalid query', async () => {
        try {
          res = await makeRequest(null);
        } catch(err) {}
        expect(res.statusCode).toEqual(404);
      });

      it('returns the correct response object if query term is invalid', async () => {
        try {
          res = await makeRequest(undefined);
        } catch(err) {
          res = err;
        }
        expect(JSON.parse(res.error)).toEqual({
          error: '2 query parameters are required'
        });
      });
    })

    // --------------------------------- //
    describe('success', () => {
      // ---------------------- //
      jest.setTimeout(10000);
      // ---------------------- //

      it('should return status code of 200 for valid query', async () => {
        try {
          res = await makeRequest('test');
        } catch(err) {}
        expect(res.statusCode).toEqual(200);
      });

      it('takes a misspelt query but corrects the query before submitting the query', async () => {
        try {
          res = await makeRequest('clmat chnge');
        } catch(err) {}
        res = JSON.parse(res.body);
        expect(res.corrected_query).toEqual('climate change');
      });

      it('returns an object containing the original query, corrected query and docs', async () => {
        try {
          res = await makeRequest('test');
        } catch(err) {}
        res = JSON.parse(res.body);
        expect(res).toHaveProperty('original_query');
        expect(res).toHaveProperty('corrected_query');
        expect(res).toHaveProperty('docs');
      });

      it('returns an array of document objects if query is successful', async () => {
        try {
          res = await makeRequest('clmat chnge');
        } catch(err) {}
        res = JSON.parse(res.body);
        expect(res.docs.length).toBeGreaterThan(0);
      });

      it('docs have the required values', async () => {
        try {
          res = await makeRequest('test');
        } catch(err) {}
        res = JSON.parse(res.body).docs;
        expect(res[0]).toHaveProperty('id');
        expect(res[0]).toHaveProperty('url');
        expect(res[0]).toHaveProperty('title');
        expect(res[0]).toHaveProperty('description');
        expect(res[0]).toHaveProperty('snippet');
      });

    });
    // --------------------------------- //

  });

  describe('when stubbed', () => {
    beforeEach(() => {
      this.get = sinon.stub(request, 'get');
    });

    afterEach(() => {
      request.get.restore();
    })

    let res;

    // ---------------------------------------------------------------- //
    describe('error', () => {
      it('throws error if request does not contain query and algorithm', async () => {
        this.get.resolves(mockResponses.failure[2]);
        const options = {
          uri: 'http://localhost:3000/search',
          qs: {
            q: 'search query'
          },
          resolveWithFullResponse: true
        };

        try {
          res = await request.get(options);
        } catch(err) {
          res = err;
        }
        expect(res.statusCode).toEqual(400);
        expect(res.error).toEqual({
          error: '2 query parameters are required'
        });
      });

      it('should return a status code of 400 for invalid query', async () => {
        this.get.resolves(mockResponses.failure[2]);
        try {
          res = await makeRequest(null);
        } catch(err) {}
        expect(res.statusCode).toEqual(400);
      });

      it('returns the correct response object if query term is invalid', async () => {
        this.get.resolves(mockResponses.failure[2]);
        try {
          res = await makeRequest(undefined);
        } catch(err) {
          res = err;
        }
        expect(res.error).toEqual({
          error: '2 query parameters are required'
        });
      });

      it('returns a status code of 500 if request fails', async () => {
        this.get.resolves(mockResponses.failure[1]);
        try {
          res = await makeRequest('text');
        } catch(err) {}
        expect(res.statusCode).toEqual(500);
      });

      it('returns an error message if request fails', async () => {
        this.get.resolves(mockResponses.failure[1]);
        try {
          res = await makeRequest('text');
        } catch(err) {}
        expect(res.body.data.error).toEqual("some error message");
      });
    });

    describe('success', () => {
      it('should return status code of 200 for valid query', async () => {
        this.get.resolves(mockResponses.success[0]);
        try {
          res = await makeRequest('test');
        } catch(err) {}
        expect(res.statusCode).toEqual(200);
      });

      it('takes a misspelt query but corrects the query before submitting the query', async () => {
        this.get.resolves(mockResponses.success[1]);
        try {
          res = await makeRequest('donlad trunp');
        } catch(err) {}
        expect(res.body.corrected_query).toEqual('donald trump');
      });

      it('returns an object containing the original query, corrected query and docs', async () => {
        this.get.resolves(mockResponses.success[0]);
        try {
          res = await makeRequest('test');
        } catch(err) {}
        expect(res.body).toHaveProperty('original_query');
        expect(res.body).toHaveProperty('corrected_query');
        expect(res.body).toHaveProperty('docs');
      });

      it('returns an array of document objects if query is successful', async () => {
        this.get.resolves(mockResponses.success[0]);
        try {
          res = await makeRequest('test query');
        } catch(err) {}
        expect(res.body.docs.length).toBeGreaterThan(0);
      });

      it('docs have the required values', async () => {
        this.get.resolves(mockResponses.success[0]);
        try {
          res = await makeRequest('test');
        } catch(err) {}
        expect(res.body.docs[0]).toHaveProperty('id');
        expect(res.body.docs[0]).toHaveProperty('url');
        expect(res.body.docs[0]).toHaveProperty('title');
        expect(res.body.docs[0]).toHaveProperty('description');
        expect(res.body.docs[0]).toHaveProperty('snippet');
      });

    });

    // ---------------------------------------------------------------- //
  });
});

describe('suggest route', () => {
  const makeRequest = async (query) => {
    const options = {
      uri: 'http://localhost:3000/suggest',
      qs: {
        q: query
      },
      resolveWithFullResponse: true
    };
    try {
      const response = await request.get(options);
      return response;
    } catch(err) {
      return err;
    }
  };

  describe('when not stubbed', () => {
    let res = null;

    afterEach(() => {
      res = null;
    });

    it('should return a status code of 404 for invalid query', async () => {
      try {
        res = await makeRequest(null);
      } catch(err) {}
      expect(res.statusCode).toEqual(404);
    });

    it('returns a list of suggestions for an input query', async () => {
      try {
        res = await makeRequest('calif');
      } catch(err) {}

      expect(res.statusCode).toEqual(200);
      expect(JSON.parse(res.body)).toHaveProperty('suggestions');
      expect(JSON.parse(res.body).suggestions).toHaveLength(5);
      expect(JSON.parse(res.body).suggestions).toEqual([
        'calif', 'california', 'california’s', 'cliff', 'clifford'
      ]);
    });
  })
})
