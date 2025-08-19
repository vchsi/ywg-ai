function postData(url = '', data = {}) {
     // Default options are marked with *
     return fetch(url, {
         method: 'POST', // *GET, POST, PUT, DELETE, etc.
         mode: 'cors', // no-cors, *cors, same-origin
         cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
         credentials: 'same-origin', // include, *same-origin, omit
         headers: {
             'Content-Type': 'application/json'
             // 'Content-Type': 'application/x-www-form-urlencoded',
         },
         redirect: 'follow', // manual, *follow, error
         referrerPolicy: 'no-referrer', // no-referrer, *client
         body: JSON.stringify(data) // body data type must match "Content-Type" header
     })
     .then(response => response.json()); // parses JSON response into native JavaScript objects
 }

 // get cookie
function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}
function deleteAllCookies() {
  document.cookie.split(';').forEach(cookie => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
  });
}