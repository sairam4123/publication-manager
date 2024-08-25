import asyncio
import pandas
import scholarly

async def get_author_publications_scholarly(name, publication_type, from_year, to_year):
    author = scholarly.scholarly.search_author(name)
    author = next(author)
    author = author.fill()
    publications = []
    for publication in author.publications:
        if from_year <= publication.bib['year'] <= to_year:
            publications.append({
                'title': publication.bib['title'],
                'venue': publication.bib['journal'],
                'year': publication.bib['year'],
                'url': publication.bib['url'],
                'type': publication.bib['type'],
            })
    return publications


async def main(input_file, output_file):
    dataset = pandas.read_excel(input_file, 'Sheet1').to_dict('records')
    tasks: list[asyncio.Task] = []
    for datum in dataset:
        name, publication_type = datum['Name'], get_publication_type(datum['Type'])

        author_publications = asyncio.create_task(get_author_publications_scholarly(name, publication_type, 2020, 2024))
        tasks.append(author_publications)
    
    author_publications = await asyncio.gather(*tasks)

    result = pandas.DataFrame(post_process_publications(dataset, author_publications))
    result.to_excel(output_file, index=False, header=False)
 