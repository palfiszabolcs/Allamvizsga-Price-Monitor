from configparser import ConfigParser
import firebase_admin
from firebase_admin import credentials

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
LOG_FORMAT = "%(levelname)s | %(filename)s | %(asctime)s | %(message)s |"

emag = config["supported"]["emag"]
flanco = config["supported"]["flanco"]
quickmobile = config["supported"]["quickmobile"]
