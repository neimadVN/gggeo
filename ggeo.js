'use strict'
const axios = require('axios');
const querystring = require('querystring');
const _ = require('lodash');
const ggeo = {};

const GG_API_KEY = process.env.GG_API_KEY || 'put the key here';
const GG_API = `https://maps.googleapis.com/maps/api/geocode/json?`;

global._CACHE = {};

ggeo.getGeo = (address) => {
  if (_.has(global._CACHE, address)) {
    return _.get(global._CACHE, address);
  }

  const query = { address, key: GG_API_KEY };
  const QString = querystring.stringify(query);
  axios.get(GG_API + QString).then(result => {
    console.log(result.data);
  });
  
}

module.exports = ggeo