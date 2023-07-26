const axios = require("axios");
const cheerio = require("cheerio");
require('dotenv').config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

const url = "https://www2.hm.com/en_in/productpage.1099797001.html";

const product = {name: "", price: "", link: ""};

const handle = setInterval(scrape, 60000);  // check price every 60 seconds

async function scrape() {
    //Fetch the data
    const {data} = await axios.get(url); //stop until url is fetched. Don't run next line like normally occurs in JS

    //Load up the html
    const $ = cheerio.load(data);

    //Extract the data that we need
    // # is used for id 
    // . is used for class
    // If space exists in class name, then use .
        // For example, if class = "product parbase", then write it as '.product.parbase'
        // This means 'parbase' is a class within the class 'product'
    product.link = url;
    const item1 = $('.product.parbase')
                    .first(); //selects first instance of class "product parbase"
    product.name = $(item1)
                    .find('hm-product-name')
                    .text() //Get the combined text contents of each element in the set of matched elements, including their descendants
                    .trim(); //removes all newlines, spaces (including non-breaking spaces), and tabs 
                            // from the beginning and end of the supplied string.
                            // If these whitespace characters occur in the middle of the string, they are preserved.
    const item2 = $('.price.parbase')
                    .first()
                    .text()
                    .trim();
    const price = item2.split('\n')[0] //get string from beginning till first \n
                        .substring(4)  //get substring starting from index 4 till end
                        .replace(/[,]/g, ""); //remove ,  
                                                // g : global replacement i.e. all occurrences of , is removed
                                                // If g is not used only first occurence of , will be removed

    const priceNum = parseFloat(price); //convert string to float
    product.price = priceNum;

    //Send an SMS via Twilio
    if (priceNum < 2000) {
        client.messages.create({
            body : `The price of ${product.name} has dropped down to ${product.price}. Buy item at ${product.link}`,
            from: '+19726408560',
            to: '+91 60007 49927'
        }).then(message => {
            console.log(message);
            clearInterval(handle);  //end once message is sent
        })
    }
}   

scrape();