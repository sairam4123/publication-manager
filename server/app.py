import time

from fastapi import FastAPI, Response, UploadFile
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from celery import Celery

import os
from dotenv import load_dotenv
load_dotenv()

from supabase import create_client

from pydantic import BaseModel
from redis import Redis


class CustomizedQueryModel(BaseModel):
    author_name: str
    publication_type: str
    from_year: int
    to_year: int


celery = Celery(__name__, broker=os.environ["REDIS_BROKER"], backend=os.environ["REDIS_BACKEND"])
redis_client = Redis(host="redis", port=6379, db=1)
celery.conf.broker_connection_retry_on_startup = True
celery.conf.task_routes = {
    'main.process_excel': {'queue': 'main'},
    'main.process_author_search': {'queue': 'main'},
    'main.process_customized_query': {'queue': 'main'},
    'app.process_model_two': {'queue': 'ai'}
}

sp_client = create_client("https://xchmpfivomtlnslvbbbk.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjaG1wZml2b210bG5zbHZiYmJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQ2MDI4MDYsImV4cCI6MjA0MDE3ODgwNn0.HBs-xlJW21awsjyS5mje25g3Wu5M_TGFc2T7Q6urXLw")
sp_client.auth.sign_in_with_password({"email": "sairamkumar2022@gmail.com", "password": "123456"})

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:5173",
    "http://localhost:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/tasks")
def run_task(file: UploadFile):
    cur_time = int(time.time())
    sp_client.auth.get_session()
    # download file
    in_filename = f"input-{cur_time}.xlsx"
    sp_client.storage.from_("excel-storage") \
        .upload(in_filename, file.file.read())

    task = celery.send_task("main.process_excel", args=[in_filename])
    return {"task_id": task.id}

@app.get("/tasks/{task_id}/status")
def task_status(task_id: str):
    task = celery.AsyncResult(task_id)
    return {"status": task.status}

@app.get("/tasks/{task_id}/result")
def task_result(task_id: str):
    sp_client.auth.get_session()
    task = celery.AsyncResult(task_id)
    result = task.result
    out_file = result["out_file"]
    task_id = result["task_id"]
    file = sp_client.storage.from_("excel-storage").download(out_file)
    
    extra_headers = {"X-Task-ID": task_id, "Access-Control-Expose-Headers": "X-Task-ID"}
    
    # upload file
    return Response(file, media_type="application/octet-stream", headers={"Content-Disposition": f"attachment; filename={out_file}"} | extra_headers)


@app.post("/tasks/customized")
def run_customized_query(query: CustomizedQueryModel):
    task = celery.send_task("main.process_customized_query", args=[query.model_dump()])
    return {"task_id": task.id}

@app.get("/tasks/customized/{task_id}/result")
def run_customized_query_result(task_id: str):
    task = celery.AsyncResult(task_id)
    print(f"Status: {task.status}")
    if task.status == "FAILED" or task.status == "PENDING":
        return {'status': task.status}
    
    result = task.result['result']
    task_id = task.result['task_id']
    extra_headers = {"X-Task-ID": task_id, "Access-Control-Expose-Headers": "X-Task-ID"}

    return JSONResponse(result, headers=extra_headers)

@app.get("/tasks/search/{query}")
def run_search_author_query(query: str):
    task = celery.send_task("main.process_author_search", args=[query])
    return {"task_id": task.id}

@app.get("/tasks/search/{task_id}/result")
def search_author_query(task_id: str):
    task = celery.AsyncResult(task_id)
    print(f"Status: {task.status}")
    if task.status == "FAILED" or task.status == "PENDING":
        return {'status': task.status}
    print(task.result)
    return task.result

@app.get("/tasks/ai/{task_id}/result")
def get_ai_result(task_id: str):
    task = celery.AsyncResult(task_id)
    def generator():
        # # To simulate AI like response..
        # import random
        # if task.status == "SUCCESS":
        #     for chunk in get_chunks(task.result['text'], 50):
        #         yield chunk
        #         time.sleep(random.uniform(0.05, 0.14))
        #     return
        print("Waiting for messages")
        last_message_id = "0-0"
        while True:
            print("Trying to read messages")
            messages = redis_client.xread({f"ai_completions_{task_id}": last_message_id}, count=1, block=1000)
            print(messages, )
            if len(messages) == 0:
                print("No messages found, should we close out?")
                continue
            current_message_id = messages[0][1][0][0].decode()
            message = messages[0][1][0][1][b'data'].decode()
            if message == "[END]":
                print("Hit end of messages")
                break
            if current_message_id == last_message_id:
                continue
            last_message_id = messages[0][1][0][0].decode()
            if message:
                yield message
            
        
    # if task.status == "SUCCESS":
    #     return task.result
    #     return {'status': task.status}
    return StreamingResponse(generator(), media_type="text/event-stream")


def get_chunks(s, maxlength):
    import random
    start = 0
    end = 0
    while start < len(s):
        end = start + random.randrange(4, maxlength) + 1
        yield s[start:end]
        start = end
    yield s[start:]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app)