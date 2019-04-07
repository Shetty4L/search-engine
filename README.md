### CSCI 572 HW4
-------------

The search engine application is built using NodeJS, which is also responsible for serving the webpages themselves.

#### Prerequisites
To run the application, we first need to install all our dependencies.

```bash
npm install
```

#### Running the application
Once the dependencies are installed, we need to start our server.
```bash
npm run serve:dist
```

Now we can navigate to `http://localhost:3000` to use our search engine.

To allow the search engine to fetch results from Solr, we need to start the Solr server before we execute any search queries. 
