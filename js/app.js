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
    function parseMd(md) {

        //ul
        md = md.replace(/^\s*\n\*/gm, '<ul>\n*');
        md = md.replace(/^(\*.+)\s*\n([^\*])/gm, '$1\n</ul>\n\n$2');
        md = md.replace(/^\*(.+)/gm, '<li>$1</li>');

        //ol
        md = md.replace(/^\s*\n\d\./gm, '<ol>\n1.');
        md = md.replace(/^(\d\..+)\s*\n([^\d\.])/gm, '$1\n</ol>\n\n$2');
        md = md.replace(/^\d\.(.+)/gm, '<li>$1</li>');

        //blockquote
        md = md.replace(/^\>(.+)/gm, '<blockquote>$1</blockquote>');

        //h
        md = md.replace(/[\#]{6}(.+)/g, '<h6>$1</h6>');
        md = md.replace(/[\#]{5}(.+)/g, '<h5>$1</h5>');
        md = md.replace(/[\#]{4}(.+)/g, '<h4>$1</h4>');
        md = md.replace(/[\#]{3}(.+)/g, '<h3>$1</h3>');
        md = md.replace(/[\#]{2}(.+)/g, '<h2>$1</h2>');
        md = md.replace(/[\#]{1}(.+)/g, '<h1>$1</h1>');

        //alt h
        md = md.replace(/^(.+)\n\=+/gm, '<h1>$1</h1>');
        md = md.replace(/^(.+)\n\-+/gm, '<h2>$1</h2>');

        //images
        md = md.replace(/\!\[([^\]]+)\]\(([^\)]+)\)/g, '<img src="$2" alt="$1" />');

        //links
        md = md.replace(/[\[]{1}([^\]]+)[\]]{1}[\(]{1}([^\)\"]+)(\"(.+)\")?[\)]{1}/g, '<a href="$2" title="$4">$1</a>');

        //font styles
        md = md.replace(/[\*\_]{2}([^\*\_]+)[\*\_]{2}/g, '<b>$1</b>');
        md = md.replace(/[\*\_]{1}([^\*\_]+)[\*\_]{1}/g, '<i>$1</i>');
        md = md.replace(/[\~]{2}([^\~]+)[\~]{2}/g, '<del>$1</del>');

        //pre
        md = md.replace(/^\s*\n\`\`\`(([^\s]+))?/gm, '<pre class="$2">');
        md = md.replace(/^\`\`\`\s*\n/gm, '</pre>\n\n');

        //code
        md = md.replace(/[\`]{1}([^\`]+)[\`]{1}/g, '<code>$1</code>');

        //p
        md = md.replace(/^\s*(\n)?(.+)/gm, function(m) {
            return /\<(\/)?(h\d|ul|ol|li|blockquote|pre|img)/.test(m) ? m : '<p>' + m + '</p>';
        });

        //strip p from pre
        md = md.replace(/(\<pre.+\>)\s*\n\<p\>(.+)\<\/p\>/gm, '$1$2');

        return md;

    }

    function router() {
        var hash = location.hash.substring(1) || startingPageName;
        fileType = fileType || standardFileType;

        fetch(directory + "/" + hash + "." + fileType)
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
                else if (fileType === "txt") {
                    contentElement.innerHTML = parseMd(data);
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
        for (var i = 0; i < data.products.length; i++) {
            var listItem = document.createElement('li');
            listItem.innerHTML = '<strong>' + data.products[i].Name + '</strong>';
            listItem.innerHTML += ' can be found in ' + data.products[i].Location + '.';
            listItem.innerHTML += ' Cost: <strong>£' + data.products[i].Price + '</strong>';
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
