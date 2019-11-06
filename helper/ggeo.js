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

  const query = { address, key: GG_API_KEY, language: 'ja' };
  const QString = querystring.stringify(query);

  const request = {
    method: 'get',
    url: GG_API + QString,
    headers: {
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36',
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
      'accept-encoding': 'gzip, deflate, br',
      'accept-language': 'en-US,en;q=0.9',
      'cache-contro': 'max-age=0'
    }
  }

  return axios(request).then(result => {
    //console.log(result.data);
    return result.data;
  });
}

ggeo.getComponentAdd = (addrComponents = [], typeKey = 'administrative_area_level_1') => {
  let matchComponent = addrComponents.find(cpn => (cpn.types || []).includes(typeKey));
  return matchComponent.long_name;
}

module.exports = ggeo