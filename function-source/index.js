// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';
 
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const bent = require('bent');
const getJSON = bent('json');
//const moment = require('moment');
 
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
 
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
 
  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }
 
  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }

 function worldwideLatestStats(agent){
   const type = agent.parameters.type;
   return getJSON('https://coronavirus-tracker-api.herokuapp.com/v2/latest?source=jhu').then((result) => {
     
    agent.add('According to the latest data, ');
    if(type.length >= 3) {
      agent.add(`There are currently ${result.latest.confirmed} confirmed cases, ${result.latest.deaths} deaths and ${result.latest.recovered} recovered cases of COVID-19.`);
      return;
    }
    for(var i=0; i<type.length; i++) {
      if(i==1) {
        agent.add('In addition, ');
      }
      switch(type[i]) {
        case 'confirmed': 
        agent.add(`there are currently ${result.latest.confirmed} confirmed cases of COVID-19, `);
        break;
      case 'deaths':
        agent.add(`there are currently ${result.latest.deaths} deaths due to COVID-19, `);
        break;
      case 'recovered':
        agent.add(`there are currently ${result.latest.recovered} people who have recovered from COVID-19, `);
        break;
      default: //all
        agent.add(`There are currently ${result.latest.confirmed} confirmed cases, ${result.latest.deaths} deaths and ${result.latest.recovered} recovered cases of COVID-19.`);
      }
    }
    }).catch((error) => {
    console.error();
   });
 }
  
 function locationLatestStats(agent){
  const type = agent.parameters.type;
  const country = agent.parameters.country;
  const state = agent.parameters.state;
  const county = agent.parameters.county;
  var url = `https://coronavirus-tracker-api.herokuapp.com/v2/locations?source=csbs`;   
  if(country.length>0 && county.length==0 && state.length==0) {
  url = `https://coronavirus-tracker-api.herokuapp.com/v2/locations?source=jhu`;
  }
  var uri = ``;
  if(country.length==0&&state.length==0&&county.length==0) {
    agent.add(`I could not find that place in my database. Please try again.`);
    return;
  }
  if(country.length>0) {
    uri = `&country_code=` + country[0]["alpha-2"];
    }
  if(state.length>0) {
    uri = uri + `&province=` + state[0];
    }
  if(county.length>0) {
    const words = county[0].split(" ");
    const county_name = words[0];
    uri = uri + `&county=` + county_name;
    }
  url = url + uri;
  
  return getJSON(url).then((result) => {
      agent.add('According to the latest data, ');
        if(type.length >= 3) {
          agent.add(`There are currently ${result.latest.confirmed} confirmed cases, ${result.latest.deaths} deaths and ${result.latest.recovered} recovered cases of COVID-19 in ` + county[0] + `, ` + state[0] + `, ` + country[0]);
          return agent;
        }
        for(var i=0; i<type.length; i++) {
          if(i==1) {
            agent.add('In addition, ');
          }
        switch(type[i]) {
            case 'confirmed': 
            agent.add(`there are currently ${result.latest.confirmed} confirmed cases of COVID-19, `);
            break;
        case 'deaths':
            agent.add(`there are currently ${result.latest.deaths} deaths due to COVID-19, `);
            break;
        case 'recovered':
            agent.add(`there are currently ${result.latest.recovered} people who have recovered from COVID-19, `);
            break;
        default: //all
            agent.add(`There are currently ${result.latest.confirmed} confirmed cases, ${result.latest.deaths} deaths and ${result.latest.recovered} recovered cases of COVID-19, `);
            }
            var answer = ``;
            if(county[0] !== undefined) {
              answer = answer + county + `, `;
            }
            if(state[0] !== undefined) {
              answer = answer + state + `, `;
            }
            if(country[0] !== undefined) {
              answer = answer + country[0]["name"] + `. `;
            }
        }
        agent.add(`in ` + answer);
      }).catch((error) => {
      console.error();
  });
}

  function timelineStats(agent) {
    const type = agent.parameters.type;
    const country = agent.parameters.country;
    const timeline = agent.parameters.date_period;
    //const state = agent.parameters.state;
    //const county = agent.parameters.county;
    var start = timeline.startDate.split("T");
    var startDate = start[0] + "T00:00:00Z";
    var end = timeline.endDate.split("T");
    var endDate = end[0] + "T00:00:00Z";
    var country_code = country[0]["alpha-2"];
    var url = `https://coronavirus-tracker-api.herokuapp.com/v2/locations?source=jhu&country_code=` + country_code + `&timelines=true`;
    return getJSON(url).then((result) => {
	  if(result.locations[0]["timelines"]["confirmed"]["timeline"][endDate] === undefined) {
      var lastdigit = end[0].substring(end[0].length-1);
      var digit = parseInt(lastdigit) - 1;
      endDate = end[0].substring(0, end[0].length-1) + digit + "T00:00:00Z";
      }
      var start_confirmed = result.locations[0]["timelines"]["confirmed"]["timeline"][startDate];
      var start_deaths = result.locations[0]["timelines"]["deaths"]["timeline"][startDate];
      var start_recovered = result.locations[0]["timelines"]["recovered"]["timeline"][startDate];
      var end_confirmed = result.locations[0]["timelines"]["confirmed"]["timeline"][endDate];
      var end_deaths = result.locations[0]["timelines"]["deaths"]["timeline"][endDate];
      var end_recovered = result.locations[0]["timelines"]["recovered"]["timeline"][endDate];
      var confirmed_timeline = end_confirmed-start_confirmed;
      var deaths_timeline = end_deaths-start_deaths;
      var recovered_timeline = end_recovered-start_recovered;

      //var a = moment(start);
      //a.format('LL');

      agent.add('According to the latest data, ');
      if(type.length >= 3) {
          agent.add(`There are have been ${confirmed_timeline} new confirmed cases, ${deaths_timeline} deaths and ${recovered_timeline} recovered cases of COVID-19 in ` + country[0]["name"]);
          return;
      }
      for(var i=0; i<type.length; i++) {
      if(i==1) {
          agent.add('In addition, ');
      }
      switch(type[i]) {
          case 'confirmed': 
          agent.add(`there are ${confirmed_timeline} new confirmed cases of COVID-19, `);
          break;
      case 'deaths':
          agent.add(`there have been ${deaths_timeline} deaths due to COVID-19.`);
          break;
      case 'recovered':
          agent.add(`there are ${recovered_timeline} people who have recovered from COVID-19, `);
          break;
      default: //all
          agent.add(`There are ${result.latest.confirmed} new confirmed cases, ${result.latest.deaths} deaths and ${result.latest.recovered} recovered cases of COVID-19, `);
          }
          agent.add(` in ` + country[0].name + ` in the given time period.`);
      }
      }).catch((error) => {
      console.error();
  });
  }

  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('Worldwide Latest Stats', worldwideLatestStats);
  intentMap.set('Location Latest Stats', locationLatestStats);
  intentMap.set('Timeline stats', timelineStats);
  // intentMap.set('your intent name here', googleAssistantHandler);
  agent.handleRequest(intentMap);
});
