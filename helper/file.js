const fs = require('fs');
const _ = require('lodash');
const DirectMongo = require('./DirectMongo');
const ggeo = require('./ggeo');

function csvJSON(csv, delim){
    let lines = csv.split(/\r\n|\n/);
    let result = [];
    let headers=lines[0].split(delim);
    for(let i = 1; i < lines.length; i++){
        let obj = {};
        let currentline = lines[i].split(delim);

        for(let j = 0; j < headers.length;j++){
            obj[headers[j]] = currentline[j];
        }

        result.push(obj);

    }

    return result; //JavaScript object
    //return JSON.stringify(result); //JSON
}

// const universityList = {};

fileModule = {
    readFile: (path) => {
        try {  
            let data = fs.readFileSync(path, 'utf8');
            let list = csvJSON(data, /\t/);
            return list;
        } catch(e) {
            console.log('Error:', e.stack);
        }
    },

    saveCSVtoDB: async (options = { filePath: '', collectionName: '', idKey: '', save:false}) => {
        const { filePath, collectionName, idKey} = options;
        dataList = fileModule.readFile(filePath);
        dataList.forEach(record => {
            record._id = record[idKey];
        });

        if (options.save) {
            await DirectMongo.DB.collection(collectionName).insertMany(dataList);
        }
        return dataList;
    },

    __processStudentCSV: async (saveStudent=false, saveUniversity=false) => {
        // Read file
        let FileModule = require('./helper/file');
        let studentList = await FileModule.saveCSVtoDB({
            filePath: 'student.csv',
            collectionName: 'Student',
            idKey: 'stuId',
            save: saveStudent
        });
    
        let universityTabl = {};
        let universityObjs = [];
    
        console.log("TCL: studentList", studentList)
        studentList.forEach((student) => {
            const university = student.university;
            if (!universityTabl[university]) {
                universityTabl[university] = 1;
            } else {
                universityTabl[university] += 1;
            }
        });
    
        for (let key in universityTabl) {
            universityObjs.push({
                _id: key,
                name: key,
                nStudent: universityTabl[key]
            })
        }
    
        console.log('[i] - saving ' + universityObjs.length + ' university.');
    
        if (saveUniversity) {
            await DirectMongo.DB.collection('University').insertMany(universityObjs);
        }
        console.log("[i] - Done!")
    },

    __getGeoCodeforUniversity: async () => {
        let university = {};
        let t = 5;
        let i = 0;
        while (university &&  0 < t--) {
            let university = await DirectMongo.DB.collection('University').findOne({ location: {$exists: false}, err: {$exists: false}});
            if (!university) break;
            try {
                console.log ('===================[' + university.name + ']============');
                let res = await ggeo.getGeo(university.name + '、日本');

                if (res.status != 'OK') {
                    throw res.status;
                }
                let geoData = res.results[0] || {};

                university.location = {
                    lng: Number(Number(_.get(geoData, 'geometry.location.lng')).toFixed(3)),
                    lat: Number(Number(_.get(geoData, 'geometry.location.lat')).toFixed(3))
                }
                university.placeId = _.get(geoData, 'place_id');
                university.formatted_address = _.get(geoData, 'formatted_address');
                university.prefecture = ggeo.getComponentAdd(geoData.address_components, 'administrative_area_level_1');

                console.log(university);
                console.log("=====================================");
                await DirectMongo.DB.collection('University').replaceOne({_id: university._id}, university);
            } catch (err) {
                console.log (err);
                university.err = err;
                await DirectMongo.DB.collection('University').replaceOne({_id: university._id}, university); 
            }

            console.log('[i] - record number: ', i++);
        }

        console.log("[i] - Done!")
    }
}

module.exports = fileModule;