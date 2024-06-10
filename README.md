# blap


## Instructions:

### Installation

1. Install [node.js](https://nodejs.org/en) and clone this repository.
2. Run the following

```bash
$ npm install
```

### Authentication

Run the following:

```bash
$ node launch.js
```

This will open a Chromium browser window. In it, go to [Discourse]('https://discourse.onlinedegree.iitm.ac.in/) and log in.

Once logged in, close the browser window.

### Scraping

For a given course category on Discourse, we need to find two things - its `slug` and its `id`.
Both can be found by visiting the course page on Discourse. For example, the
Python course category is located at the following URL:

```
https://discourse.onlinedegree.iitm.ac.in/c/courses/python-kb/25
```
The last two parts of the URL path are the slug and the ID respectively, i.e.
for Python, the slug is `python-kb` and the category ID is `25`.

Once you know the slug and ID for a specific course, run the following:

```bash
$ node scrape.js --slug=<slug> --id=<id> --since "2023-01-01"
```

The `--since` argument is expected in `"YYYY-MM-DD"` format. It can also be
ignored, in which case _all_ topics will be downloaded from the given course
category.

E.g. in order to download the posts from the Python category since 1st Jan 2023
onwards, run the following:

```bash
$ node scrape.js --slug=python-kb --id=25 --since "2023-01-01"
```

Repeat the same for any other course. The topics will be downloaded in
independent folders.

**CAUTION**: The scraping takes a _long_ time, so please be prepared to leave it
running for a while. The scraping is deliberately kept slow so as to not exceed
Discourse's API limits. It proceeds at the rate of approx 1 second per post.
E.g. The Python category contains 1594 topics since Jan 1st, 2023. Downloading
them took me an hour.
