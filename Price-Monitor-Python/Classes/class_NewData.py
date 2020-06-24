from dataclasses import dataclass
from Classes.class_UtilNewData import UtilNewData


@dataclass
class NewData:
    user: str
    product: UtilNewData
