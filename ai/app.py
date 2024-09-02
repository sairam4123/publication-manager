import asyncio
from io import StringIO
import json
import time

from celery import current_app as celery
from celery import Task
from mistralapi import main as task_ai
from mistralapi import async_main as async_task_ai
from redis import Redis
import os

redis = Redis.from_url(url=os.environ["REDIS_URL"])

@celery.task
def process_model(data: dict):
    input_data = json.dumps(data)
    with StringIO(input_data) as in_buffer, StringIO() as out_buffer:
        task_ai(in_buffer, out_buffer)
        output_data = out_buffer.getvalue()
    return {'text': output_data}

@celery.task(bind=True)
def process_model_two(self: Task, data:dict):
    input_data = json.dumps(data)
    v = 0
    with StringIO(input_data) as in_buffer, StringIO() as out_buffer:
        for chunk in async_task_ai(in_buffer, out_buffer):
            print(f"Chunk {chunk}")
            resp = redis.xadd(f"ai_completions_{self.request.id}", {b"data": chunk.encode(), "ts": time.time(), 'v': v})
            v += 1
            print(resp, v)
        output_data = out_buffer.getvalue()
        resp = redis.xadd(f"ai_completions_{self.request.id}", {b"data": "[END]".encode(), "ts": time.time(), 'v': v})
        print(resp, v)
    return {'text': output_data}