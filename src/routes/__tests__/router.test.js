const sinon = require('sinon');
const request = require('request-promise-native');
const mockResponses = require('./fixtures.json')

const makeRequest = async (query) => {
  const options = {
    uri: 'http://localhost:3000/search',
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

describe('search route', () => {
  describe('not stubbed', () => {
    let res = null;

    afterEach(() => {
      res = null;
    });

    it('should return a status code of 400 for invalid query', async () => {
      try {
        res = await makeRequest(null);
      } catch(err) {}
      expect(res.statusCode).toEqual(400);
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
      } catch(err) {}
      expect(JSON.parse(res.response.body)).toEqual({
        error: 'Search term is not valid'
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
