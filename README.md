# flower_shop

## Backend Requirements

* [Docker](https://www.docker.com/).
* [Docker Compose](https://docs.docker.com/compose/install/).
* [Poetry](https://python-poetry.org/) for Python package and environment management.

## Frontend Requirements

* Node.js (with `npm`).

## First time setup

1. In `.env`, add our OpenAi API key to the environment variable `OPENAI_API_KEY`.

2. Run the following commands in order, to install and build the services in Docker Compose:

```bash
docker-compose build

# Install the dataset into DB
# This command should only run for first-time setup
sh ./scripts/load-dataset.sh
```

**Note**: It might take several minutes for it to be ready.

## Local development

* Start the stack with Docker Compose:

```bash
docker-compose up
```

The stack will be ready to interact after the `INFO` log line `Application startup complete.` appears.

* Now you can open your browser and interact with these URLs:

Frontend, built with Docker, with routes handled based on the path: http://localhost

Backend, JSON based web API based on OpenAPI: http://localhost/api/

Automatic interactive documentation with Swagger UI (from the OpenAPI backend): http://localhost/docs

Alternative automatic documentation with ReDoc (from the OpenAPI backend): http://localhost/redoc

Traefik UI, to see how the routes are being handled by the proxy: http://localhost:8090

Database, in Docker, exposes port 5432 and the credentials are in `.env`.

## Backend local development

### General workflow

By default, the dependencies are managed with [Poetry](https://python-poetry.org/), go there and install it.

From `./backend/app/` you can install all the dependencies with:

```console
$ poetry install
```

Next, open your editor at `./backend/app/` (instead of the project root: `./`), so that you see an `./app/` directory with your code inside. That way, your editor will be able to find all the imports, etc. Make sure your editor uses the environment you just created with Poetry.

Modify or add SQLAlchemy models in `./backend/app/app/models/`, Pydantic schemas in `./backend/app/app/schemas/`, API endpoints in `./backend/app/app/api/`, CRUD (Create, Read, Update, Delete) utils in `./backend/app/app/crud/`. The easiest might be to copy the ones for Items (models, endpoints, and CRUD utils) and update them to your needs.

### Backend tests

Backend tests runs in a dedicated Docker container `backend_test`, with a mocked PostgreSQL server.

#### Local tests

Run the tests with this command:

```Bash
sh ./scripts/test-local.sh
```

#### Linting

> Linting and code formatting requires `Poetry` setup in `General workflow` to complete before continuing.

From `./backend/app/`:

##### 1. Linting
Linters: [mypy](https://github.com/python/mypy), [ruff](https://github.com/astral-sh/ruff), [black](https://github.com/psf/black), [isort](https://pycqa.github.io/isort/)

```bash
poetry run sh ./scripts/lint.sh
```

##### 2. Code formatting

Formaters: [black](https://github.com/psf/black), [isort](https://pycqa.github.io/isort/)

```bash
poetry run sh ./scripts/format.sh
```

#### Test Coverage

Because the test scripts forward arguments to `pytest`, you can enable test coverage HTML report generation by passing `--cov-report=html`.

To run the local tests with coverage HTML reports:

```Bash
sh ./scripts/test-local.sh --cov-report=html
```

### Live development with Python Jupyter Notebooks

If you know about Python [Jupyter Notebooks](http://jupyter.org/), you can take advantage of them during local development.

The `docker-compose.override.yml` file sends a variable `env` with a value `dev` to the build process of the Docker image (during local development) and the `Dockerfile` has steps to then install and configure Jupyter inside your Docker container.

So, you can enter into the running Docker container:

```bash
docker-compose exec backend bash
```

And use the environment variable `$JUPYTER` to run a Jupyter Notebook with everything configured to listen on the public port (so that you can use it from your browser).

It will output something like:

```console
root@73e0ec1f1ae6:/app# $JUPYTER
[I 12:02:09.975 NotebookApp] Writing notebook server cookie secret to /root/.local/share/jupyter/runtime/notebook_cookie_secret
[I 12:02:10.317 NotebookApp] Serving notebooks from local directory: /app
[I 12:02:10.317 NotebookApp] The Jupyter Notebook is running at:
[I 12:02:10.317 NotebookApp] http://(73e0ec1f1ae6 or 127.0.0.1):8888/?token=f20939a41524d021fbfc62b31be8ea4dd9232913476f4397
[I 12:02:10.317 NotebookApp] Use Control-C to stop this server and shut down all kernels (twice to skip confirmation).
[W 12:02:10.317 NotebookApp] No web browser found: could not locate runnable browser.
[C 12:02:10.317 NotebookApp]

    Copy/paste this URL into your browser when you connect for the first time,
    to login with a token:
        http://(73e0ec1f1ae6 or 127.0.0.1):8888/?token=f20939a41524d021fbfc62b31be8ea4dd9232913476f4397
```

you can copy that URL and modify the "host" to be `localhost` or the domain you are using for development (e.g. `local.dockertoolbox.tiangolo.com`), in the case above, it would be, e.g.:

```
http://localhost:8888/token=f20939a41524d021fbfc62b31be8ea4dd9232913476f4397
```

 and then open it in your browser.

You will have a full Jupyter Notebook running inside your container that has direct access to your database by the container name (`db`), etc. So, you can just run sections of your backend code directly, for example with [VS Code Python Jupyter Interactive Window](https://code.visualstudio.com/docs/python/jupyter-support-py) or [Hydrogen](https://github.com/nteract/hydrogen).

## Frontend development

* Enter the `frontend` directory, install the NPM packages and start the live server using the `npm` scripts:

```bash
cd frontend
npm install
npm run serve
```

Then open your browser at http://localhost:3000

### Docker Compose Override

During development, you can change Docker Compose settings that will only affect the local development environment, in the file `docker-compose.override.yml`.

The changes to that file only affect the local development environment, not the production environment. So, you can add "temporary" changes that help the development workflow.

### The .env file

The `.env` file is the one that contains all your configurations, generated keys and passwords, etc.

## URLs

These are the URLs that will be used and generated by the project.

### Development URLs

Development URLs, for local development.

Frontend: http://localhost

Backend: http://localhost/api/

Automatic Interactive Docs (Swagger UI): https://localhost/docs

Automatic Alternative Docs (ReDoc): https://localhost/redoc

Database, in Docker, exposes port 5432 and the credentials are in `.env`.

## Diagrams

### Database Table Relationships

![Database Table Relationships](https://github.com/dcaribou/transfermarkt-datasets/blob/master/resources/diagram.svg?raw=true)

## Current issues

1. Queries are not tested in unit tests, as I haven't found a good way to stimulate an LLM in testing.
2. If OpenAI calls in `llama-index` fails, the library keeps on retrying the request, and the server has not been able to handle it gracefully.

## Further improvement

1. Per query, the query engine takes longer than a few seconds to generate a response. It could be improved by spending more time on the library `llama-index` for optimization.
2. The start-up time of the back-end could be improved, by reducing the time to start the query engine.

## Testing queries
- how many games there are ?
- how many players having the right foot ?
- which competitions have the most total number of games of all players participating ?