from dataclasses import dataclass
from Classes.class_UtilProduct import UtilProduct


@dataclass
class Product:
    product_id: str
    product_data: UtilProduct
