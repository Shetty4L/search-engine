const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const request = require('request-promise-native');
const htmlParser = require('fast-html-parser');
const cheerio = require('cheerio');
const nWords = require('./spell_model.json');
const client = {
  host: 'localhost',
  port: '8983',
  core: 'csci572-hw4'
};

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

exports.getHTMLDOMFromUrl = async (fname) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path.resolve(__dirname, fname), (err, data) => {
      if (err) throw reject(err);
      resolve(htmlParser.parse(cheerio.load(data).html()));
    });
  });
}

exports.getSentencesFromDOM = (DOM) => {
  const processHTML = (text) => text.trim();
  const p = DOM.querySelectorAll('p').map(element => processHTML(element.structuredText));
  const li = DOM.querySelectorAll('li').map(element => processHTML(element.structuredText));
  return p.concat(li);
}

exports.querySolr = async (route, query) => {
  const url = `http://${client.host}:${client.port}/solr/${client.core}/${route}?${query}`;
  try {
    const result = await request.get(url);
    return JSON.parse(result);
  } catch(err) {
    return new Error('error fetching data from Solr');
  }
};

exports.processSolrSearchResults = async (docs, query) => {
  const urlMap = await this.getJSONFromCSVFile('url_mapping.csv');
  let urlTextMap = {};
  return Promise.all(docs.map(async (doc) => {
    const last = (arr) => arr[arr.length-1];

    const title = this.isValidQuery(doc.title) ? doc.title : ['N/A'];
    const url = this.isValidQuery(doc.og_url) ? doc.og_url : [urlMap[last(doc.id.split('/'))]];
    const description = this.isValidQuery(doc.og_description) ? doc.og_description : [''];
    const id = this.isValidQuery(doc.id) ? [last(doc.id.split('/'))] : ['N/A'];

    let DOM;
    if(urlTextMap.hasOwnProperty(url[0])) {
      DOM = urlTextMap[url[0]];
    } else DOM = await this.getHTMLDOMFromUrl(`./data/${id[0]}`);
    const sentences = this.getSentencesFromDOM(DOM);
    const snippet = this.generateSnippet(sentences, query);

    return {
      title: title[0],
      url: url[0],
      id: id[0],
      description: description[0],
      snippet: (snippet.length>0 ? snippet : description[0])
    }
  }));
};

exports.getSolrSortQueryValue = (algorithm) => {
  return ((algorithm==='lucene') ? 'score desc' : 'pagerank desc');
};

exports.correctSpelling = (word) => {
  if (nWords.hasOwnProperty(word)) return word;
	let candidates = {}, list = edits(word);
	list.forEach((edit) => {
		if (nWords.hasOwnProperty(edit)) candidates[nWords[edit]] = edit;
	});
	if (countKeys(candidates) > 0) return candidates[max(candidates)];
	list.forEach((edit) => {
		edits(edit).forEach(function (w) {
			if (nWords.hasOwnProperty(w)) candidates[nWords[w]] = w;
		});
	});
	return countKeys(candidates) > 0 ? candidates[max(candidates)] : word;
}

const edits = (word) => {
  const letters = "abcdefghijklmnopqrstuvwxyz".split("");
  let results = [];
	// deletion
	for (let i=0; i < word.length; i++)
    results.push(word.slice(0, i) + word.slice(i+1));
	// transposition
	for (let i=0; i < word.length-1; i++)
      results.push(word.slice(0, i) + word.slice(i+1, i+2) + word.slice(i, i+1) + word.slice(i+2));
	// alteration
	for (let i=0; i < word.length; i++) {
    letters.forEach(letter => {
      results.push(word.slice(0, i) + letter + word.slice(i+1));
    });
  }
	// insertion
	for (let i=0; i <= word.length; i++) {
    letters.forEach(letter => {
      results.push(word.slice(0, i) + letter + word.slice(i));
    });
  }
	return results;
}

const countKeys = (object) => {
	return Object.keys(object).length;
}

const max = (candidates) => {
  let arr = [];
	for (let candidate in candidates) {
    if (candidates.hasOwnProperty(candidate)) {
      arr.push(candidate);
    }
  }
	return Math.max.apply(null, arr);
}

exports.generateSnippet = (sentences, query) => {
  const processExtractedSnippet = (snippet, query) => {
    const timestampPattern = /[0-9]{1,2}\.[0-9]{2}(a|p)m [A-Z]{3} [0-9]{2}:[0-9]{2}/;
    snippet = snippet.replace(timestampPattern, '').trim();
    const queryPosition = snippet.toLowerCase().indexOf(query);
    if(snippet.length > 160) {
      if(queryPosition+query.length < 160) {
        const extractedSnippet = snippet.substring(0, 160);
        const extractedSnippetArr = extractedSnippet.split(' ');
        const finalSnippetText =  extractedSnippetArr.slice(0,extractedSnippetArr.length-1).join(' ');
        return `${finalSnippetText} ...`;
      } else {
        const extractedSnippet = snippet.substring(queryPosition-80, queryPosition+query.length+80);
        const extractedSnippetArr = extractedSnippet.split(' ');
        const finalSnippetText =  extractedSnippetArr.slice(1,extractedSnippetArr.length).join(' ');
        return (
          finalSnippetText[finalSnippetText.length-1] === '.' ?
          `... ${finalSnippetText}` :
          `... ${finalSnippetText} ...`
        );
      }
    }
    return snippet;
  };

  const getSnippetFromCandidates = (results, query) => {
    for(let result of results) {
      if(result!==undefined && result.length>0 && result.toLowerCase().indexOf(query)!==-1) {
        return processExtractedSnippet(result, query);
      }
    }
    return '';
  }

  const queryTerms = query.split(' ');

  if(queryTerms.length===1) {
    const result = sentences.filter(sentence => sentence.toLowerCase().indexOf(query)!==-1);
    return getSnippetFromCandidates(result, query);
  } else {
    const result1 = sentences.filter(sentence => sentence.toLowerCase().indexOf(query)!==-1);
    if(result1!==undefined && result1.length>0) {
      return getSnippetFromCandidates(result1, query);
    }

    const result2 = sentences.filter(sentence => {
      return queryTerms.every(term => sentence.toLowerCase().indexOf(term)!==-1)
    });
    if(result2!==undefined && result2.length>0) {
      return getSnippetFromCandidates(result2, queryTerms[0]);
    }

    const result3 = sentences.filter(sentence => {
      return queryTerms.some(term => sentence.toLowerCase().indexOf(term)!==-1)
    });
    if(result3!==undefined && result3.length>0) {
      return getSnippetFromCandidates(result3, queryTerms[0]);
    }

    return '';
  }
}
