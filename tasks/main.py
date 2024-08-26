import time
import io

from celery import current_app as celery
from supabase import create_client
from scraper import main as task_dblp

sp_client = create_client("https://xchmpfivomtlnslvbbbk.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjaG1wZml2b210bG5zbHZiYmJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQ2MDI4MDYsImV4cCI6MjA0MDE3ODgwNn0.HBs-xlJW21awsjyS5mje25g3Wu5M_TGFc2T7Q6urXLw")


import pathlib
pathlib.Path("temp/files/").mkdir(parents=True, exist_ok=True)



@celery.task
def process_excel(in_file: str):
    import asyncio
    cur_time = int(time.time())
    out_file = f"output-{cur_time}.xlsx"
    sp_client.auth.get_session()

    print(f"Starting background task... {in_file}")

    with io.BytesIO() as in_buffer, io.BytesIO() as out_buffer:
        in_buffer.write(sp_client.storage.from_("excel-storage").download(in_file))
        asyncio.run(task_dblp(in_buffer, out_buffer))
        sp_client.storage.from_("excel-storage").upload(out_file, out_buffer.getvalue()) # upload requires bytes not bytesIO
    return out_file

@celery.task
def process_excel_storage(in_filename: str):
    import asyncio
    cur_time = int(time.time())
    out_file = f"output-{cur_time}.xlsx"

    abs_in_path = f"temp/files/{in_filename}"
    abs_out_path = f"temp/files/{out_file}"

    print(f"Starting background task... {in_filename}")
    with open(abs_in_path, "wb") as buffer:
        buffer.write(sp_client.storage.from_("excel-storage").download(in_filename))

    asyncio.run(task_dblp(abs_in_path, abs_out_path))
    sp_client.storage.from_("excel-storage") \
        .upload(out_file, open(abs_out_path, "rb"))
    return out_file

@celery.task
def process_scholarly(filename: str):
    from .scraper_scholarly import main as task
    import asyncio
    print(f"Starting background task... {filename}")
    asyncio.run(task(filename, "temp/files/output.xlsx"))
    return "temp/files/output.xlsx"
