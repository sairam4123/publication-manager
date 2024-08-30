import os

def read_large_file(file, chunk_size=1024*1024):
    content = []

    while True:
        chunk = file.read(chunk_size)
        if not chunk:
            break
        content.append(chunk)
    
    return ''.join(content)

def write_paragraph_to_file(paragraph, directory='text'):
    if not os.path.exists(directory):
        os.makedirs(directory)

    existing_files = os.listdir(directory)
    file_numbers = [
        int(file_name.replace('text', '').replace('.txt', ''))
        for file_name in existing_files
        if file_name.startswith('text') and file_name.endswith('.txt')
    ]

    next_number = max(file_numbers) + 1 if file_numbers else 0

    file_name = f"text{next_number}.txt"
    file_path = os.path.join(directory, file_name)

    with open(file_path, 'w', encoding='utf-8') as file:
        file.write(paragraph)

    print(f"Paragraph written to {file_path}")
