from celery import Celery
from main import process_excel, process_scholarly, process_author_search, process_customized_query
celery = Celery(__name__, broker="redis://localhost:6379/0", backend="redis://localhost:6379/0")
celery.conf.broker_connection_retry_on_startup = True
celery.conf.task_routes = {
    'main.process_excel': {'queue': 'main'},
    'main.process_author_search': {'queue': 'main'},
    'main.process_customized_query': {'queue': 'main'},
    'app.process_model': {'queue': 'ai'}
}