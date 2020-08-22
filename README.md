a.  Name - Udiksha Singh (ufid: 3393-7215)

b.  Level - Graduate

c.  Program Description - 
This program pulls its data from coronoaviris-tracker-api (https://coronavirus-tracker-api.herokuapp.com/)
The program provides following features to its users:
    1. User can query the total number of confirmed cases, deaths and recovered cases due to COVID-19. A dedicated intent in Google's dialogflow is mapped with the request, which then calls the tracker API (using 'jhu' source).

    2. User can query the number of confirmed cases, deaths and recovered cases due to COVID-19 of a particular region(country, state or county). In this case, the request is mapped to the intent that handles locatione-based query. 
    The parameter values (county, state, country, type(confirmed/deaths/recovered)) are extracted from the webhook client, and then are parsed to generate the URI for tracker API.
    Then the tracker API is called to pull the requested data(using csbs source). 

    3. User can query the number of confirmed cases, deaths and recovered cases due to COVID-19 in a given time period.
    The program uses '@sys.date-period' to parse timeline-based queries and get a beginning date and an end date. After calling the tracker API, with the 'timelines' parameter set to true, number of case at the beginning date and at the end date is extracted from the response body. The difference in the value of these 2 data is returned as the result.

d.  Tools used to develop
    1. Google Dialogflow (for Natural Language Processing)
    2. Unity 2019.3.10f1 Personal (for the designing of the interface)
    3. https://www.mixamo.com/ (for creating the avatar for the interface)
    4. Windows 10 (OS)

e.  Dependencies
    1. firebase-functions - for debugging logs
    2. bent (javascript module) - for the HTTP client to call the coronoaviris-tracker-api
    3. moment (javascript module) - to parse date-based strings(in timeline-based queries)

f.  How to compile 
    The project is already built. 
    
g.  To run the application, goto COVID_Agent->Covid19Tracker->Covid19Tracker->Build, and run  Covid19Tracker.exe      


