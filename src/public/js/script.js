document.getElementById('searchbar').addEventListener('focus', (event) => {
  const submitBtn = document.getElementById('submit-btn');
  submitBtn.disabled = false;
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

      const response = await fetch(`/search?q=${searchQuery}`);
      const results = await response.json();
      console.log(results);
  }
});

function getSelectedAlgorithm(form, name) {
  const radios = form.elements[name];
  for(let i=0; i<radios.length; ++i) {
    if(radios[i].checked) return radios[i].value;
  }
  return null;
}
