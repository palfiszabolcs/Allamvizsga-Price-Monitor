import logging
from configparser import ConfigParser
from logging.config import fileConfig
import firebase_admin
from firebase_admin import credentials

fileConfig('logging_config.ini')
logger = logging.getLogger()

config_file = "config.ini"
config = ConfigParser()
config.read(config_file)

cred = credentials.Certificate(config['firebase']['admin_credential_file'])
admin = firebase_admin.initialize_app(cred)

database = config["firebase"]["database"]
USERS = config["database"]["users_section"]
NEW = config["database"]["new_product_section"]
CHECK = config["database"]["check_section"]
ERROR = config["database"]["ERROR_section"]

error = "error"
image_error = "image"
title_error = "title"


def update_config(new_config):
    with open(config_file, "w") as file:
        file.write(new_config)
    file.close()
    config.read(config_file)
    logger.info("Config file updated!")
