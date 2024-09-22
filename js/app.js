/* --------------------------------------------------------------------------------------------------
IMPORTS
---------------------------------------------------------------------------------------------------*/
import { parseMd } from "../libs/parseMD/parseMD.js";

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
async function buildMenu() {
    const directory = "content";  // Variable for the directory name

    try {
        const response = await fetch(`${directory}/`);
        if (!response.ok) {
            throw new Error("Failed to fetch directory contents");
        }

        const data = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(data, "text/html");
        const files = Array.from(doc.querySelectorAll("a"))
            .map(link => link.getAttribute("href"))
            .filter(file => {
                // Filter out the parent directory and the directory itself
                return file !== "/" && file !==`/${directory}`;
            });

        const nav = document.querySelector("nav");
        files.forEach(file => {
            let cleanFileName = file.replace(`/${directory}/`, "").split(".")[0]; // Remove directory and file extension
            fileType = file.split(".")[1];

            const link = document.createElement("a");
            link.href = `#${cleanFileName}`;
            link.textContent = cleanFileName;
            if (fileType !== "html") {
                link.setAttribute("data-file-type", fileType);
            } 
            nav.appendChild(link);
        });
    } catch (error) {
        console.error("Error fetching directory contents:", error);
    }
}

function router() {
    var hash = location.hash.substring(1) || startingPageName;
    console.log(hash);
    fileType = fileType || standardFileType;

    fetch(directory + "/" + hash + "." + fileType)
        .then(function (response) {
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
        .then(function (data) {
            contentElement.innerHTML = "";

            if (fileType === "json") {
                var templateData = renderTemplate(data);
                contentElement.appendChild(templateData);
            }
            else if (fileType === "txt") {
                contentElement.innerHTML = parseMd(data).content;
                console.log(parseMd(data).metadata);
            }
            else {
                contentElement.innerHTML = data;
            }
        })
        .catch(function (error) {
            contentElement.innerHTML = "";
            contentElement.appendChild(
                document.createTextNode("Error: " + error.message)
            );
        });
}

function renderTemplate(data) {
    var list = document.createElement("ul");
    for (let i = 0; i < data.products.length; i++) {
        var listItem = document.createElement("li");
        listItem.innerHTML = "<strong>" + data.products[i].Name + "</strong>";
        listItem.innerHTML += " can be found in " + data.products[i].Location + ".";
        listItem.innerHTML += " Cost: <strong>£" + data.products[i].Price + "</strong>";
        list.appendChild(listItem);
    }
    var list2 = document.createElement("ul");
    var list2Item = "";
    for (let i = 0; i < data.products.length; i++) {
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

function checkFileType(ev) {
    fileType = ev.target.dataset.fileType || standardFileType;
}

function init() {
    window.addEventListener("hashchange", router, false);
    window.addEventListener("DOMContentLoaded", function() {
        buildMenu();
        router();
    }, false);
    document.addEventListener("click", checkFileType, false);
}

init();