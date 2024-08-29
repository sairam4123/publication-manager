import json
import random
import aiohttp
import pandas
import asyncio
import datetime

def get_publication_type(publication_type):
    publication_type = publication_type.lower()
    if publication_type.startswith('journal'):
        publication_type = ':Journal_Articles:'
    elif publication_type.startswith('conference'):
        publication_type = ':Conference_and_Workshop_Papers:'
    elif publication_type.startswith('all'):
        publication_type = ''
    return publication_type


async def get_author_publications_dblp(name, publication_type, from_year, to_year):
    print("Fetching publications for", name, publication_type)
    url = f'https://dblp.org/search/publ/api?q={name}{f'%20type{publication_type}' if publication_type != '' else ''}&h=1000&format=json'
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            data = json.loads(await response.text())
    result = data['result']
    hits = int(result['hits']['@sent'])
    with open('data.json', 'w') as f:
        f.write(json.dumps(data, indent=4))
    publication_records = []
    for i in range(hits):
        try:
            author_infos = result['hits']['hit'][i]['info']['authors']['author']
        except KeyError:
            print(result['hits']['hit'][i]['info'])
        for author_info in author_infos:
            if isinstance(author_info, str):
                author_info = author_infos
            if author_info.get('text', None) == name:
                publication_record = {
                'title': result['hits']['hit'][i]['info']['title'],
                'venue': result['hits']['hit'][i]['info']['venue'],
                'year': int(result['hits']['hit'][i]['info']['year']),
                'url': result['hits']['hit'][i]['info']['url'],
                'type': result['hits']['hit'][i]['info']['type'],
            }
                if int(from_year) <= int(publication_record['year']) <= int(to_year):
                    publication_records.append(publication_record)
    return publication_records


async def search_author(name: str):
    print("Fetching authors matching... {name}")
    url = f'https://dblp.org/search/author/api?q={name}&h=1000&format=json'
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            data = json.loads(await response.text())

    result = data['result']
    hits = int(result['hits']['@sent'])

    authors = []
    for i in range(hits):
        author_name = result['hits']['hit'][i]['info']['author']
        print(author_name)
        authors.append(author_name)
    
    return authors


def post_process_publications(author_dataset, publications: list[list]):
    result = [["Author", "Title", "Venue", "Year", "URL", "Type"]]
    for idx, author_data in enumerate(author_dataset):
        for publication in publications[idx]:
            result.append([
                author_data.get("Name", author_data.get("author_name", None)), 
                publication['title'], 
                publication['venue'], 
                publication['year'], 
                publication['url'], 
                publication['type']
            ])
    return result

async def main(input_file, output_file):
    dataset = pandas.read_excel(input_file, 'Sheet1').to_dict('records')
    tasks: list[asyncio.Task] = []
    for datum in dataset:
        name, publication_type, from_year, to_year = datum['Name'], get_publication_type(datum.get('Type', 'all')), datum.get('From', 1970), datum.get('To', datetime.datetime.now().year)

        author_publications = asyncio.create_task(get_author_publications_dblp(name, publication_type, from_year, to_year))
        tasks.append(author_publications)
        sleep_time = abs(0.1 + random.uniform(-0.1, 0.2))
        await asyncio.sleep(sleep_time) # to avoid getting blocked by the server
    
    author_publications = await asyncio.gather(*tasks)

    result = pandas.DataFrame(post_process_publications(dataset, author_publications))
    result.to_excel(output_file, index=False, header=False)
 
async def process_single(query: dict):
    name, publication_type, from_year, to_year = query['author_name'], get_publication_type(query.get('publication_type', 'all')), query.get('from_year', 1970), query.get('to_year', datetime.datetime.now().year)
    author_publications = await get_author_publications_dblp(name, publication_type, from_year, to_year)
    result = post_process_publications([query], [author_publications])
    return result

async def process_search_author(query: str):
    return await search_author(query)