from pydantic import BaseModel


class CustomizedQueryModel(BaseModel):
    author_name: str
    publication_type: str
    from_year: int
    to_year: int
