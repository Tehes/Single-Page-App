var app = (function() {
    /* --------------------------------------------------------------------------------------------------
    Variables
    ---------------------------------------------------------------------------------------------------*/
    var startingPageName = "home";
    var fileType;
    var standardFileType = "html";
    var directory = "content";
    var contentElement = document.querySelector("main");

    /* --------------------------------------------------------------------------------------------------
    functions
    ---------------------------------------------------------------------------------------------------*/
    function router() {
      var hash = location.hash.substring(1) || startingPageName;
      if (!fileType) {
        fileType = standardFileType;
      }

      fetch(directory+"/"+hash+"."+fileType)
        .then(function(response) {
          if (!response.ok) {
            throw new Error("HTTP error, status = " + response.status);
          }
          if (fileType === "json") {
              return response.json();
          }
          else {
            return response.text();
          }
        })
        .then(function(data) {
          contentElement.innerHTML = "";

          if (fileType === "json") {
            var templateData = renderTemplate(data);
            contentElement.appendChild(templateData);
          }
          else {
              contentElement.innerHTML = data;
          }
        })
        .catch(function(error) {
          contentElement.innerHTML = '';
          contentElement.appendChild(
            document.createTextNode('Error: ' + error.message)
          );
        });
    }

    function renderTemplate(data) {
      var list = document.createElement("ul");
        for(var i = 0; i < data.products.length; i++) {
          var listItem = document.createElement('li');
          listItem.innerHTML = '<strong>' + data.products[i].Name + '</strong>';
          listItem.innerHTML +=' can be found in ' + data.products[i].Location + '.';
          listItem.innerHTML +=' Cost: <strong>£' + data.products[i].Price + '</strong>';
          list.appendChild(listItem);
        }
		var list2 = document.createElement("ul");
		var list2Item = "";
		for (var i = 0; i < data.products.length; i++) {
			list2Item += `
			<li>
				<strong>${data.products[i].Name}</strong>
				can be found in ${data.products[i].Location}. 
				Cost: <strong>£ ${data.products[i].Price}</strong>
			</li>
			`;
		}
		list2.innerHTML = list2Item;
      return list2;
    }

    function checkFileType() {
      fileType = event.target.dataset.fileType || standardFileType;
    }

    function init() {
        document.addEventListener("touchstart", function() {}, false);
        window.addEventListener("hashchange", router, false);
        window.addEventListener("DOMContentLoaded", router, false);
        document.addEventListener("click", checkFileType, false);
    }

    /* --------------------------------------------------------------------------------------------------
    public members, exposed with return statement
    ---------------------------------------------------------------------------------------------------*/
    return {
        init: init
    };

})();

app.init();
