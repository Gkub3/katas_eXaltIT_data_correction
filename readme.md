# Kata data correction

Each endpoint holds some data, but someone made a mistake and shuffled it.
Thankfully, all users ids are still here !
You have to fix it ! For that, you have to make a backup of each endpoint locally (one json file per endpoint),
then compile them in one file, sanitize the data, store it locally and upload it on Krates.

# Configuration

## Firebase

    {
        "URL" : "https://recrutement-practice-default-rtdb.firebaseio.com/",
        "APIS" : {
            "USERS" : "users.json",
            "INFORMATIONS" : "informations.json",
            "JOBS" : "jobs.json"
        }
    }

| Attribute         | Value                                         |
|-------------------|-----------------------------------------------|
| URL               | API root address                              | 
| APIS.USERS        | API users                                     | 
| APIS.INFORMATIONS | API informations                              | 
| APIS.JOBS         | API jobs                                      | 

## Krates

Krates is an HTTP API in front of a NoSQL database. To create one go on https://app.krat.es/ and create your database. 
Report Krate's informations in /src/config/krates-config.json

    {
        "URL" : "https://krat.es/",
        "NAME" : "users",
        "ID" : "649114553aee159b6fd4",
        "API_KEY" : "298ebd9f-d5a9-48fd-83fe-2cedf5acda98"        
    }

| Attribute         | Value                                         |
|-------------------|-----------------------------------------------|
| URL               | API root address                              | 
| NAME              | Database name                                 | 
| ID                | Krate ID                                      | 
| API_KEY           | Key to enable a protected connection          | 

# Launch

Launch execution. A "data" folder is created with results inside (each enpoints + sanitized data).

    npm start

# Test

Launch test in order to compare result datas with result.json. Test won't save data in Krates.

    npm test

