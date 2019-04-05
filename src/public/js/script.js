document.getElementById('searchbar').addEventListener('change', () => {
  const submitBtn = document.getElementById('submit-btn');
  const searchQuery = document.getElementById('searchbar').value;
  if(searchQuery!==null && searchQuery!==undefined && searchQuery.length>0) {
    submitBtn.disabled = false;
  } else {
    submitBtn.disabled = true;
  }
})

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
  let searchQuery = document.getElementById('searchbar').value;
  if(searchQuery!==null && searchQuery!==undefined && searchQuery.length>0) {
    searchQuery = searchQuery.toLowerCase();

    const response = await fetch(`/search?q=${searchQuery}&algorithm=${getSelectedAlgorithm()}`);
    const results = await response.json();

    let newsArticlesList = document.getElementById('news-results');
    let newsArticleListInnerHTML = '';
    results.map(doc => {
      newsArticleListInnerHTML += createNewsArticle(doc);
    });
    newsArticlesList.innerHTML = newsArticleListInnerHTML;
  }
});

function getSelectedAlgorithm() {
  const radios = document.forms.searchQueryForm.elements['algorithmRadios'];
  for(let i=0; i<radios.length; ++i) {
    if(radios[i].checked) return radios[i].value;
  }
  return null;
}

function createNewsArticle(doc) {
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
      <p class="lead">${doc.description}</p>
  </div>
  `;
  return newsArticleComponentString;
}
