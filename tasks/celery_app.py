from celery import Celery
from main import process_excel, process_scholarly
celery = Celery(__name__, broker="redis://redis:6379/0", backend="redis://redis:6379/0")
celery.conf.broker_connection_retry_on_startup = True