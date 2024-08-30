from celery import Celery
from app import *


celery = Celery("ai", broker="redis://localhost:6379/0", backend="redis://localhost:6379/0")
celery.conf.broker_connection_retry_on_startup = True
celery.conf.task_routes = {
    'app.process_model': {'queue': 'ai'},
}