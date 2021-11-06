const seat = require('./src/axiosOps.js');

const axios = require("axios");
const md5 = require("blueimp-md5");

const express = require('express');
const app = express();
const port = 3000;

const handlebars = require('express-handlebars');

var doneit = 0;
var theChar = {};
var theChars = [];

app.set('view engine', 'hbs');
app.engine('hbs', handlebars({
    layoutsDir: __dirname + '/views/layouts',
    extname: 'hbs',
    defaultLayout: 'planB',
    partialsDir: __dirname + '/views/partials/'
}));

app.use(express.static('public'))

app.use(express.urlencoded({
    extended: true
}))

app.get('/', (req, res) => {
    res.render('main', { layout: 'index' });
});

app.get('/search', async (req, res) => {
    theChars = await search(req.query.searchTerm);
    res.render('searchResults', { layout: 'search', characters: theChars })
})

app.get('/characters/:id', async (req, res) => {
    console.log(req.params.id + " param")
    theChar = doneit % 2 == 0 ? await findCharacter(req.params.id) : theChar;
    doneit++;
    console.log(theChar[0].name)
    image = theChar[0].thumbnail.path + "." + theChar[0].thumbnail.extension;
    console.log(image)
    res.render('characterResults', { layout: 'character', characterData: theChar[0], imageUrl: image })
})

app.get('/*', (req, res) => {
    res.render('error');
})

/**
 *        A.X.I.O.S code
 */

const baseUrl = 'https://gateway.marvel.com/v1/public/characters';

const publickey = 'dd1a7e247862d65a9880af418246227a';
const privatekey = '3cca8061c1d5fe3c09ddd0dcd67bdbdae7972bf7';

const ts = new Date().getTime();

const stringToHash = ts + privatekey + publickey;
const hash = md5(stringToHash);

console.log(ts);
console.log(publickey);
console.log(hash);

const otherURL = 'ts=' + ts + '&apikey=' + publickey + '&hash=' + hash;

async function search(searchTerm) {
    let characterArray = [];
    let singleCharacter = { "id": "-1", "name": "null" };
    try {
        searchTerm = "?nameStartsWith=" + searchTerm;
        searchTerm += "&";
        const response = await axios.get(baseUrl + searchTerm + otherURL);

        const info = response.data.data
        // console.log(response.data.data)

        for (var i = 0; i < response.data.data.count; i++) {
            singleCharacter = {
                "id" : info.results[i].id,
                "name" : info.results[i].name
            }
            characterArray.push(singleCharacter);
            if (i > 20) break;
        }
        return characterArray;
    } catch (error) {
        console.error(error);
    }
    characterArray.push(singleCharacter);
    return characterArray;
}


async function findCharacter(id) {
    
    try {
        if(id)
        characterQuery = "/" + id + "?";
        console.log("yoo" + baseUrl + characterQuery + otherURL);
        const response = await axios.get(baseUrl + characterQuery + otherURL);
        const info = response.data.data
        console.log(info.results)
        return (info.results);
    } catch (error) {
        console.error(error);
    }
}

app.listen(port, () => console.log(`App listening to port ${port}`));