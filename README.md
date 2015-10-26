Sense
=====

A JSON aware developer's interface to Elasticsearch. Comes with handy machinery such as syntax highlighting, API suggestions, formatting and code folding.

Installation
-----

Sense is a Kibana app. To get up and running you will first need to download Kibana and install as instructed [here](https://www.elastic.co/downloads/kibana). Once Kibana is installed, you can simply install Sense running the following command from your Kibana folder:

```
$ ./bin/plugin install elastic/sense
```

Now start your Kibana server by running:

```
$ ./bin/kibana
```

Sense should be available on `localhost:5601/app/sense` (assuming Kibana defaults).

For more information and advanced setting please see the [documentation INSERT LINK]()


Screenshots
-----


### Handy API suggestions

Sense offers handy contextual suggestion to the Elasticsearch API.

![API Suggestions](https://github.com/bleskes/sense/raw/readme/docs/images/readme_api_suggestions.png)

### Format validation

Sometimes it is hard to find that little missing comma. Sense automatically highlights and explains invalid input.
![Format validation](https://github.com/bleskes/sense/raw/readme/docs/images/readme_errors.png)

### Scope collapsing

Working on a big JSON query can be distracting. Using the mouse or via a handy keyboard shortcut (Ctrl/Cmd+Option+0)
, Sense allows you to focus on a sub section and fold others away.

![Folding](https://github.com/bleskes/sense/raw/readme/docs/images/readme_api_suggestions.png)

### Auto formatting

Type your commands however you want and let Sense format them for you.

![Auto formatting](https://github.com/bleskes/sense/raw/readme/docs/images/readme_auto_formatting_mix.png)


### Submit multiple requests at once

When testing or trying things out you frequently need to repeat the same sequence of commands.
Just write them all in Sense, select and submit multiple requests to Elasticsearch.

![Multiple Requests](https://github.com/bleskes/sense/raw/readme/docs/images/readme_multiple_requests.png)


### Copy and Paste cURL commands

Once done, you can copy one or more requests as cURL commands (and of course paste them back)

![Copy As Curl](https://github.com/bleskes/sense/raw/readme/docs/images/readme_copy_as_curl.png)

Results in:

```
# Delete all data in the `website` index
curl -XDELETE "http://localhost:9200/website"

# Create a document with ID 123
curl -XPUT "http://localhost:9200/website/blog/123" -d'
{
  "title": "My first blog entry",
  "text":  "Just trying this out...",
  "date":  "2014/01/01"
}'
```



Documentation
--------

Visit [elastic.co INSERT LINK]() for the full documentation.


