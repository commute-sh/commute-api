commute-api
===========


Docker build
------------

```
    docker build -t commute-api .
```


Docker run
----------

```
     docker run -e "CITY=<City>" -e "API_KEY=<API_KEY>" -e "DB_HOST=<DB_HOST>" --rm --name commute-api commute-api
```


Docker run into Bash
--------------------

```
     docker run -e "CITY=<City>" -e "API_KEY=<API_KEY>" -e "DB_HOST=<DB_HOST>" --rm -it --name commute-api commute-api bash
```

Docker logs
-----------

```
    docker logs commute-api
```