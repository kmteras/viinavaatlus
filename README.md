# Setting up the project
Requirements:  
* Node.js  
* Npm  
* MongoDB

```git clone git@github.com:Teras23/viinavaatlus.git```

```cd viinavaatlus```

```git checkout development```

Copy config values from readme to config.json and change 

```npm install```

```npm run dev```


Example ```config.json``` file:
```
{
  "databaseUrl": "mongodb://localhost:27017/",
  "database": "viinavaatlus",
  
  Optional parameters:
  "port": 3000,
  "production": true/false,
  "scrapeOnStart": true/false
}
```

