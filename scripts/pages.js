const path = require('path');
const fs = require('fs');

const fetch = require('node-fetch');

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_PAGE_VIEW = process.env.AIRTABLE_PAGE_VIEW;

const API_VIEW_ENDPOINT = `https://api.airtable.com/v0/${AIRTABLE_PAGE_VIEW}/Pages?api_key=${AIRTABLE_API_KEY}`;



const targetDestination = path.resolve(__dirname, "../content/alternative_pages/");

// Clean up files
const removeOldFiles = (targetDestination) => {
    fs.readdir(targetDestination, (err, files) => {
        if (err) throw err;

        for (const file of files) {
            fs.unlink(path.join(targetDestination, file), err => {
                if (err) throw err;
            });
        }
    });
}

const getMarkdownTemplate = (title, url, category, description) => {
return `---
type: alternative_pages
layout: alternative_pages
url: ${url || ''} 
title: ${title || ''} 
category: ${category || ''} 
description: ${description || ''} 
---
`.replace("    ", "");
};

const getFileName = (slug) => {

    if (slug && slug.startsWith("/")) {
        return `${slug.slice(1)}.md`;
    }
    return `${slug}.md`;
}


fetch(API_VIEW_ENDPOINT)
    .then(res => res.json())
    .then(json => {
        if (!json.records) return;

        removeOldFiles(targetDestination);

        json.records.map(record => {

            const slug = record.fields.Slug;
            const name = record.fields.Name;
            const category = record.fields.Category;
            const description = record.fields.SeoDescription;
            const fileName = getFileName(slug);
            const filePath = path.resolve(targetDestination, fileName);

            if (slug && name && category && category === "Alternative Pages") {
                console.log(slug, name, fileName, filePath);
                console.log("----------");
                    const markdownContent = getMarkdownTemplate(name, slug, category, description);
                    console.log(filePath);

                    fs.writeFile(filePath, markdownContent, function (err) {
                        if (err) throw err;
                        console.log('File is created successfully.');
                    });
                    
            }
        })
    });
