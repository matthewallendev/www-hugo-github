const path = require('path');
const fs = require('fs');

const yaml = require('js-yaml');
const fetch = require('node-fetch');

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_PAGE_VIEW = process.env.AIRTABLE_PAGE_VIEW;

const targetContentDestination = path.resolve(__dirname, "../content/alternative_pages/");
const targetDataDestination = path.resolve(__dirname, "../data/alternative_pages/");

const getTableDataEndpoint = (Table) => {
    return `https://api.airtable.com/v0/${AIRTABLE_PAGE_VIEW}/${Table}?api_key=${AIRTABLE_API_KEY}`
}

const removeOldFiles = (targetContentDestination) => {
    fs.readdir(targetContentDestination, (err, files) => {
        if (err) throw err;

        for (const file of files) {
            fs.unlinkSync(path.join(targetContentDestination, file));
        }
    });
}

// Fill  up data into markdown schema
const getMarkdownTemplate = (title, url, category, description) => {
    return `---
        type: alternative_pages
        layout: alternative_pages
        url: ${url || ''} 
        title: ${title || ''} 
        category: ${category || ''} 
        description: ${description || ''} 
        ---`.split("    ").join("");
};

const getFileName = (slug, ext) => {

    if (slug && slug.startsWith("/")) {
        return `${slug.slice(1)}.${ext}`;
    }
    return `${slug}.${ext}`;
}

async function getResponse(url) {
    return await fetch(url)
        .then(res => res.json())
}

const fileNameFormat = (value) => {
    if(value){
        return value.split("-").join("_");
    }
}

const createFiles = async () => {

    let alternativePages = {};

    const responsePage = await getResponse(getTableDataEndpoint('Pages'));
    if (!responsePage.records) return;
    console.log("step 1")

    responsePage.records.map(record => {
        // //console.log("step 2");

        const slug = record.fields.Slug;
        const name = record.fields.Name;
        const category = record.fields.Category;
        const description = record.fields.SeoDescription;
        const fileName = getFileName(fileNameFormat(slug), "md");
        const filePath = path.resolve(targetContentDestination, fileName);

        if (slug && category === "Alternative Pages") {

            const markdownContent = getMarkdownTemplate(name, slug, category, description);
            // //console.log(filePath);

            fs.writeFile(filePath, markdownContent, (err) => {
                if (err) throw err;
                // //console.log('File is created successfully.');
            });

            // console.log("record.id", record.id);

            alternativePages[record.id] = {slug: slug};

        }
    });

    const responseBlocks = await getResponse(getTableDataEndpoint('Blocks'));
    if (!responseBlocks.records) return;
    console.log("step 2");

    // console.log(alternativePages);

    if(responseBlocks.records){
        responseBlocks.records.map(record => {
            // console.log("record", record.fields);
            if(record.fields && record.fields.Pages && record.fields.Pages.length){
                // console.log('record.fields.Pages :>> ', record.fields.Pages);
                const pageID = record.fields.Pages[0];
                // console.log('pageID :>> ', pageID);

                // check the block is belong one of the 
                const alternativePageIDs = Object.keys(alternativePages);
                if(alternativePageIDs.includes(pageID)){
                    if(!alternativePages[`${pageID}`].blocks){
                        alternativePages[`${pageID}`].blocks = [];
                    }
                    alternativePages[pageID].blocks.push(record.fields)
                    
                    // console.log(record.fields);
                    // console.log("---")
                }

            }
        })

        // // object is ready, we can create yml files
        console.log('alternativePages :>> ', alternativePages);
        
        Object.keys(alternativePages).map(pageID => {
            console.log(alternativePages[`${pageID}`].blocks)
        });

        // let data = {
        //     sections: {
        //         enable: true,
        //         item: []
        //     }
        // };
        // let yamlStr = yaml.safeDump(data);
        // console.log(yamlStr);
    }

}

removeOldFiles(targetContentDestination);
const response = createFiles();
//console.log(response);


//console.log(getTableDataEndpoint('Pages'));