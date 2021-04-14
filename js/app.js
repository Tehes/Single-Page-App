var app = (function() {
    /* --------------------------------------------------------------------------------------------------
    Variables
    ---------------------------------------------------------------------------------------------------*/
    var startingPageName = "home";
    var fileType = "html";
    var directory = "content";
    var contentElement = document.querySelector("main");

    /* --------------------------------------------------------------------------------------------------
    functions
    ---------------------------------------------------------------------------------------------------*/
    function router() {
      var hash = location.hash.substring(1) || startingPageName;

      fetch(directory+"/"+hash+"."+fileType)
        .then(function(response) {
          if (!response.ok) {
            throw new Error("HTTP error, status = " + response.status);
          }
          return response.text();
        })
        .then(function(text) {
          contentElement.innerHTML = text;
        })
        .catch(function(error) {
          contentElement.innerHTML = '';
          contentElement.appendChild(
            document.createTextNode('Error: ' + error.message)
          );
        });
    }

    function init() {
        document.addEventListener("touchstart", function() {}, false);
        window.addEventListener("hashchange", router, false);
        window.addEventListener("DOMContentLoaded", router, false);
    }

    /* --------------------------------------------------------------------------------------------------
    public members, exposed with return statement
    ---------------------------------------------------------------------------------------------------*/
    return {
        init: init
    };

})();

app.init();
