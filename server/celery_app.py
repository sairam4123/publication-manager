from celery import Celery
from background_task.main import process_excel
celery = Celery(__name__, broker="redis://localhost:6379/0", backend="redis://localhost:6379/0")
