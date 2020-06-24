from dataclasses import dataclass


@dataclass
class ProductData:
    title: str
    price: float
    currency: str
    image: str
