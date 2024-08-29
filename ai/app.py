from celery import current_app as celery

@celery.task
def process_model(data: dict):
    print(data)