document.getElementById('searchbar').addEventListener('input', async (event) => {
  const submitBtn = document.getElementById('submit-btn');
  const searchQuery = event.target.value;
  if(searchQuery!==null && searchQuery!==undefined && searchQuery.length>0) {
    submitBtn.disabled = false;
  } else {
    submitBtn.disabled = true;
  }
  const prefix = (arr) => arr.slice(0, arr.length-1).join(' ');
  const last = (arr) => arr[arr.length-1];
  const queryTerms = searchQuery.split(' ');
  const lastQueryTerm = last(queryTerms);

  if(lastQueryTerm!==undefined && lastQueryTerm.length>0) {
    const response = await fetch(`/suggest?q=${lastQueryTerm}`);
    const results = await response.json();
    const suggestions = results.suggestions;
    let suggestionsHTML = '';
    suggestions && suggestions.forEach(suggestion => {
      suggestionsHTML += createSuggestionItem(suggestion, prefix(queryTerms));
    });
    let autocomplete = document.getElementById('autocomplete-list');
    autocomplete.innerHTML = suggestionsHTML;
  }
});

document.body.addEventListener('click', () => {
  document.getElementById('autocomplete-list').innerHTML = '';
});

let prev = document.getElementById('lucene');
document.forms.searchQueryForm.addEventListener('change', (event) => {
  if(event.target.name === 'algorithmRadios') {
    prev.checked = false;
    event.target.checked = true;
    prev = event.target;
  }
});

document.forms.searchQueryForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const query = document.getElementById('searchbar').value;
  await fetchNewsResults(query);
  document.getElementById('autocomplete-list').innerHTML = '';
});

document.addEventListener('click', (element) => {
  if (element.target.className.indexOf('suggestion-item')!==-1) {
    const searchQuery = element.target.innerHTML.trim();
    document.getElementById('searchbar').value = searchQuery;
    document.getElementById('autocomplete-list').innerHTML = '';
  }
});

function getSelectedAlgorithm() {
  const radios = document.forms.searchQueryForm.elements['algorithmRadios'];
  for(let i=0; i<radios.length; ++i) {
    if(radios[i].checked) return radios[i].value;
  }
  return null;
}

function createNewsArticle(doc, searchQuery) {
  let snippet = doc.snippet;
  searchQuery.split(' ').forEach(query => {
    const regEx = new RegExp(query, "ig");
    if(snippet.match(regEx)!==null) {
      const emphasizedQueryTerm = `<strong>${snippet.match(regEx)[0]}</strong>`;
      snippet = snippet.replace(regEx, emphasizedQueryTerm);
    }
  });

  let newsArticleComponentString =
  `
  <div class="list-group-item flex-column align-items-start">
      <div class="d-flex w-100 justify-content-between">
        <a href="${doc.url}" target="_blank"><h5 class="mb-1">${doc.title}</h5></a>
      </div>
      <div class="row">
          <div class="col-12">
              <a href="${doc.url}" target="_blank"><small>${doc.url}</small></a>
          </div>
          <div class="col-12">
              ID: <small class="text-muted">${doc.id}</small>
          </div>
      </div>
      <p>${snippet}</p>
  </div>
  `;
  return newsArticleComponentString;
}

function createSuggestionItem(suggestion, prefix) {
  let suggestionItem =
  `
    <a class='suggestion-item list-group-item list-group-item-action'>
      ${prefix} ${suggestion}
    </a>
  `;
  return suggestionItem;
}

async function fetchNewsResults(searchQuery, spellCheck = true) {
  if(searchQuery!==null && searchQuery!==undefined && searchQuery.length>0) {
    searchQuery = searchQuery.toLowerCase();

    let spinner = document.getElementsByClassName('spinner-border')[0];

    spinner.style.visibility = 'visible';
    const url =
      `/search?q=${searchQuery}&algorithm=${getSelectedAlgorithm()}&spellCheck=${spellCheck}`;
    const response = await fetch(url);
    const results = await response.json();
    spinner.style.visibility = 'hidden';

    const original_query = results.original_query;
    const corrected_query = results.corrected_query;
    const docs = results.docs;

    let spellCheckDiv = document.getElementById('spell-check-div');
    spellCheckDiv.innerHTML = '';
    if(original_query !== corrected_query) {
      spellCheckDiv.innerHTML =
      `
      <h6>
        Showing results for <span id='correct-query'>${corrected_query}</span></br>
        <small>Search instead for
          <a onclick='fetchNewsResults("${original_query}", false)'>
            <span id='original-query'>${original_query}</span>
          </a>
        </small>
      </h6>
      `;
    }

    let newsArticlesList = document.getElementById('news-results');
    let newsArticleListInnerHTML = '';
    if(docs!==undefined && docs.length>0) {
      docs.map(doc => {
        newsArticleListInnerHTML += createNewsArticle(doc, corrected_query);
      });
    } else {
      newsArticleListInnerHTML =
        `
          <div class="alert alert-dark" role="alert">
            No articles found
          </div>
        `;
    }
    newsArticlesList.innerHTML = newsArticleListInnerHTML;
  }
}
