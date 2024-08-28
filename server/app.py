import time

from fastapi import FastAPI, Response, UploadFile
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from celery import Celery

from supabase import create_client

from models import CustomizedQueryModel


celery = Celery(__name__, broker="redis://localhost:6379/0", backend="redis://localhost:6379/0")
celery.conf.broker_connection_retry_on_startup = True

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
    out_file = task.result
    file = sp_client.storage.from_("excel-storage") \
        .download(out_file)
    
    # upload file
    return Response(file, media_type="application/octet-stream", headers={"Content-Disposition": f"attachment; filename={out_file}"})


@app.post("/tasks/customized")
def run_customized_query(query: CustomizedQueryModel):
    task = celery.send_task("main.process_customized_query", args=[query.model_dump()])
    return {"task_id": task.id}

@app.get("/tasks/customized/{task_id}/result")
def run_customized_query_result(task_id: str):
    task = celery.AsyncResult(task_id)
    print(task.result)
    return task.result

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



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app)