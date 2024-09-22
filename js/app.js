/* --------------------------------------------------------------------------------------------------
IMPORTS
---------------------------------------------------------------------------------------------------*/
import { parseMd } from "../libs/parseMD/parseMD.js";

/* --------------------------------------------------------------------------------------------------
Configuration
---------------------------------------------------------------------------------------------------*/
const config = {
    startingPageName: "home",
    standardFileType: "html",
    directory: "content",
    repo: "Single-Page-App",  // GitHub repository name
    user: "tehes",            // GitHub username
};

/* --------------------------------------------------------------------------------------------------
Variables
---------------------------------------------------------------------------------------------------*/
let fileType;
const contentElement = document.querySelector("main");

/* --------------------------------------------------------------------------------------------------
Utility functions
---------------------------------------------------------------------------------------------------*/
function fetchFile(url) {
    return fetch(url).then(response => {
        if (!response.ok) {
            throw new Error("HTTP error, status = " + response.status);
        }
        return response;
    });
}

function extractFileType(file) {
    return file.split(".")[1];
}

function isValidFileType(fileType) {
    return fileType !== "htaccess";
}

/* --------------------------------------------------------------------------------------------------
Main functions
---------------------------------------------------------------------------------------------------*/
// Build menu for both local system and GitHub Pages
async function buildMenu() {
    const nav = document.querySelector("nav");
    let files;
    const isGitHubPages = window.location.hostname.endsWith("github.io");

    try {
        if (isGitHubPages) {
            // Fetch files using GitHub API
            const apiURL = `https://api.github.com/repos/${config.user}/${config.repo}/contents/${config.directory}`;
            const response = await fetchFile(apiURL);
            files = await response.json();
            files = files.map(file => file.name);
        } else {
            // Fetch files from local system
            const response = await fetchFile(`${config.directory}/`);
            const data = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(data, "text/html");
            files = Array.from(doc.querySelectorAll("a"))
                .map(link => link.getAttribute("href"))
                .filter(file => file !== "/" && file !== `/${config.directory}`);
        }

        // Build menu
        files.forEach(file => {
            const cleanFileName = file.replace(`/${config.directory}/`, "").split(".")[0];
            fileType = extractFileType(file);

            if (!isValidFileType(fileType)) return;

            const link = document.createElement("a");
            link.href = `#${cleanFileName}`;
            link.textContent = cleanFileName;
            if (fileType !== config.standardFileType) {
                link.setAttribute("data-file-type", fileType);
            }
            nav.appendChild(link);
        });
    } catch (error) {
        console.error("Error fetching directory contents:", error);
    }
}

function router() {
    const hash = location.hash.substring(1) || config.startingPageName;
    fileType = fileType || config.standardFileType;

    fetchFile(`${config.directory}/${hash}.${fileType}`)
        .then(response => (fileType === "json" ? response.json() : response.text()))
        .then(data => {
            contentElement.innerHTML = "";
            if (fileType === "json") {
                const templateData = renderTemplate(data);
                contentElement.appendChild(templateData);
            } else if (fileType === "txt") {
                contentElement.innerHTML = parseMd(data).content;
            } else {
                contentElement.innerHTML = data;
            }
        })
        .catch(error => {
            contentElement.innerHTML = "";
            contentElement.appendChild(
                document.createTextNode("Error: " + error.message)
            );
        });
}

function renderTemplate(data) {
    const list = document.createElement("ul");
    data.products.forEach(product => {
        const listItem = document.createElement("li");
        listItem.innerHTML = `<strong>${product.Name}</strong> can be found in ${product.Location}. Cost: <strong>£${product.Price}</strong>`;
        list.appendChild(listItem);
    });
    return list;
}

function checkFileType(ev) {
    fileType = ev.target.dataset.fileType || config.standardFileType;
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