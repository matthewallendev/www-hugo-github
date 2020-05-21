const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
console.log(AIRTABLE_API_KEY);

const AIRTABLE_PAGE_VIEW = process.env.AIRTABLE_PAGE_VIEW;
console.log(AIRTABLE_PAGE_VIEW);



console.log("https://api.airtable.com/v0/"+AIRTABLE_PAGE_VIEW+"/Pages?api_key="+AIRTABLE_API_KEY)