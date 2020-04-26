var downvote = document.getElementsByClassName("fa-chevron-down");
var upvote = document.getElementsByClassName("fa-chevron-up");
var trash = document.getElementsByClassName("fa-trash");
var reply = document.getElementsByClassName("reply");




Array.from(upvote).forEach(function(element) {
  element.addEventListener('click', function(){

    const _id = this.parentNode.parentNode.childNodes[1].innerText;
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
    const _id = this.parentNode.parentNode.childNodes[1].innerText;

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
  element.addEventListener('click', function(){
    const _id = this.parentNode.parentNode.childNodes[1].innerText
    const msg = this.parentNode.parentNode.childNodes[3].innerText
    fetch('comments', {
      method: 'delete',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        '_id': _id,
        'msg': msg
      })
    }).then(function (response) {
      window.location.reload() //take the response and reload the page
    })
  });
});
