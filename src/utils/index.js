const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

exports.isValidQuery = q => {
  return (q!==null && q!==undefined && q.length>0);
};

exports.sanitizeSearchQuery = q => {
  return q.toLowerCase();
};

exports.getJSONFromCSVFile = async (fname) => {
  let returnObj = {}
  return new Promise((resolve, reject) => {
    fs.createReadStream(path.resolve(__dirname, fname))
    .pipe(csv())
    .on('data', (data) => {
      returnObj[data.filename] = data.URL;
    })
    .on('error', reject)
    .on('end', () => resolve(returnObj));
  });
};

exports.processSolrResults = async (docs) => {
  const urlMap = await this.getJSONFromCSVFile('url_mapping.csv');
  return docs.map(doc => {
    const last = (arr) => arr[arr.length-1];

    const title = this.isValidQuery(doc.title) ? doc.title : ['N/A'];
    const url = this.isValidQuery(doc.og_url) ? doc.og_url : [urlMap[last(doc.id.split('/'))]];
    const description = this.isValidQuery(doc.og_description) ? doc.og_description : ['N/A'];
    const id = this.isValidQuery(doc.id) ? [doc.id] : ['N/A'];

    return {
      title: title[0],
      url: url[0],
      id: id[0],
      description: description[0]
    }
  })
};

exports.getSolrSortQueryValue = (algorithm) => {
  return ((algorithm==='lucene') ? 'score desc' : 'pagerank desc');
}
