import os
from mistralai import Mistral
import asyncio
import text_io
from io import StringIO

from dotenv import load_dotenv
load_dotenv()

# Ensure the os module is imported
api_key = os.environ["MISTRAL_API_KEY"]
model = "open-mistral-nemo-2407"

client = Mistral(api_key=api_key)


async def main():
    string = StringIO()
    # Calling the async method inside an async function
    async_response = client.chat.stream(
        model=model,
        messages=[
            {
                "role": "user", 
                "content": "Who is the best French painter?",
            },
        ]
    )

    # Using async for loop inside an async function
    
    for chunk in async_response: 
        print(chunk.data.choices[0].delta.content, end="", flush=True)
        #text_io.write_paragraph_to_file(chunk.data.choices[0].delta.content)

# Run the async function using asyncio
asyncio.run(main())
