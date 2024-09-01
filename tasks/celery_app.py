from celery import Celery
from main import process_excel, process_scholarly, process_author_search, process_customized_query
from dotenv import load_dotenv
load_dotenv()
import os

celery = Celery(__name__, broker=os.environ['REDIS_BROKER'], backend=os.environ['REDIS_BACKEND'])
celery.conf.broker_connection_retry_on_startup = True
celery.conf.task_routes = {
    'main.process_excel': {'queue': 'main'},
    'main.process_author_search': {'queue': 'main'},
    'main.process_customized_query': {'queue': 'main'},
    'app.process_model_two': {'queue': 'ai'}
}