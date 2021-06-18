from urllib.request import urlopen
import requests
from bs4 import BeautifulSoup
from dacite import from_dict
from firebase import firebase as fb
from firebase_admin import db as admin_db
from datetime import datetime
import schedule
import time
import logging
from logging.config import fileConfig

import Classes.class_FirebaseResponse
from Classes.class_ProductData import ProductData
from Util import constants, util_functions as util
import webbrowser

import sys
from PyQt5.QtWidgets import *
from PyQt5.QtGui import *
from PyQt5.QtCore import *

from pygtail import Pygtail

fileConfig('logging_config.ini')
logger = logging.getLogger()


def make_request(url):
    html_content = None
    try:
        html_content = requests.get(url, timeout=int(constants.config["connection"]["timeout"])).text
    except (requests.RequestException, requests.ConnectionError, requests.Timeout) as error:
        logging.critical("!!! request error !!! - " + str(error) + " | full url - " + url)
        for count in range(1, 6, 1):
            for seconds in range(5, 0, -1):
                logger.info("Retrying in... " + str(seconds) + " seconds")
                time.sleep(1)
            try:
                html_content = requests.get(url, timeout=int(constants.config["connection"]["timeout"])).text
                return html_content
            except (requests.RequestException, requests.ConnectionError, requests.Timeout) as error:
                logging.critical("retry no. " + str(count))
    return html_content


def get_url_info(url):
    html_content = make_request(url)
    if html_content is None:
        logging.critical("!!! request failed multiple times !!! - " + str(url))
        return ProductData(constants.error, constants.error, constants.error, constants.error)
    soup = BeautifulSoup(html_content, "html.parser")
    is_captcha_on_page = soup.find("div", attrs={"class": "g-recaptcha"}) is not None
    if is_captcha_on_page:
        logger.critical("!!! CAPTCHA !!!")
        message = input("\nValidate CAPTCHA then type k to continue... ")
        if message == "k":
            html_content = requests.get(url).text
            soup = BeautifulSoup(html_content, "html.parser")

    address = util.get_site_address(url)

    if address == constants.config["supported"]["emag"]:
        return util.get_and_parse_emag(soup)

    if address == constants.config["supported"]["flanco"]:
        return util.get_and_parse_flanco(soup)

    if address == constants.config["supported"]["quickmobile"]:
        return util.get_and_parse_quickmobile(soup)


def push_new_data_to_db(user, url):
    logger.info("Pushing to database")
    data = get_url_info(url)

    if data.title is constants.error:
        logger.warning("Found title error! - " + url)
        util.upload_error(user, "new_product", datetime.now(), url, constants.title_error)
    if data.image is constants.error:
        logger.warning("Found image error! - " + url)
        util.upload_error(user, "new_product", datetime.now(), url, constants.image_error)

    firebase = fb.FirebaseApplication(constants.database, None)

    product_data = {
        'url': url,
        'name': data.title,
        'currency': data.currency,
        'image': data.image,
    }

    response = firebase.post(constants.USERS + user, product_data)
    prod_id = from_dict(Classes.class_FirebaseResponse.FireBaseResponse, response).name

    check_data = {
        'price': data.price,
        'date': datetime.today()
    }
    response_check = firebase.post(constants.USERS + user + "/" + prod_id + constants.CHECK, check_data)

    return prod_id


def delete_user(user):
    firebase = fb.FirebaseApplication(constants.database, None)
    delete_result = firebase.delete(constants.NEW, user)
    return delete_result


# goes over all new users or existing users who added new products and ads them to the main USERS folder
def update_users_new_products():
    users_list = util.get_new_users()
    if users_list == "none":
        logger.info("No new product to add")
        return 0
    logger.info("Adding new product")

    for user in users_list:
        users_product_list = util.make_new_product_list(user)
        for item in users_product_list:
            push_new_data_to_db(user, item.product.url)
        logger.info("Product added to " + user + "'s list")
        delete_result = delete_user(user)


def update_prices():
    webbrowser.open("https://www.emag.ro")
    users_list = util.get_existing_users()
    logger.info("Updating prices")
    for user in users_list:
        users_product_list = util.make_product_list(user)
        for item in users_product_list:
            product_data = get_url_info(item.product_data.url)
            if product_data.price is constants.error:
                logger.info("Updated - No stock | " + item.product_data.name)
            else:
                logger.info("Updated | " + item.product_data.name)

            if product_data.title is constants.error:
                logger.warning("Found title error! - " + item.product_data.url)
                util.upload_error(user, item.product_id, datetime.now(), item.product_data.url, constants.title_error)
            if product_data.image is constants.error:
                logger.warning("Found image error! - " + item.product_data.url)
                util.upload_error(user, item.product_id, datetime.now(), item.product_data.url, constants.image_error)

            res = util.upload_check_data(user, item.product_id, product_data.price, datetime.now())

            # in the afternoon we risk to get time-out, so we wait between requests
            # now = datetime.now().hour
            # if now > 17:
            #     time.sleep(20)

            time.sleep(int(constants.config["request_delay"]["delay"]))

        logger.info("Updated " + user + "'s products")
    logger.info("Finished updating all products")


def listener_handler(event):
    if event.data:
        update_users_new_products()
    else:
        logger.info("Listener event - no data")


def run_new_products_listener():
    try:
        admin_db.reference(constants.NEW, None, constants.database).listen(listener_handler)
    except admin_db.exceptions.FirebaseError as error:
        logging.critical("Can not start listener - " + str(error))
        for i in range(5, 0, -1):
            logger.info("Retrying in... " + str(i) + " seconds")
            time.sleep(1)
        return run_new_products_listener()


def stop_new_products_listener():
    admin_db.reference(constants.NEW, None, constants.database).delete()
    logger.critical("Stopping database listener!")


def internet_on():
    try:
        urlopen('https://www.google.com/', timeout=10)
    except:
        logging.critical("No Internet connection! - Service failed - Restarting")
        stop_new_products_listener()
        # run_program(0)


def update_display(qt_signal):
    qt_signal.emit("")


main_scheduler = schedule.Scheduler()
qt_scheduler = schedule.Scheduler()


def run_scheduled_tasks():
    main_scheduler.every().second.do(internet_on)
    main_scheduler.every().day.at('10:00').do(update_prices)
    main_scheduler.every().day.at('18:00').do(update_prices)
    while True:
        try:
            main_scheduler.run_pending()
            time.sleep(1)
        except Exception as error:
            logging.critical("CAN NOT RUN SCHEDULED TASKS - " + str(error))
            input("Please check the error before continuing...")
            for i in range(5, 0, -1):
                logger.info("Retrying in... " + str(i) + " seconds")
                time.sleep(1)


def run_qt_display_scheduler(qt_signal):
    qt_scheduler.every().second.do(update_display, qt_signal)
    while True:
        try:
            qt_scheduler.run_pending()
            time.sleep(1)
        except Exception as error:
            logging.critical("CAN NOT RUN SCHEDULED TASKS - QT - " + str(error))
            for i in range(5, 0, -1):
                logger.info("Retrying in... " + str(i) + " seconds")
                time.sleep(1)


# def run_program(mode):
#     try:
#         if mode is None:
#             print("\nChoose running mode:\n"
#                   "     1 - Continuous (Will run scheduled tasks and start all listeners)\n"
#                   "     2 - Update (Will update all products then resume in Continuous mode)\n")
#             mode = int(input("Mode: "))
#
#         if (mode != 0) and (mode != 1) and (mode != 2):
#             print("Invalid option, please select again!")
#             return run_program(None)
#         else:
#             if mode == 0:
#                 logger.info("Restarting due to No Internet Connection")
#                 run_new_products_listener()
#
#             if mode == 1:
#                 logger.info("Starting in CONTINUOUS mode")
#                 run_new_products_listener()
#                 run_scheduled_tasks()
#             if mode == 2:
#                 logger.info("Starting in UPDATE mode")
#                 update_prices()
#                 logger.info("All products updated, starting CONTINUOUS mode!")
#                 run_new_products_listener()
#                 run_scheduled_tasks()
#     except Exception as error:
#         logging.critical("Error while starting service!" + str(error))
#         for i in range(5, 0, -1):
#             logger.info("Retrying in... " + str(i) + " seconds")
#             time.sleep(1)
#         return run_program(mode)

def run_sec(n):
    for i in range(0, n):
        logger.info("schedule blocking test")
        time.sleep(2)


def run_program_qt_test(mode):
    try:
        if mode is None:
            print("\nChoose running mode:\n"
                  "     1 - Continuous (Will run scheduled tasks and start all listeners)\n"
                  "     2 - Update (Will update all products then resume in Continuous mode)\n")
            mode = int(input("Mode: "))

        if (mode != 0) and (mode != 1) and (mode != 2):
            print("Invalid option, please select again!")
            return run_program_qt_test(None)
        else:
            if mode == 0:
                logger.info("Restarting due to No Internet Connection")
                run_new_products_listener()

            if mode == 1:
                logger.info("Starting in CONTINUOUS mode")
                run_new_products_listener()
                run_scheduled_tasks()
                # run_qt_display_scheduler(qt_signal)
            if mode == 2:
                logger.info("Starting in UPDATE mode")
                update_prices()
                # run_sec(10)
                logger.info("All products updated, starting CONTINUOUS mode!")
                # qt_signal.emit("update_done")
                run_new_products_listener()
                run_scheduled_tasks()
                # run_qt_display_scheduler(qt_signal)
    except Exception as error:
        logging.critical("Error while starting service!" + str(error))
        for i in range(5, 0, -1):
            logger.info("Retrying in... " + str(i) + " seconds")
            time.sleep(1)
        return run_program_qt_test(mode)
# ############################################ - MAIN - ####################################################


# run_program(None)


# ############################################ - TEST BENCH - ####################################################
class SettingsWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Price Monitor - Settings")
        self.setMinimumWidth(600)
        self.setMinimumHeight(600)
        config_file = open(constants.config_file)
        text = "" . join(config_file.readlines())
        config_file.close()
        self.config_edit = QTextEdit()
        self.config_edit.setFont(QFont('Times', 15))
        self.config_edit.setText(text)

        self.button_save = QPushButton("Save", self)
        self.button_save.setMinimumHeight(50)
        self.button_save.setMinimumWidth(100)
        self.button_save.setFont(QFont('Times', 20))
        self.button_save.setStyleSheet("QPushButton{color: rgb(0,153,0);background-color: white;border: 2px solid rgb(0,153,0);border-radius: 10px;}QPushButton::disabled{color: white;background-color: rgb(169,169,169);border: 2px solid rgb(169,169,169);border-radius: 10px;}QPushButton::hover{color: white;background-color: rgb(0,153,0);border-radius: 10px;}")
        self.button_save.pressed.connect(self.update_config)

        main_layout = QVBoxLayout()
        main_layout.addWidget(self.config_edit)
        main_layout.addWidget(self.button_save)
        widget = QWidget()
        widget.setLayout(main_layout)
        self.setCentralWidget(widget)

    def update_config(self):
        constants.update_config(self.config_edit.toPlainText())
        self.close()


class Window(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Price Monitor - Admin")
        self.setMinimumWidth(1000)
        self.setMinimumHeight(600)
        self.worker = WorkerThread()
        self.display_schedule_worker = DisplayWorker()
        self.display_schedule_worker.qt_signal.connect(self.update_display)
        self.display_schedule_worker.start()

        self.display = QTextEdit()
        self.display.setReadOnly(True)
        self.display.setFont(QFont('Times', 10))
        self.display.setTextColor(QColor(255, 255, 255))
        self.display.setStyleSheet("background-color: rgb(0, 0, 0);border-radius: 10px")

        self.button_start = QPushButton("Start", self)
        self.button_start.setMinimumHeight(50)
        self.button_start.setMinimumWidth(100)
        self.button_start.setFont(QFont('Times', 20))
        self.button_start.setStyleSheet("QPushButton{color: rgb(0,153,0);background-color: white;border: 2px solid rgb(0,153,0);border-radius: 10px;}QPushButton::disabled{color: white;background-color: rgb(169,169,169);border: 2px solid rgb(169,169,169);border-radius: 10px;}QPushButton::hover{color: white;background-color: rgb(0,153,0);border-radius: 10px;}")
        self.button_start.pressed.connect(self.start)

        self.button_stop = QPushButton("Stop", self)
        self.button_stop.setMinimumHeight(50)
        self.button_stop.setMinimumWidth(100)
        self.button_stop.setFont(QFont('Times', 20))
        self.button_stop.setStyleSheet("QPushButton{color: rgb(204,0,0);background-color: white;border: 2px solid rgb(204,0,0);border-radius: 10px;}QPushButton::disabled{color: white;border: 2px solid rgb(169,169,169);background-color: rgb(169,169,169);border-radius: 10px;}QPushButton::hover{color: white;background-color: rgb(204,0,0);border-radius: 10px;}")
        self.button_stop.setDisabled(True)
        self.button_stop.pressed.connect(self.stop)

        self.button_update = QPushButton("Update", self)
        self.button_update.setMinimumHeight(50)
        self.button_update.setMinimumWidth(100)
        self.button_update.setFont(QFont('Times', 20))
        self.button_update.setStyleSheet("QPushButton{color: rgb(0,0,204);background-color: white;border: 2px solid rgb(0,0,204);border-radius: 10px;}QPushButton::disabled{color: white;background-color: rgb(169,169,169);border: 2px solid rgb(169,169,169);border-radius: 10px;}QPushButton::hover{color: white;background-color: rgb(0,0,204);border-radius: 10px;}")
        self.button_update.pressed.connect(self.update)

        self.button_settings = QToolButton()
        self.button_settings.setToolButtonStyle(Qt.ToolButtonIconOnly)
        self.button_settings.setIcon(QIcon("settings.png"))
        self.button_settings.setIconSize(QSize(50, 50))
        self.button_settings.pressed.connect(self.settings)

        main_layout = QVBoxLayout()
        button_layout = QHBoxLayout()
        button_layout.addWidget(self.button_start)
        button_layout.addWidget(self.button_stop)
        button_layout.addWidget(self.button_update)
        button_layout.addWidget(self.button_settings)
        main_layout.addLayout(button_layout)
        main_layout.addWidget(self.display)
        widget = QWidget()
        widget.setLayout(main_layout)
        self.setCentralWidget(widget)
        self.show()

    def start(self):
        self.worker.mode = 1
        self.worker.start()
        self.button_start.setDisabled(True)
        self.button_update.setDisabled(True)
        self.button_stop.setDisabled(False)

    def stop(self):
        self.worker.terminate()
        logger.critical("Stopped execution!")
        self.update_display("")
        self.button_start.setDisabled(False)
        self.button_stop.setDisabled(True)
        self.button_update.setDisabled(False)

    def update(self):
        self.worker.mode = 2
        self.worker.start()
        self.button_start.setDisabled(True)
        self.button_update.setDisabled(True)
        self.button_stop.setDisabled(False)

    def settings(self):
        self.settings_window = SettingsWindow()
        self.settings_window.show()

    def update_display(self, message):
        if message == "All products updated, starting CONTINUOUS mode!":
            self.button_update.setDisabled(True)
            self.button_start.setDisabled(True)
            self.button_stop.setDisabled(False)
        last_line = str(Pygtail("control.log", read_from_end=True).read())
        if last_line != "None":
            self.display.append(last_line.strip())


class DisplayWorker(QThread):
    qt_signal = pyqtSignal(str)

    def run(self):
        run_qt_display_scheduler(self.qt_signal)


class WorkerThread(QThread):
    mode = None

    def run(self):
        run_program_qt_test(self.mode)


App = QApplication(sys.argv)
window = Window()
App.exec()

# sys.exit(App.exec())

# run_sec(10)
# print(constants.config["quick_image"]["attribute_value"])

# print(constants.config["emag_title"]["tag"])





# bad_url1 = "https://www.flanco.ro/apple-watch-series-5-gps-44mm-space-grey-aluminium-case-black-sport-band.html"
# bad_url2 = "https://altex.ro/boxe-audio-5-0-jamo-s-628-hcs-negru/cpd/BOXS628HCSBA/"
# url = "https://www.quickmobile.ro/entertainment/boxe-portabile/harman-kardon-boxa-portabila-onyx-studio-6-albastru-206775"
# url = "https://www.emag.ro/laptop-ultraportabil-asus-vivobook-s14-s431fa-cu-procesor-intelr-coretm-i5-8265u-pana-la-3-90-ghz-whiskey-lake-14-full-hd-8gb-512gb-ssd-intel-uhd-graphics-620-cobalt-blue-s431fa-eb109/pd/D7FJBBMBM/?X-Search-Id=7836a5027a92fd6c970e&X-Product-Id=6379059&X-Search-Page=1&X-Search-Position=0&X-Section=search&X-MB=0&X-Search-Action=view"
# url1 = "https://www.emag.ro/laptop-asus-ux434fa-cu-procesor-intelr-coretm-i5-10210u-pana-la-4-20-ghz-14-0-full-hd-8gb-512gb-ssd-intel-uhd-graphics-620-windows-10-home-royal-blue-ux434fac-a5099t/pd/DCXTCMMBM/?ref=similar_products_7_7&provider=rec&recid=rec_4_6b697c07a21e33ab60b4a81989fb18624f7cdd306cbd29da3b035a1d7564486f_1598535173&scenario_ID=4"
# url2 = "https://www.emag.ro/masina-electrica-de-tuns-gazonul-bosch-arm-32-3200-1200w-32cm-sac-31l-0600885b03/pd/DD8TVMBBM/?ref=prod_CMP-62795_5759_66266"
# url3 = "https://www.flanco.ro/apple-watch-series-5-gps-44mm-silver-aluminium-case-white-sport-band.html"
# url4 = "https://www.flanco.ro/televizor-smart-led-samsung-ue50tu8072-125-cm-ultra-hd-4k.html"
# url5 = "https://www.emag.ro/laptop-ultraportabil-huawei-matebook-14-cu-procesor-amd-ryzen-5-4600h-pana-la-4-00-ghz-14-2k-16gb-512gb-ssd-amd-radeon-graphics-windows-10-home-gray-53011gsl/pd/D0S8F2MBM/?ref=graph_profiled_similar_a_1_6&provider=rec&recid=rec_49_16_c2732421_91_A_1517324c2705b459d50c09a7baac7b896babac44682d2ccc365f0110b5e2b416_1602743842&scenario_ID=49"
# url6 = "https://altex.ro/televizor-led-smart-samsung-43tu7172-ultra-hd-4k-hdr-108-cm/cpd/UHDUE43TU7172UX/"
# url7 = "https://mediagalaxy.ro/laptop-gaming-lenovo-legion-5-17imh05-intel-core-i5-10300h-pana-la-4-5ghz-17-3-full-hd-8gb-ssd-512gb-nvidia-geforce-gtx-1650-4gb-free-dos-negru/cpd/LAP82B3002SRM/"
# url8 = "https://www.emag.ro/boxa-portabila-jbl-charge-3-6000-mah-rosu-charge3red/pd/DCQG32BBM/#used-products"
# url9 = "https://www.emag.ro/laptop-hp-15-15s-fq1010nq-cu-procesor-intelr-coretm-i3-1005g1-pana-la-3-40-ghz-15-6-full-hd-8gb-256gb-ssd-intel-uhd-graphics-free-dos-gray-9qf69ea/pd/DH33MMMBM/?X-Search-Id=3a0b52475c2c4e7d900d&X-Product-Id=66367719&X-Search-Page=1&X-Search-Position=3&X-Section=search&X-MB=0&X-Search-Action=view"


# url1 = "https://www.emag.ro/"
# url2 = "https://www.flanco.ro/"
# url3 = "https://www.quickmobile.ro/"
# url4= "https://www.emag.ro/puma-pantofi-unisex-pentru-alergare-rs-x-bold/fd/1909695/?ref=graph_profiled_similar_1_2&provider=rec&recid=rec_49_2c05649a061f7f811d5ea78af1d990d939ddc08bd4edcc09285e47ff15884a39_1613986274&scenario_ID=49"
# test = get_url_info("https://www.flanco.ro/televizor-smart-led-lg-55un71003lb-138-cm-ultra-hd-4k.html")
# test.title = "Valami"
# if (test.title is constants.error) or (test.image is constants.error):
#     logger.critical("none")
# print(test)


# html_content = requests.get("https://patrickhlauke.github.io/recaptcha/").text
# # print(html_content)
# soup = BeautifulSoup(html_content, "html.parser")
# # print(soup)



# price = soup.find("span", attrs={"class": "label-out_of_stock"})
# print(price)



# ############################################ - TEST BENCH - ####################################################

