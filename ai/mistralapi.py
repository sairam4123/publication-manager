import os
from mistralai import Mistral
from io import StringIO
from dotenv import load_dotenv
import text_io

load_dotenv()

# Dictionary to store model options and their API names
MODEL_OPTIONS = {
    "Mistral Nemo": "open-mistral-nemo-2407",
    # "Mistral Large 2": "mistral-large-2407",
    "Codestral": "codestral-2405",
    "Mistral Embed": "mistral-embed",
    "Mistral 7B": "open-mistral-7b",
    "Mixtral 8x7B": "open-mixtral-8x7b",
    "Mixtral 8x22B": "open-mixtral-8x22b",
    "Mistral Small": "mistral-small-latest",
    "Mistral Medium": "mistral-medium-latest"
}

def get_api_key():
    if not os.environ.get("MISTRAL_API_KEY", None):
        with open("/run/secrets/mistral_ai_key", 'r') as f:
            return f.read().strip()
    return os.environ.get("MISTRAL_API_KEY")

def initialize_client(api_key):
    return Mistral(api_key=api_key)

def construct_prompt(publications_file_path):
    base_prompt = (
        "Summarize the following publications of the authors. Analyze their expertise, "
        "the significance of the studies, and provide insights based on the titles and venues. "
        "The summary should be detailed, comprehensive, and suitable for presentation. "
        "Use paragraphs and avoid repetition. "
        "Use headings to separate the summaries of different authors. "
        "\n\n"
    )
    
    publication_data = text_io.read_large_file(publications_file_path)
    return base_prompt + publication_data

def generate_summary(client, model, prompt):
    response = client.chat.complete(
        model=model,
        messages=[
            {"role": "user", "content": prompt}
        ]
    )
    return response.choices[0].message.content

def main(in_buffer: StringIO, out_buffer: StringIO):
    # User can choose a model from MODEL_OPTIONS
    selected_model_name = "Mistral Nemo"  # Change this to select a different model
    model_name = MODEL_OPTIONS[selected_model_name]

    api_key = get_api_key()
    if not api_key:
        raise ValueError("MISTRAL_API_KEY not set in .env file.")
    
    client = initialize_client(api_key)
    
    prompt = construct_prompt(in_buffer)
    summary = generate_summary(client, model_name, prompt)
    
    # save_summary_to_file(summary, out_buffer)
    out_buffer.write(summary)

def async_main(in_buffer: StringIO, out_buffer: StringIO):
    selected_model_name = "Mistral Nemo"  # Change this to select a different model
    model_name = MODEL_OPTIONS[selected_model_name]
    
    api_key = get_api_key()
    if not api_key:
        raise ValueError("MISTRAL_API_KEY not set in .env file.")
    
    client = Mistral(api_key=api_key)
    prompt = construct_prompt(in_buffer)
    completion = client.chat.stream(
        # max_tokens=2**32,
        model=model_name,
        messages=[
            {"role": "user", "content": prompt}
        ],
    )
    for chunk in completion:
        content = chunk.data.choices[0].delta.content
        out_buffer.write(content)
        yield content
    

if __name__ == "__main__":
    main()
