'use strict'
require('dotenv').config();

// Init mongoDB
let DirectMongo = require('./helper/DirectMongo');
let DBInstance =  new DirectMongo(process.env.DATABASE_URI);
DBInstance.connect();

const file = require('./helper/file');
/*setTimeout(__processStudentCSV, 3000);*/
setTimeout(file.__getGeoCodeforUniversity, 3000);

//const ggeo = require('./helper/ggeo');
//ggeo.getGeo('明治大学');