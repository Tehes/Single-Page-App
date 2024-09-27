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
    user: window.location.hostname.split(".")[0],
    repo: window.location.pathname.split("/")[1],
    isGitHubPages: window.location.hostname.endsWith("github.io")
};

/* --------------------------------------------------------------------------------------------------
Variables
---------------------------------------------------------------------------------------------------*/
let fileType;
let files = [];
const fileCache = new Map();
const contentElement = document.querySelector("main");

/* --------------------------------------------------------------------------------------------------
Utility functions
---------------------------------------------------------------------------------------------------*/
async function fetchFile(url) {
    // Check if the file is already in the cache
    if (fileCache.has(url)) {
        console.log(`Serving ${url} from cache.`);
        return fileCache.get(url).clone();  // Return a clone of the cached response
    }

    // File is not in the cache, so fetch it from the network
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error: ${response.status} (${response.statusText}) when trying to fetch ${url}`);
    }

    // Store the response in the cache
    fileCache.set(url, response.clone());  // Use response.clone() since Response objects can only be read once
    return response;
}

function extractFileType(file) {
    return file.split(".")[1];
}

function isValidFileType(fileType) {
    return fileType !== "htaccess";
}

function removePrefix(fileName) {
    return fileName.replace(/^\d+_/, "");
}

function getCleanFileName(file) {
    return removePrefix(file.replace(`/${config.directory}/`, "").split(".")[0]);
}

/* --------------------------------------------------------------------------------------------------
Main functions
---------------------------------------------------------------------------------------------------*/
async function buildMenu() {
    const nav = document.querySelector("nav");

    try {
        const apiURL = config.isGitHubPages 
            ? `https://api.github.com/repos/${config.user}/${config.repo}/contents/${config.directory}` 
            : `${config.directory}/`;

        const response = await fetchFile(apiURL);
        if (config.isGitHubPages) {
            files = (await response.json()).map(file => file.name).sort();
        } else {
            const data = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(data, "text/html");
            files = Array.from(doc.querySelectorAll("a"))
                .map(link => link.getAttribute("href").replace(`/${config.directory}/`, ""))
                .filter(file => file !== "/" && file !== `/${config.directory}`)
                .sort();
        }

        files.forEach(file => {
            const cleanFileName = file.split(".")[0];
            const fileType = extractFileType(file);

            if (!isValidFileType(fileType)) return;

            const linkText = removePrefix(cleanFileName);

            const link = document.createElement("a");
            link.href = `#${linkText}`;
            link.textContent = linkText;
            if (fileType !== config.standardFileType) {
                link.setAttribute("data-file-type", fileType);
            }
            nav.appendChild(link);
        });

        router();
    } catch (error) {
        console.error("Error fetching directory contents:", error);
    }
}

async function router() {
    const hash = location.hash.substring(1) || config.startingPageName;

    const matchingFile = files.find(file => getCleanFileName(file) === hash);

    if (!matchingFile) {
        console.error(`No file matching the hash "${hash}" found in files:`, files);
        return;
    }

    fileType = extractFileType(matchingFile);

    try {
        const response = await fetchFile(`${config.directory}/${matchingFile}`);
        const data = fileType === "json" ? await response.json() : await response.text();

        contentElement.innerHTML = "";
        if (fileType === "json") {
            const templateData = renderTemplate(data);
            contentElement.appendChild(templateData);
        } else if (fileType === "txt") {
            contentElement.innerHTML = parseMd(data).content;
        } else {
            contentElement.innerHTML = data;
        }
    } catch (error) {
        contentElement.innerHTML = "";
        contentElement.appendChild(
            document.createTextNode(`Error: ${error.message}`)
        );
    }
}

/* --------------------------------------------------------------------------------------------------
Helper functions
---------------------------------------------------------------------------------------------------*/
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
    window.addEventListener("DOMContentLoaded", buildMenu, false);
    document.addEventListener("click", checkFileType, false);
}

window.app = {
    init
};

window.app.init();