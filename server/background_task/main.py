from celery import current_app as celery

@celery.task
def process_excel(filename: str):
    from .scraper import main as task
    import asyncio
    print(f"Starting background task... {filename}")
    asyncio.run(task(filename, "temp/files/output.xlsx"))
    return "temp/files/output.xlsx"