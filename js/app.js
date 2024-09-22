/* --------------------------------------------------------------------------------------------------
Imports
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
let files = [];  // Global files array to store the filenames with prefix
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

function removePrefix(fileName) {
    // Remove the number prefix like "01_", "02_", etc.
    return fileName.replace(/^\d+_/, "");
}

/* --------------------------------------------------------------------------------------------------
Main functions
---------------------------------------------------------------------------------------------------*/
async function buildMenu() {
    const nav = document.querySelector("nav");
    const isGitHubPages = window.location.hostname.endsWith("github.io");

    try {
        if (isGitHubPages) {
            const apiURL = `https://api.github.com/repos/${config.user}/${config.repo}/contents/${config.directory}`;
            const response = await fetchFile(apiURL);
            files = await response.json();  // Store file names globally
            files = files.map(file => file.name).sort();  // Store only filenames (not full paths)
        } else {
            const response = await fetchFile(`${config.directory}/`);
            const data = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(data, "text/html");
            files = Array.from(doc.querySelectorAll("a"))
                .map(link => link.getAttribute("href").replace(`/${config.directory}/`, ""))  // Remove content directory from path
                .filter(file => file !== "/" && file !== `/${config.directory}`)
                .sort();  // Sort files alphabetically based on the prefix
        }

        // Build menu
        files.forEach(file => {
            const cleanFileName = file.split(".")[0];  // Remove extension
            fileType = extractFileType(file);

            if (!isValidFileType(fileType)) return;

            // Remove the numeric prefix for the link text
            const linkText = removePrefix(cleanFileName);

            const link = document.createElement("a");
            link.href = `#${linkText}`;  // Use the cleaned name for the URL fragment
            link.textContent = linkText;  // Use the cleaned name for the link text
            if (fileType !== config.standardFileType) {
                link.setAttribute("data-file-type", fileType);
            }
            nav.appendChild(link);
        });
    } catch (error) {
        console.error("Error fetching directory contents:", error);
    }
}

// Router function
function router() {
    const hash = location.hash.substring(1) || config.startingPageName;

    // Find the matching file based on the hash (after removing prefix)
    let matchingFile = files.find(file => {
        const cleanFileName = removePrefix(file.replace(`/${config.directory}/`, "").split(".")[0]);
        return cleanFileName === hash;
    });
    console.log(files);

    if (!matchingFile) {
        console.error(`No file matching the hash "${hash}" found.`);
        return;
    }

    // Extract the file type (e.g. html, json, txt) from the matching file
    fileType = extractFileType(matchingFile);

    // Fetch the correct file using the full filename (with prefix)
    fetchFile(`${config.directory}/${matchingFile}`)
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