import asyncio
from io import StringIO
import json

from celery import current_app as celery
from mistralapi import main as task_ai

@celery.task
def process_model(data: dict):
    input_data = json.dumps(data)
    with StringIO(input_data) as in_buffer, StringIO() as out_buffer:
        task_ai(in_buffer, out_buffer)
        output_data = out_buffer.getvalue()
    return {'text': output_data}