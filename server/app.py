

from fastapi import FastAPI, UploadFile
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from celery import Celery

celery = Celery(__name__, broker="redis://localhost:6379/0", backend="redis://localhost:6379/0")

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
    # download file
    filename = "temp/files/" + file.filename
    with open(filename, "wb") as buffer:
        buffer.write(file.file.read())
    task = celery.send_task("background_task.main.process_excel", args=[filename])
    return {"task_id": task.id}

@app.get("/tasks/{task_id}/status")
def task_status(task_id: str):
    task = celery.AsyncResult(task_id)
    return {"status": task.status}

@app.get("/tasks/{task_id}/result")
def task_result(task_id: str):
    task = celery.AsyncResult(task_id)
    # upload file
    return FileResponse(task.result, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", filename="output.xlsx")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app)