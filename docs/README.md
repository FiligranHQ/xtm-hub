# XTM Hub Documentation

This folder contains the source for the XTM Hub documentation site, built with
[MkDocs](https://www.mkdocs.org/) and the [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/)
theme. The online version is available at
[docs.hub.filigran.io](https://docs.hub.filigran.io).

The documentation used to live in a separate repository
(`xtm-hub-docs`) and has been consolidated here so it lives and versions
alongside the code it describes.

## Install the documentation locally

All commands below are run from this `docs/` folder.

### Prepare the environment

Use Python 3.12 or higher and create a virtual environment:

```sh
$ python3 -m venv venv
```

#### MacOS/Linux:
```sh
$ source venv/bin/activate
```

#### Windows:
```sh
$ venv\Scripts\Activate.ps1
```

### Install dependencies

```sh
$ pip install -r requirements.txt
```

### Git committers plugin

The `git-committers` plugin displays real contributors on each page and needs
a GitHub token to query the API. Create a token in your
[GitHub account settings](https://github.com/settings/tokens) with these
permissions:
- Commit statuses => Access: Read and write
- Contents => Access: Read and write
- Metadata => Access: Read-only
- Pages => Access: Read and write

```sh
export MKDOCS_GIT_COMMITTERS_APIKEY=[YOUR_GITHUB_TOKEN]
```

### Launch the local environment

```sh
$ mkdocs serve
Starting server at http://localhost:8000/
```

## Deploy the documentation

Deployment is currently a **manual** step, run from this `docs/` folder
(the same process as before, just from the new location).

### Update the source

Committing on the main branch does not impact the deployed documentation;
commit and push as usual.

### Deploy and update the current version

With the right version number (e.g. 1.5.X):
```sh
$ mike deploy --push [version]
```

### Deploy a new stable version

With the right version number (e.g. 1.5.X), update the `latest` alias:
```sh
$ mike deploy --push --update-aliases [version] latest
```

## Useful commands

```sh
$ mike help
usage: mike [-h] [--version] [-q] [--debug] COMMAND ...

mike is a utility to make it easy to deploy multiple versions of your MkDocs-powered docs to a Git branch, suitable for deploying to Github via gh-pages. It's designed to produce one version of your docs at a time. That way, you can easily deploy a new version
without touching any older versions of your docs.

positional arguments:
  COMMAND
    deploy              build docs and deploy them to a branch
    delete              delete docs from a branch
    alias               alias docs on a branch
    props               get/set version properties
    retitle             change the title of a version
    list                list deployed docs on a branch
    set-default         set the default version for your docs
    serve               serve docs locally for testing
```
