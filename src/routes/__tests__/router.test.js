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

    it('should return status code of 200 for valid query', async () => {
      try {
        res = await makeRequest('test');
      } catch(err) {}
      expect(res.statusCode).toEqual(200);
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

    it('returns an array of document objects if query is successful', async () => {
      try {
        res = await makeRequest('test query');
      } catch(err) {}
      expect(JSON.parse(res.body).length).toBeGreaterThan(0);
    });

    it('returns the correct document objects', async () => {
      try {
        res = await makeRequest('test');
      } catch(err) {}
      expect(JSON.parse(res.body)[0]).toHaveProperty('id');
      expect(JSON.parse(res.body)[0]).toHaveProperty('url');
      expect(JSON.parse(res.body)[0]).toHaveProperty('title');
      expect(JSON.parse(res.body)[0]).toHaveProperty('description');
    });
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

    it('should return status code of 200 for valid query', async () => {
      this.get.resolves(mockResponses.success);
      try {
        res = await makeRequest('test');
      } catch(err) {}
      expect(res.statusCode).toEqual(200);
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

    it('returns an array of document objects if query is successful', async () => {
      this.get.resolves(mockResponses.success);
      try {
        res = await makeRequest('test query');
      } catch(err) {}
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('returns the correct document objects', async () => {
      this.get.resolves(mockResponses.success);
      try {
        res = await makeRequest('test');
      } catch(err) {}
      expect(res.body[0]).toHaveProperty('id');
      expect(res.body[0]).toHaveProperty('url');
      expect(res.body[0]).toHaveProperty('title');
      expect(res.body[0]).toHaveProperty('description');
    });

    // ---------------------------------------------------------------- //

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
