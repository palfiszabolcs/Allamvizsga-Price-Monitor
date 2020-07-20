from dataclasses import dataclass


@dataclass
class UtilProduct:
    check: dict
    currency: str
    image: str
    name: str
    url: str
