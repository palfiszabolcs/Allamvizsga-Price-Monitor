from dataclasses import dataclass


@dataclass
class UtilProduct:
    category: str
    check: dict
    currency: str
    image: str
    name: str
    url: str
