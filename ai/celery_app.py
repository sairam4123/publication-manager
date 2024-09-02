from dotenv import load_dotenv
load_dotenv()

from celery import Celery
from app import *
import os

celery = Celery("ai", broker=os.environ["REDIS_BROKER"], backend=os.environ["REDIS_BACKEND"])
celery.conf.broker_connection_retry_on_startup = True
celery.conf.task_routes = {
    'app.process_model': {'queue': 'ai'},
}