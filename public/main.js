let downvote = document.getElementsByClassName("fa-chevron-down");
let upvote = document.getElementsByClassName("fa-chevron-up");
let trash = document.getElementsByClassName("fa-trash");
let reply = document.getElementsByClassName("reply");
let toggleLD = document.querySelector(".toggleLD");



Array.from(upvote).forEach(function(element) {
  element.addEventListener('click', function(){

    const _id = this.parentNode.parentNode.childNodes[11].dataset.id
    console.log(_id);
    const msg = this.parentNode.parentNode.childNodes[3].innerText;
    let vote = parseFloat(this.parentNode.parentNode.childNodes[5].innerText) +1;

    fetch('/vote', {
      method: 'put',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        '_id': _id,
        'msg': msg,
        'vote':vote
      })
    })
    .then(response => {
      if (response.ok) return response.json()
    })
    .then(data => {
      console.log(data)
      window.location.reload(true)
    })
  });
});

Array.from(downvote).forEach(function(element) {
  element.addEventListener('click', function(){
    const _id = this.parentNode.parentNode.childNodes[11].dataset.id;

    fetch('/downvote', {
      method: 'put',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        '_id': _id

      })
    })
    .then(response => {
      if (response.ok) return response.json()
    })
    .then(data => {
      console.log(data)
      window.location.reload(true)
    })
  });
});

Array.from(trash).forEach(function(element) {
  element.addEventListener('click', function(e){
    e.preventDefault()

    const _id = this.parentNode.parentNode.childNodes[11].dataset.id
    const msg = this.parentNode.parentNode.childNodes[3].innerText
    fetch('messages', {
      method: 'delete',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        '_id': _id,
        'msg': msg
      })
    }).then(function (response) {
      window.location.reload()
    })
  });
});


toggleLD.addEventListener('click', () => {
    fullscreen.classList.toggleLD("light");
})
