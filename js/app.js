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
// Build menu for both local system and GitHub Pages
async function buildMenu() {
    const nav = document.querySelector("nav");
    let files;

    // Determine if running on GitHub Pages
    const isGitHubPages = window.location.hostname.endsWith("github.io");

    try {
        if (isGitHubPages) {
            // GitHub Pages: Use GitHub API to fetch files
            const repo = "Single-Page-App";  // Dein Repository Name
            const user = "tehes";  // Dein GitHub Username
            const apiURL = `https://api.github.com/repos/${user}/${repo}/contents/${directory}`;

            const response = await fetch(apiURL);
            if (!response.ok) {
                throw new Error("Failed to fetch repository contents");
            }

            files = await response.json();
            files = files.map(file => file.name);
        } else {
            // Local system: Fetch files from local directory
            const response = await fetch(`${directory}/`);
            if (!response.ok) {
                throw new Error("Failed to fetch directory contents");
            }

            const data = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(data, "text/html");
            files = Array.from(doc.querySelectorAll("a"))
                .map(link => link.getAttribute("href"))
                .filter(file => {
                    return file !== "/" && file !== `/${directory}`;
                });
        }

        // Process the files and build the menu
        files.forEach(file => {
            let cleanFileName = file.replace(`/${directory}/`, "").split(".")[0];
            fileType = file.split(".")[1];

            // Exclude .htaccess file based on fileType
            if (fileType === "htaccess") return;

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