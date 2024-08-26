FROM python:3.12-slim-bullseye AS builder

RUN pip install poetry==1.8.3

ENV POETRY_NO_INTERACTION=1 \
    POETRY_VIRTUALENVS_IN_PROJECT=1 \
    POETRY_VIRTUALENVS_CREATE=1 \
    POETRY_CACHE_DIR=/tmp/poetry_cache

WORKDIR /worker

COPY pyproject.toml poetry.lock ./
RUN touch README.md

RUN --mount=type=cache,target=$POETRY_CACHE_DIR poetry install --no-root

FROM python:3.12-slim-bullseye as runtime

ENV VIRTUAL_ENV=/worker/.venv \
    PATH="/worker/.venv/bin:$PATH"

COPY --from=builder ${VIRTUAL_ENV} ${VIRTUAL_ENV}

COPY . ./worker

WORKDIR /worker

ENTRYPOINT ["celery", "-A", "celery_app.celery", "worker", "--loglevel=info", "--pool=solo"]